// Articles (the blog). Each article is a Markdown file in ./posts, named after
// its web address: posts/seller-deposit-vs-bank-deposit.md is shown at
// /articles/seller-deposit-vs-bank-deposit. See README.md in this folder.
import { marked } from 'marked';

// Drafts show on preview links and when running locally, never on the live
// site. __SHOW_DRAFTS__ is set in vite.config.js.
/* global __SHOW_DRAFTS__ */
const SHOW_DRAFTS = typeof __SHOW_DRAFTS__ !== 'undefined' ? __SHOW_DRAFTS__ : false;

export const ARTICLES_ROOT = '/articles';

// The Playbook guide each article can point readers to.
export const GUIDES = {
  journey: { title: 'Your first home journey, start to finish', path: '/first-home-playbook/journey' },
  'deposit-sources': { title: 'Where your deposit can come from', path: '/first-home-playbook/deposit-sources' },
  'costs-of-buying': { title: 'The hidden costs of buying', path: '/first-home-playbook/costs-of-buying' },
  'kainga-ora': { title: 'Kāinga Ora First Home Loan, explained', path: '/first-home-playbook/kainga-ora' },
  glossary: { title: 'First home buyer jargon, in plain English', path: '/first-home-playbook/glossary' },
  'borrow-checker': { title: 'Borrow Checker: see what you could borrow', path: '/borrow-checker' },
};

// Simple "key: value" lines between --- markers at the top of the file.
function parse(raw, slug) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`Article "${slug}" is missing its --- details block at the top`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  for (const key of ['title', 'description', 'date']) {
    if (!meta[key]) throw new Error(`Article "${slug}" needs a ${key}`);
  }
  if (meta.guide && !GUIDES[meta.guide]) throw new Error(`Article "${slug}" points to an unknown guide "${meta.guide}"`);
  return {
    slug,
    path: `${ARTICLES_ROOT}/${slug}`,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    guide: meta.guide ? GUIDES[meta.guide] : null,
    draft: meta.draft === 'true',
    html: marked.parse(m[2], { gfm: true }),
  };
}

const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true });

const ALL = Object.entries(files).map(([file, raw]) => parse(raw, file.replace(/^.*\/|\.md$/g, '')));

// Newest first. Drafts left out on the live site.
export const ARTICLES = ALL
  .filter((a) => SHOW_DRAFTS || !a.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export const articleByPath = (path) => ARTICLES.find((a) => a.path === path.replace(/\/+$/, ''));

export function formatDate(iso) {
  const [y, mo, d] = iso.split('-').map(Number);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[mo - 1]} ${y}`;
}
