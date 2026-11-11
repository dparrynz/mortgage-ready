import React from 'react';
import { C, card, useWindowWidth } from '../../ParryFSApp.jsx';
import { PlaybookDisclaimer } from '../first-home-playbook/shared.jsx';
import { ARTICLES, ARTICLES_ROOT, articleByPath, formatDate } from './index.js';

// Article text styles. The Markdown becomes plain HTML, so it is styled here.
// A function, since C isn't ready yet when this file first loads.
const articleCss = () => `
.fhp-article { color: ${C.textSecondary}; font-size: 16px; line-height: 1.75; }
.fhp-article > :first-child { margin-top: 0; }
.fhp-article h2 { font-family: ${C.headingFont}; color: ${C.navy}; font-size: 24px; line-height: 1.25; margin: 2rem 0 0.75rem; }
.fhp-article h3 { color: ${C.textPrimary}; font-size: 18px; margin: 1.5rem 0 0.5rem; }
.fhp-article p { margin: 0 0 1rem; }
.fhp-article ul, .fhp-article ol { margin: 0 0 1rem; padding-left: 1.4rem; }
.fhp-article li { margin-bottom: 0.4rem; }
.fhp-article strong { color: ${C.textPrimary}; }
.fhp-article a { color: ${C.sky}; text-decoration: underline; text-underline-offset: 3px; }
.fhp-article blockquote { margin: 1.25rem 0; padding: 1rem 1.25rem; background: ${C.accentLight}; border-radius: 12px; color: ${C.textPrimary}; }
.fhp-article blockquote p:last-child { margin: 0; }
.fhp-article table { width: 100%; border-collapse: collapse; margin: 0 0 1.25rem; font-size: 15px; }
.fhp-article th, .fhp-article td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid ${C.borderLight}; vertical-align: top; }
.fhp-article th { color: ${C.textPrimary}; }
`;

// Same-site links inside an article open in the app without a full reload.
function handleInternalLink(e, go) {
  const a = e.target.closest && e.target.closest('a');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const href = a.getAttribute('href') || '';
  if (!href.startsWith('/')) return;
  e.preventDefault();
  go(href);
}

function Link({ to, go, style, children }) {
  return (
    <a href={to} onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); go(to); }} style={style}>
      {children}
    </a>
  );
}

function DraftBadge() {
  return <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 600, color: C.red, background: '#FDECE9', borderRadius: '999px', padding: '2px 10px', marginRight: '0.5rem' }}>Draft, not live</span>;
}

function ArticleList({ go }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {ARTICLES.map((a) => (
        <Link key={a.slug} to={a.path} go={go} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 0.4rem' }}>{a.draft && <DraftBadge />}{formatDate(a.date)}</p>
          <p style={{ fontFamily: C.headingFont, fontSize: '20px', fontWeight: 700, color: C.navy, margin: '0 0 0.4rem' }}>{a.title}</p>
          <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.6, margin: 0 }}>{a.description}</p>
        </Link>
      ))}
      {ARTICLES.length === 0 && <div style={card}><p style={{ margin: 0, color: C.textSecondary }}>New articles are on the way.</p></div>}
    </div>
  );
}

function Article({ article, go, isMobile }) {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <style>{articleCss()}</style>
      <article style={{ ...card, padding: isMobile ? '1.5rem' : '2.5rem' }}>
        <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 1.5rem' }}>{article.draft && <DraftBadge />}{formatDate(article.date)}</p>
        <div className="fhp-article" onClick={(e) => handleInternalLink(e, go)} dangerouslySetInnerHTML={{ __html: article.html }} />
        <PlaybookDisclaimer />
      </article>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
        {article.guide && (
          <Link to={article.guide.path} go={go} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.sky, margin: '0 0 0.35rem' }}>Related guide</p>
            <p style={{ fontSize: '17px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>{article.guide.title} →</p>
          </Link>
        )}
        <Link to="/first-home-playbook/book-a-call" go={go} style={{ ...card, display: 'block', textDecoration: 'none', color: 'inherit', background: '#FDECE9' }}>
          <p style={{ fontSize: '13px', fontWeight: 600, color: C.red, margin: '0 0 0.35rem' }}>Get your plan</p>
          <p style={{ fontSize: '17px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>Talk it through with an adviser, free →</p>
        </Link>
      </div>

      <p style={{ margin: '0.5rem 0 0', fontSize: '14px' }}>
        <Link to={ARTICLES_ROOT} go={go} style={{ color: C.sky }}>← All articles</Link>
      </p>
    </div>
  );
}

export default function ArticlesPage({ path, go }) {
  const isMobile = useWindowWidth() < 768;
  const article = articleByPath(path);
  if (article) return <Article article={article} go={go} isMobile={isMobile} />;
  return <ArticleList go={go} />;
}

// Banner at the top of the page (used by src/PageHero.jsx).
export function articlesHero(path) {
  const article = articleByPath(path);
  const crumbs = [{ label: 'Home', to: '/' }];
  if (article) {
    crumbs.push({ label: 'Articles', to: ARTICLES_ROOT });
    return { title: article.title, sub: article.description, crumb: article.title.length > 40 ? 'Article' : article.title, crumbs };
  }
  return { title: 'Articles', sub: 'Plain English answers to the questions first home buyers ask most.', crumbs };
}
