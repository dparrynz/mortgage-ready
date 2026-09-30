import { defineConfig, build } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// After the build, renders the in-app PrivacyPage and TermsPage components
// into dist/privacy.html and dist/terms.html, so a direct load of /privacy or
// /terms returns the full text in the raw HTML (vercel.json points those paths
// here). The React app then mounts over it as usual. The text comes from the
// components in ParryFSApp.jsx, so there is only one copy to edit.
function prerenderLegalPages() {
  return {
    name: 'prerender-legal-pages',
    apply: 'build',
    async closeBundle() {
      // Build ParryFSApp.jsx once more for Node so its components can be
      // rendered here. recharts hangs when imported under Node and the legal
      // pages have no charts, so it is swapped for components that render nothing.
      const rechartsStub = {
        name: 'recharts-stub',
        enforce: 'pre',
        resolveId: (id) => (id === 'recharts' ? '\0recharts-stub' : null),
        load: (id) => (id === '\0recharts-stub'
          ? { code: 'export default new Proxy({}, { get: () => () => null });', syntheticNamedExports: true }
          : null),
      }
      const ssrDir = resolve('node_modules/.legal-prerender')
      await build({
        configFile: false,
        logLevel: 'error',
        plugins: [rechartsStub, react()],
        build: { ssr: 'ParryFSApp.jsx', outDir: ssrDir, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'app.mjs' } } },
      })
      const React = (await import('react')).default
      const { renderToStaticMarkup } = await import('react-dom/server')
      const { PrivacyPage, TermsPage, LEGAL_PAGES, C } = await import(`${pathToFileURL(resolve(ssrDir, 'app.mjs')).href}?t=${Date.now()}`)
      const outDir = resolve('dist')
      const template = await readFile(resolve(outDir, 'index.html'), 'utf8')
      const pages = { privacy: { Page: PrivacyPage, heading: 'Privacy Policy' }, terms: { Page: TermsPage, heading: 'Terms of Use' } }

      for (const [id, { Page, heading }] of Object.entries(pages)) {
        const { title, description } = LEGAL_PAGES[id]
        // Same outer layout as App, minus the nav, so the swap to the live app is quiet.
        const body = renderToStaticMarkup(
          React.createElement('div', { style: { minHeight: '100vh', background: C.bg, width: '100%', boxSizing: 'border-box' } },
            React.createElement('div', { style: { maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem', boxSizing: 'border-box' } },
              React.createElement(Page, { onBack: () => {} })))
        )
        if (!body.includes(`>${heading}</h1>`) || body.length < 2000) throw new Error(`prerendered /${id} looks incomplete`)

        const html = template
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
          .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(description)}" />`)
          .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
        if (!html.includes(`<title>${escapeHtml(title)}</title>`) || !html.includes(body)) throw new Error(`could not fill dist/${id}.html from index.html`)
        await writeFile(resolve(outDir, `${id}.html`), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), prerenderLegalPages()],
})
