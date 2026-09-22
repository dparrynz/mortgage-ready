import React, { useState, useEffect, useMemo } from 'react';
import { C, primaryBtn, secondaryBtn, useAuth, AuthModal, supabase, useWindowWidth, SegmentedToggle } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, GlossaryLink, linkifyGlossaryTerms, PLAYBOOK_ROOT, JOURNEY_PROGRESS_LS_KEY } from './shared.jsx';
import {
  JOURNEY_INTRO_PARAGRAPHS,
  JOURNEY_RELATED_ROUTES,
  journeyStagesForPath,
  JOURNEY_FULL_TEXT,
  JOURNEY_WHO_DOES_WHAT,
  JOURNEY_GLOSSARY_LINKS,
  FLOOD_VIEWER_URL,
} from './content.js';

const LS_KEY = JOURNEY_PROGRESS_LS_KEY;

const PATH_OPTIONS = [
  { value: 'negotiation', label: 'Negotiation or deadline' },
  { value: 'auction', label: 'Auction' },
];

// Short chip labels (as used in JOURNEY_STAGES_*) don't always match the
// "Who" column wording in JOURNEY_WHO_DOES_WHAT (section 3.3) exactly.
const WHO_CHIP_ALIASES = {
  Bank: 'Bank (lender)',
  Agent: 'Real estate agent',
  Solicitor: 'Solicitor or conveyancer',
  Valuer: 'Registered valuer',
};

function findWhoInfo(chipLabel) {
  const lookupName = WHO_CHIP_ALIASES[chipLabel] || chipLabel;
  return JOURNEY_WHO_DOES_WHAT.find((row) => row.who === lookupName);
}

export default function Journey({ onExit, onBackToHub, onNavigate }) {
  const { user } = useAuth();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;

  const [path, setPath] = useState('negotiation');
  const [selectedStage, setSelectedStage] = useState(0);
  const [expandedFullText, setExpandedFullText] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [openWhoChip, setOpenWhoChip] = useState(null);
  const whoChipsRef = React.useRef(null);

  useEffect(() => {
    if (!openWhoChip) return;
    const closeIfOutside = (e) => {
      if (whoChipsRef.current && !whoChipsRef.current.contains(e.target)) setOpenWhoChip(null);
    };
    const closeOnEscape = (e) => { if (e.key === 'Escape') setOpenWhoChip(null); };
    document.addEventListener('mousedown', closeIfOutside);
    document.addEventListener('touchstart', closeIfOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeIfOutside);
      document.removeEventListener('touchstart', closeIfOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [openWhoChip]);

  useEffect(() => { setOpenWhoChip(null); }, [selectedStage, path]);

  const stages = useMemo(() => journeyStagesForPath(path), [path]);
  const usedAnchors = useMemo(() => new Set(), [path, selectedStage, expandedFullText]);

  // Load saved progress: localStorage first (instant, works logged out),
  // then Supabase if signed in (overrides, since that's the source of truth
  // for a logged in user across devices).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let merged = {};
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) merged = JSON.parse(raw) || {};
      } catch {}
      if (user) {
        const { data } = await supabase.getJourneyProgress();
        if (data) merged = data;
      }
      if (!cancelled) { setChecklist(merged); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(checklist)); } catch {}
    if (user) supabase.saveJourneyProgress(checklist);
  }, [checklist, loaded, user]);

  useEffect(() => { setExpandedFullText(false); }, [selectedStage, path]);

  const toggleTodo = (stageIdx, todoIdx) => {
    setChecklist((prev) => {
      const pathData = { ...(prev[path] || {}) };
      const stageData = { ...(pathData[stageIdx] || {}) };
      stageData[todoIdx] = !stageData[todoIdx];
      pathData[stageIdx] = stageData;
      return { ...prev, [path]: pathData };
    });
  };

  const isTodoDone = (stageIdx, todoIdx) => !!checklist[path]?.[stageIdx]?.[todoIdx];
  const isStageComplete = (stageIdx) => stages[stageIdx].todos.every((_, ti) => isTodoDone(stageIdx, ti));

  const totalTodos = stages.reduce((sum, s) => sum + s.todos.length, 0);
  const doneTodos = stages.reduce((sum, s, i) => sum + s.todos.filter((_, ti) => isTodoDone(i, ti)).length, 0);
  const progressPct = totalTodos ? Math.round((doneTodos / totalTodos) * 100) : 0;

  const stage = stages[selectedStage];
  const fullText = path === 'negotiation' ? JOURNEY_FULL_TEXT[selectedStage] : null;

  const goRelated = (label) => {
    const route = JOURNEY_RELATED_ROUTES[label];
    if (route) onNavigate(route);
  };

  return (
    <div>
      <PlaybookHeader title="Your journey" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: '0 0 1rem' }}>The first home journey, start to finish</h1>

        {JOURNEY_INTRO_PARAGRAPHS.map((p, i) => (
          <p key={i} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1rem' }}>{p}</p>
        ))}
        <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
          New to terms like <GlossaryLink anchor="lim" onNavigate={onNavigate}>LIM</GlossaryLink>, <GlossaryLink anchor="cross-lease" onNavigate={onNavigate}>cross lease</GlossaryLink> or <GlossaryLink anchor="unconditional" onNavigate={onNavigate}>unconditional</GlossaryLink>? Each one is explained in the{' '}
          <a
            href={`${PLAYBOOK_ROOT}/glossary`}
            onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); onNavigate('/glossary'); }}
            style={{ color: C.accent, textDecoration: 'underline' }}
          >
            Glossary
          </a>.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <SegmentedToggle options={PATH_OPTIONS} value={path} onChange={(v) => { setPath(v); setSelectedStage((s) => Math.min(s, stages.length - 1)); }} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div style={{ height: '8px', borderRadius: '4px', background: C.inputBg, overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: C.accent, borderRadius: '4px', transition: 'width 0.2s' }} />
          </div>
          <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.5rem 0 0' }}>{doneTodos} of {totalTodos} to-dos done</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {stages.map((s, i) => {
            const selected = i === selectedStage;
            const complete = isStageComplete(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedStage(i)}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  border: selected ? `2px solid ${C.accent}` : `2px solid ${C.borderLight}`,
                  background: selected ? C.accentLight : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  minHeight: '44px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '600', color: C.textPrimary, lineHeight: 1.3 }}>{i + 1}. {s.title}</span>
                {complete && <i className="ti ti-circle-check-filled" style={{ fontSize: '16px', color: C.green, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ background: C.inputBg, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '19px', fontWeight: '600', color: C.textPrimary, margin: 0 }}>{selectedStage + 1}. {stage.title}</h2>
            <span style={{ fontSize: '13px', color: C.textMuted }}>{stage.time}</span>
          </div>
          <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 1rem' }}>
            {linkifyGlossaryTerms(stage.desc, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
          </p>

          <p style={{ fontSize: '12px', fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.5rem' }}>Who's involved</p>
          <div ref={whoChipsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
            {stage.who.map((w) => {
              const chipKey = `${selectedStage}-${w}`;
              const info = findWhoInfo(w);
              const isOpen = openWhoChip === chipKey;
              return (
                <div key={w} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setOpenWhoChip(isOpen ? null : chipKey)}
                    aria-expanded={isOpen}
                    style={{ fontSize: '12px', fontWeight: '500', color: C.accent, background: isOpen ? C.accentLight : 'white', border: 'none', borderRadius: '999px', padding: '0.3rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {w}
                    {info && <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '11px' }} />}
                  </button>
                  {isOpen && info && (
                    <div
                      role="dialog"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        zIndex: 20,
                        width: '260px',
                        maxWidth: '80vw',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
                        border: `1px solid ${C.borderLight}`,
                      }}
                    >
                      <p style={{ fontSize: '14px', fontWeight: '600', color: C.textPrimary, margin: '0 0 0.5rem' }}>{info.who}</p>
                      <p style={{ fontSize: '12px', color: C.textMuted, margin: '0 0 0.5rem' }}><strong>Works for:</strong> {info.worksFor}</p>
                      <p style={{ fontSize: '13px', color: C.textSecondary, lineHeight: 1.6, margin: '0 0 0.5rem' }}>{info.does}</p>
                      <p style={{ fontSize: '12px', color: C.textMuted, margin: '0 0 0.5rem' }}><strong>Rough cost to you:</strong> {info.cost}</p>
                      <p style={{ fontSize: '11px', color: C.textMuted, fontStyle: 'italic', margin: 0 }}>Costs are a rough guide only.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '12px', fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.5rem' }}>Your to-dos</p>
          <div style={{ marginBottom: '1.25rem' }}>
            {stage.todos.map((todo, ti) => {
              const checkboxId = `journey-todo-${path}-${selectedStage}-${ti}`;
              const done = isTodoDone(selectedStage, ti);
              return (
                <label key={ti} htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.5rem 0', cursor: 'pointer' }}>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleTodo(selectedStage, ti)}
                    style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: done ? C.textMuted : C.textPrimary, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>{todo}</span>
                </label>
              );
            })}
          </div>

          {stage.related && stage.related.length > 0 && (
            <>
              <p style={{ fontSize: '12px', fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.02em', margin: '0 0 0.5rem' }}>Related</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: fullText ? '1.25rem' : 0 }}>
                {stage.related.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goRelated(label)}
                    style={{ fontSize: '13px', color: C.accent, background: 'white', border: `1px solid ${C.borderLight}`, borderRadius: '10px', padding: '0.4rem 0.85rem', cursor: 'pointer' }}
                  >
                    {label} →
                  </button>
                ))}
              </div>
            </>
          )}

          {fullText && (
            <div>
              <button
                type="button"
                onClick={() => setExpandedFullText((e) => !e)}
                style={{ background: 'none', border: 'none', color: C.accent, fontSize: '13px', fontWeight: '500', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {expandedFullText ? 'Show less' : 'Read more'}
                <i className={`ti ${expandedFullText ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '14px' }} />
              </button>

              {expandedFullText && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${C.borderLight}` }}>
                  {fullText.paragraphs.map((p, i) => (
                    <p key={`p-${i}`} style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 0.75rem' }}>
                      {linkifyGlossaryTerms(p, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                    </p>
                  ))}
                  {fullText.list && (
                    <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                      {fullText.list.map((item, i) => (
                        <li key={i} style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, marginBottom: '0.35rem' }}>
                          {linkifyGlossaryTerms(item, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fullText.floodViewerLink && (
                    <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 0.75rem' }}>
                      In Auckland, the{' '}
                      <a href={FLOOD_VIEWER_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: 'underline' }}>
                        Auckland Flood Viewer
                      </a>{' '}
                      shows flood plains and overland flow paths for any address.
                    </p>
                  )}
                  {fullText.depositSourcesLink && (
                    <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: '0 0 0.75rem' }}>
                      See the{' '}
                      <a
                        href={`${PLAYBOOK_ROOT}/deposit-sources#bank-vs-seller-deposit`}
                        onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; e.preventDefault(); onNavigate('/deposit-sources#bank-vs-seller-deposit'); }}
                        style={{ color: C.accent, textDecoration: 'underline' }}
                      >
                        Deposit Sources guide
                      </a>{' '}
                      for how the two deposits differ.
                    </p>
                  )}
                  {fullText.trailing && fullText.trailing.map((p, i) => (
                    <p key={`t-${i}`} style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.7, margin: 0 }}>
                      {linkifyGlossaryTerms(p, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setSelectedStage((s) => Math.max(0, s - 1))}
            disabled={selectedStage === 0}
            style={{ ...secondaryBtn, opacity: selectedStage === 0 ? 0.4 : 1, cursor: selectedStage === 0 ? 'not-allowed' : 'pointer' }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setSelectedStage((s) => Math.min(stages.length - 1, s + 1))}
            disabled={selectedStage === stages.length - 1}
            style={{ ...primaryBtn, opacity: selectedStage === stages.length - 1 ? 0.4 : 1, cursor: selectedStage === stages.length - 1 ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>

        {!user && (
          <p style={{ fontSize: '13px', color: C.textMuted, margin: '0 0 1.5rem' }}>
            Your progress is saved on this device.{' '}
            <button type="button" onClick={() => setShowAuthModal(true)} style={{ background: 'none', border: 'none', padding: 0, color: C.accent, textDecoration: 'underline', fontSize: '13px', cursor: 'pointer' }}>
              Log in to save your progress
            </button>
          </p>
        )}

        <PlaybookDisclaimer />
      </PlaybookCard>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

