import React, { useState, useEffect } from 'react';
import { PLAYBOOK_ROOT } from './shared.jsx';
import Hub from './Hub.jsx';
import Calculator from './Calculator.jsx';
import AreYouReadyQuiz from './AreYouReadyQuiz.jsx';
import KaingaOraQuiz from './KaingaOraQuiz.jsx';
import Glossary from './Glossary.jsx';
import BookACall from './BookACall.jsx';
import Journey from './Journey.jsx';
import DepositSources from './DepositSources.jsx';
import HiddenCosts from './HiddenCosts.jsx';
import KaingaOraPage from './KaingaOraPage.jsx';

function subPathFromLocation() {
  const path = window.location.pathname.replace(PLAYBOOK_ROOT, '');
  return path === '' || path === '/' ? '/' : path;
}

// Self-contained History API router for everything under /first-home-playbook.
// Mounted only while the top-level tab is 'first-home-playbook' (see App in
// ParryFSApp.jsx), so it owns pushState/popstate for this section only.
export default function FirstHomePlaybookRouter({ onExit }) {
  const [subPath, setSubPath] = useState(subPathFromLocation());
  const [hash, setHash] = useState(window.location.hash.slice(1));

  useEffect(() => {
    const onPopState = () => { setSubPath(subPathFromLocation()); setHash(window.location.hash.slice(1)); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    // A path carrying a #anchor (e.g. a glossary deep link) is scrolled to
    // by the destination page itself, so don't fight it by jumping to top.
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [subPath, hash]);

  const navigate = (path) => {
    const [pureSubPath, newHash] = path.split('#');
    const full = (pureSubPath === '/' || pureSubPath === '' ? PLAYBOOK_ROOT : `${PLAYBOOK_ROOT}${pureSubPath}`) + (newHash ? `#${newHash}` : '');
    window.history.pushState({}, '', full);
    setSubPath(pureSubPath === '' ? '/' : pureSubPath);
    setHash(newHash || '');
  };

  const backToHub = () => navigate('/');

  const pageProps = { onExit, onBackToHub: backToHub, onNavigate: navigate, hash };

  let page;
  switch (subPath) {
    case '/journey': page = <Journey {...pageProps} />; break;
    case '/calculator': page = <Calculator {...pageProps} />; break;
    case '/are-you-ready': page = <AreYouReadyQuiz {...pageProps} />; break;
    case '/kainga-ora-quiz': page = <KaingaOraQuiz {...pageProps} />; break;
    case '/deposit-sources': page = <DepositSources {...pageProps} />; break;
    case '/costs-of-buying': page = <HiddenCosts {...pageProps} />; break;
    case '/kainga-ora': page = <KaingaOraPage {...pageProps} />; break;
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
