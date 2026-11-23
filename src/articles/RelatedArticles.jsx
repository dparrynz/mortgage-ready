import React from 'react';
import { C, card } from '../../ParryFSApp.jsx';
import { ARTICLES } from './index.js';

// "Related articles" card shown under a Playbook guide or calculator, listing
// the articles that name that page as their related guide (the `guide` line
// in each article's details block). Shows nothing when there are none.
export default function RelatedArticles({ path, go }) {
  const clean = path.replace(/\/+$/, '');
  const related = ARTICLES.filter((a) => a.guide && a.guide.path === clean);
  if (!related.length) return null;

  return (
    <section style={{ ...card, marginTop: '1rem' }} aria-label="Related articles">
      <p style={{ fontSize: '13px', fontWeight: 600, color: C.sky, margin: '0 0 0.75rem' }}>Related articles</p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
        {related.map((a) => (
          <li key={a.slug}>
            <a
              href={a.path}
              onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(a.path); }}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <span style={{ display: 'block', fontSize: '16px', fontWeight: 600, color: C.textPrimary }}>{a.title} →</span>
              <span style={{ display: 'block', fontSize: '14px', color: C.textSecondary, lineHeight: 1.6, marginTop: '0.2rem' }}>{a.description}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
