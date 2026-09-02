import React, { useState, useEffect } from 'react';
import { PLAYBOOK_ROOT } from './shared.jsx';
import Hub from './Hub.jsx';
import Calculator from './Calculator.jsx';
import AreYouReadyQuiz from './AreYouReadyQuiz.jsx';
import KaingaOraQuiz from './KaingaOraQuiz.jsx';
import GuidePage from './GuidePage.jsx';
import Glossary from './Glossary.jsx';
import BookACall from './BookACall.jsx';
import { DEPOSIT_SOURCES, COSTS_OF_BUYING, KAINGA_ORA_EXPLAINER } from './content.js';

function subPathFromLocation() {
  const path = window.location.pathname.replace(PLAYBOOK_ROOT, '');
  return path === '' || path === '/' ? '/' : path;
}

// Self-contained History API router for everything under /first-home-playbook.
// Mounted only while the top-level tab is 'first-home-playbook' (see App in
// ParryFSApp.jsx), so it owns pushState/popstate for this section only.
export default function FirstHomePlaybookRouter({ onExit }) {
  const [subPath, setSubPath] = useState(subPathFromLocation());

  useEffect(() => {
    const onPopState = () => setSubPath(subPathFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [subPath]);

  const navigate = (path) => {
    const full = path === '/' ? PLAYBOOK_ROOT : `${PLAYBOOK_ROOT}${path}`;
    window.history.pushState({}, '', full);
    setSubPath(path);
  };

  const backToHub = () => navigate('/');

  const pageProps = { onExit, onBackToHub: backToHub, onNavigate: navigate };

  let page;
  switch (subPath) {
    case '/calculator': page = <Calculator {...pageProps} />; break;
    case '/are-you-ready': page = <AreYouReadyQuiz {...pageProps} />; break;
    case '/kainga-ora-quiz': page = <KaingaOraQuiz {...pageProps} />; break;
    case '/deposit-sources': page = <GuidePage content={DEPOSIT_SOURCES} {...pageProps} />; break;
    case '/costs-of-buying': page = <GuidePage content={COSTS_OF_BUYING} {...pageProps} />; break;
    case '/kainga-ora': page = <GuidePage content={KAINGA_ORA_EXPLAINER} {...pageProps} />; break;
    case '/glossary': page = <Glossary {...pageProps} />; break;
    case '/book-a-call': page = <BookACall {...pageProps} />; break;
    default: page = <Hub onExit={onExit} onNavigate={navigate} />;
  }

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {page}
    </div>
  );
}
