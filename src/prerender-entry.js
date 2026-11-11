// Build-time only (see vite.config.js). Renders one page of the app to an HTML
// string, so each public page ships with its full text already in the file.
// Not part of the site bundle.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../ParryFSApp.jsx';

export { SEO_PAGES, sitemapPaths, seoHeadHtml, SITE_URL } from './seo.js';

// Just enough of a browser for the first render. Effects (data loading,
// listeners, saved progress) don't run here, so nothing else is needed.
function fakeWindow(path) {
  const noop = () => {};
  const storage = { getItem: () => null, setItem: noop, removeItem: noop, clear: noop };
  return {
    location: { pathname: path, hash: '', search: '', href: `https://parryfs.com${path}`, origin: 'https://parryfs.com' },
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: noop,
    scrollTo: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
    history: { pushState: noop, replaceState: noop },
    localStorage: storage,
    sessionStorage: storage,
  };
}

export function renderPage(path) {
  const saved = { window: globalThis.window, localStorage: globalThis.localStorage };
  const win = fakeWindow(path);
  globalThis.window = win;
  globalThis.localStorage = win.localStorage;
  try {
    return renderToStaticMarkup(React.createElement(App, { prerender: true }));
  } finally {
    globalThis.window = saved.window;
    globalThis.localStorage = saved.localStorage;
  }
}
