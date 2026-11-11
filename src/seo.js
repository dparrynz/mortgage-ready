// Search engine settings for every public page: the <title>, meta description,
// canonical address, and whether the page goes in the sitemap.
//
// One list, used in two places:
//   1. At build time (vite.config.js) to write a ready-made HTML copy of each
//      page, with these tags filled in, plus dist/sitemap.xml.
//   2. In the browser (App in ParryFSApp.jsx) to keep the tags right as people
//      move between pages.
//
// To add a page: add a line here. It is then prerendered, given its own title
// and description, and listed in the sitemap automatically.

import { ARTICLES, ARTICLES_ROOT } from './articles/index.js';

export const SITE_URL = 'https://parryfs.com';
export const SITE_NAME = 'First Home Playbook';

const brand = (title) => `${title} | ${SITE_NAME}`;

// path → { title, description, canonical?, noindex?, priority? }
//   canonical: send search engines to another page with the same content
//   noindex:   keep the page out of search results (and the sitemap)
export const SEO_PAGES = {
  '/': {
    title: 'First Home Playbook | Buying your first home, made simple',
    description: 'Everything first home buyers need to know, in one place. Free guides and tools, including the Borrow Checker. Simple and jargon free.',
    priority: 1.0,
  },

  // First Home Playbook
  '/first-home-playbook': {
    title: brand('Free guides and tools for first home buyers'),
    description: 'Free guides for first home buyers on deposits, hidden costs, Kāinga Ora and jargon, plus the full journey from pre-approval to getting the keys.',
    priority: 0.9,
  },
  '/first-home-playbook/journey': {
    title: brand('Buying your first home, step by step'),
    description: 'Every step of buying your first home, from pre-approval to getting the keys, with who does what and what to tick off at each stage.',
    priority: 0.9,
  },
  '/first-home-playbook/deposit-sources': {
    title: brand('Where your first home deposit can come from'),
    description: 'KiwiSaver, savings, help from family and more. How most first home buyers put their deposit together, not just from savings.',
    priority: 0.8,
  },
  '/first-home-playbook/costs-of-buying': {
    title: brand('The hidden costs of buying your first home'),
    description: 'Legal fees, building reports, insurance, moving and more. What buying a home actually costs beyond the deposit, so there are no surprises.',
    priority: 0.8,
  },
  '/first-home-playbook/kainga-ora': {
    title: brand('Kāinga Ora First Home Loan, explained simply'),
    description: 'What the Kāinga Ora First Home Loan is, how it works and who it could suit, explained in plain English for first home buyers.',
    priority: 0.8,
  },
  '/first-home-playbook/kainga-ora-quiz': {
    title: brand('Do you qualify for a Kāinga Ora First Home Loan?'),
    description: 'Answer a few quick questions to get a fast read on whether you might be eligible for a Kāinga Ora First Home Loan.',
    priority: 0.7,
  },
  '/first-home-playbook/are-you-ready': {
    title: brand('Are you ready to buy your first home?'),
    description: 'A quick self-check for first home buyers. Answer a few questions to see where you stand and what to focus on next.',
    priority: 0.7,
  },
  '/first-home-playbook/glossary': {
    title: brand('First home buyer jargon, in plain English'),
    description: "LIM, cross lease, unit title, body corporate and more. The terms you'll hear when buying your first home, explained simply.",
    priority: 0.7,
  },
  '/first-home-playbook/book-a-call': {
    title: brand('Get your plan'),
    description: 'Tell us a bit about you or book a time to chat, and get a clear plan for buying your first home.',
    priority: 0.6,
  },
  // Same calculator as /borrow-checker, so point search engines there.
  '/first-home-playbook/calculator': {
    title: brand('Know your numbers'),
    description: 'Run the Borrow Checker to see what you could borrow for your first home.',
    canonical: '/borrow-checker',
  },

  // Calculators
  '/borrow-checker': {
    title: brand('Borrow Checker'),
    description: "Find out what you could borrow and if you're ready to buy a home in New Zealand.",
    priority: 0.9,
  },
  '/loan-repayment': {
    title: brand('Loan Repayment Calculator'),
    description: 'Calculate your mortgage repayments and compare multiple loans.',
    priority: 0.5,
  },
  '/quick-repay': {
    title: brand('Quick Repay Calculator'),
    description: 'See how extra repayments can save you interest and time.',
    priority: 0.5,
  },
  '/mortgage-comparison': {
    title: brand('Mortgage Comparison'),
    description: 'Compare current and new rates and repayments across your loans.',
    priority: 0.5,
  },
  '/break-even': {
    title: brand('Break Even Calculator'),
    description: 'Should you break your fixed rate? Find out here.',
    priority: 0.5,
  },
  '/cost-to-wait': {
    title: brand('Cost to Wait Calculator'),
    description: 'See the daily, monthly and annual cost of waiting to fix your rate.',
    priority: 0.5,
  },

  // Landing page for ad leads, not for search.
  '/welcome': {
    title: brand('Welcome'),
    description: 'Welcome to the First Home Playbook.',
    noindex: true,
  },

  // Legal
  '/privacy': {
    title: 'Privacy Policy | Parry Financial Services',
    description: 'How Parry Financial Services collects, uses and protects your personal information when you use the parryfs.com mortgage calculators and First Home Playbook.',
    priority: 0.2,
  },
  '/terms': {
    title: 'Terms of Use | Parry Financial Services',
    description: 'The terms that apply when you use the parryfs.com mortgage calculators and First Home Playbook, provided by Parry Financial Services in New Zealand.',
    priority: 0.2,
  },
};

// Articles add themselves from src/articles/posts. Drafts (only on preview
// links) are kept out of search.
if (ARTICLES.length) {
  SEO_PAGES[ARTICLES_ROOT] = {
    title: brand('Articles for first home buyers'),
    description: 'Plain English answers to the questions first home buyers ask most, from deposits and offers to settlement day.',
    priority: 0.8,
  };
  for (const a of ARTICLES) {
    SEO_PAGES[a.path] = { title: brand(a.title), description: a.description, priority: 0.7, noindex: a.draft, article: a };
  }
}

const normalise = (path) => (path.length > 1 ? path.replace(/\/+$/, '') : path) || '/';

// Settings for any path. Unknown paths get the homepage title but are kept
// out of search results, so stray addresses don't compete with real pages.
export function seoFor(path) {
  const clean = normalise(path);
  const page = SEO_PAGES[clean];
  if (!page) return { ...SEO_PAGES['/'], url: `${SITE_URL}${clean}`, canonicalUrl: `${SITE_URL}/`, noindex: true };
  return {
    ...page,
    url: `${SITE_URL}${clean === '/' ? '/' : clean}`,
    canonicalUrl: `${SITE_URL}${page.canonical || (clean === '/' ? '/' : clean)}`,
  };
}

// Pages that belong in sitemap.xml.
export function sitemapPaths() {
  return Object.entries(SEO_PAGES)
    .filter(([, p]) => !p.noindex && !p.canonical)
    .map(([path, p]) => ({ path, priority: p.priority ?? 0.5, lastmod: p.article?.date }));
}

// Keeps the <head> tags in step with the page in the browser.
export function applySeo(path) {
  if (typeof document === 'undefined') return;
  const s = seoFor(path);
  document.title = s.title;
  const set = (selector, attr, value, create) => {
    let el = document.head.querySelector(selector);
    if (!el && create) { el = create(); document.head.appendChild(el); }
    if (el) el.setAttribute(attr, value);
  };
  const meta = (key, keyAttr) => () => { const m = document.createElement('meta'); m.setAttribute(keyAttr, key); return m; };
  set('meta[name="description"]', 'content', s.description, meta('description', 'name'));
  set('link[rel="canonical"]', 'href', s.canonicalUrl, () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; });
  set('meta[property="og:title"]', 'content', s.title, meta('og:title', 'property'));
  set('meta[property="og:description"]', 'content', s.description, meta('og:description', 'property'));
  set('meta[property="og:url"]', 'content', s.canonicalUrl, meta('og:url', 'property'));
  set('meta[name="robots"]', 'content', s.noindex ? 'noindex, follow' : 'index, follow', meta('robots', 'name'));
}

// The same tags as HTML, for the build step.
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function seoHeadHtml(path) {
  const s = seoFor(path);
  return [
    `<title>${esc(s.title)}</title>`,
    `<meta name="description" content="${esc(s.description)}" />`,
    `<link rel="canonical" href="${esc(s.canonicalUrl)}" />`,
    `<meta name="robots" content="${s.noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<meta property="og:type" content="${s.article ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(s.title)}" />`,
    `<meta property="og:description" content="${esc(s.description)}" />`,
    `<meta property="og:url" content="${esc(s.canonicalUrl)}" />`,
    `<meta name="twitter:card" content="summary" />`,
    ...(s.article ? [`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: s.article.title,
      description: s.article.description,
      datePublished: s.article.date,
      mainEntityOfPage: s.canonicalUrl,
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    }).replace(/</g, '\\u003c')}</script>`] : []),
  ].join('\n    ');
}
