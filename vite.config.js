import { defineConfig, build } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

// After the build, renders every public page listed in src/seo.js to plain
// HTML (dist/<path>.html, and dist/index.html for the homepage), each with its
// own title, description and canonical link. Search engines and link previews
// get the full page text straight away; the React app then mounts over it as
// usual. Also writes dist/sitemap.xml. The untouched app shell is kept as
// dist/spa.html, which vercel.json serves for any other path.
function prerenderPages() {
  return {
    name: 'prerender-pages',
    apply: 'build',
    async closeBundle() {
      // Build the app once more for Node so it can be rendered here. recharts
      // hangs when imported under Node, so it is swapped for components that
      // render nothing (charts fill in once the live app loads).
      const rechartsStub = {
        name: 'recharts-stub',
        enforce: 'pre',
        resolveId: (id) => (id === 'recharts' ? '\0recharts-stub' : null),
        load: (id) => (id === '\0recharts-stub'
          ? { code: 'export default new Proxy({}, { get: () => () => null });', syntheticNamedExports: true }
          : null),
      }
      const ssrDir = resolve('node_modules/.page-prerender')
      await build({
        configFile: false,
        logLevel: 'error',
        plugins: [rechartsStub, react()],
        build: { ssr: 'src/prerender-entry.js', outDir: ssrDir, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'entry.mjs' } } },
      })
      const { renderPage, SEO_PAGES, sitemapPaths, seoHeadHtml, SITE_URL } = await import(`${pathToFileURL(resolve(ssrDir, 'entry.mjs')).href}?t=${Date.now()}`)

      const outDir = resolve('dist')
      const template = await readFile(resolve(outDir, 'index.html'), 'utf8')
      const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/
      const SHELL_BLOCK = /<!--static-shell-->[\s\S]*?<!--\/static-shell-->/
      if (!SEO_BLOCK.test(template) || !SHELL_BLOCK.test(template)) throw new Error('index.html is missing the <!--seo--> or <!--static-shell--> markers')

      // Fallback shell for any path without its own page. Kept out of search.
      await writeFile(resolve(outDir, 'spa.html'), template.replace(SEO_BLOCK, () => seoHeadHtml('/__not-a-page')))

      for (const path of Object.keys(SEO_PAGES)) {
        const body = renderPage(path)
        if (body.length < 1500 || !body.includes('Privacy Policy')) throw new Error(`prerendered ${path} looks incomplete`)
        const html = template.replace(SEO_BLOCK, () => seoHeadHtml(path)).replace(SHELL_BLOCK, () => body)
        const file = path === '/' ? 'index.html' : `${path.slice(1)}.html`
        await mkdir(dirname(resolve(outDir, file)), { recursive: true })
        await writeFile(resolve(outDir, file), html)
      }

      const today = new Date().toISOString().slice(0, 10)
      const urls = sitemapPaths().map(({ path, priority }) =>
        `  <url>\n    <loc>${SITE_URL}${path === '/' ? '/' : path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`)
      await writeFile(resolve(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
    },
  }
}

export default defineConfig({
  plugins: [react(), prerenderPages()],
})
