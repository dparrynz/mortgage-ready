import React, { useState, useEffect, useMemo } from 'react';
import { C, primaryBtn, secondaryBtn, useAuth, AuthModal, supabase, useWindowWidth, SegmentedToggle } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, linkifyGlossaryTerms, PLAYBOOK_ROOT, JOURNEY_PROGRESS_LS_KEY } from './shared.jsx';
import {
  JOURNEY_RELATED_ROUTES,
  journeyStagesForPath,
  JOURNEY_FULL_TEXT,
  JOURNEY_WHO_DOES_WHAT,
  JOURNEY_GLOSSARY_LINKS,
  FLOOD_VIEWER_URL,
} from './content.js';

const LS_KEY = JOURNEY_PROGRESS_LS_KEY;

// Links the phrase "flood viewer" (wherever it shows up in a to-do's text)
// to the Auckland Flood Viewer, the same link used in the House hunting
// stage's "Read more" text.
function linkifyFloodViewer(text) {
  const idx = text.toLowerCase().indexOf('flood viewer');
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + 'flood viewer'.length);
  const after = text.slice(idx + 'flood viewer'.length);
  return [
    before,
    <a
      key="flood-viewer-link"
      href={FLOOD_VIEWER_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ color: C.accent, textDecoration: 'underline' }}
    >
      {match}
    </a>,
    after,
  ];
}

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


// One simple line icon per stage, picked from the stage title
const STAGE_ICON_PATHS = [
  ['pre-approval', <><circle cx="12" cy="12" r="9" /><path d="M8.5 12.2l2.4 2.4 4.6-4.8" /></>],
  ['hunting', <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h8" /><circle cx="17" cy="17" r="3" /><path d="m19.2 19.2 2 2" /></>],
  ['homework', <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 3h6v3H9zM9 11h6M9 15h4" /></>],
  ['offer', <><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M13.5 8.5l2 2" /></>],
  ['unconditional', <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>],
  ['conditional', <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M10 2h4" /></>],
  ['auction day', <><path d="m14 5 5 5M9.5 9.5l5 5M12 7l5 5-2.5 2.5-5-5z" /><path d="M10.5 13.5 4 20" /></>],
  ['finalise', <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 14l2 2 4-4" /></>],
  ['settlement', <><path d="M3 10l9-6 9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" /></>],
  ['keys', <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l2.5 2.5M14.5 8.5l2 2" /></>],
];

function StageIcon({ title, size = 20, colour }) {
  const t = title.toLowerCase();
  const found = STAGE_ICON_PATHS.find(([k]) => t.includes(k));
  if (!found) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour || C.sky} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      {found[1]}
    </svg>
  );
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

  const pathToggle = (
    <SegmentedToggle options={PATH_OPTIONS} value={path} onChange={(v) => { setPath(v); setSelectedStage((s) => Math.min(s, stages.length - 1)); }} />
  );

  const label = { fontSize: '12px', fontWeight: '700', color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.6rem' };

  // Everything about the selected stage. Shown on the right on desktop, and
  // opened in place under the stage name on phones.
  const stageDetail = (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <h2 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 700, color: C.navy, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.inputBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><StageIcon title={stage.title} size={22} /></span>
          {stage.title}
        </h2>
        <span style={{ fontSize: '13px', fontWeight: 600, color: C.accent, background: C.inputBg, borderRadius: '999px', padding: '0.3rem 0.75rem' }}>{stage.time}</span>
      </div>
      <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: '0 0 1.25rem' }}>
        {linkifyGlossaryTerms(stage.desc, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
      </p>

      {/* To-dos */}
      <div style={{ background: C.inputBg, borderRadius: '16px', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
        <p style={label}>Your to-dos</p>
        {stage.todos.map((todo, ti) => {
          const checkboxId = `journey-todo-${path}-${selectedStage}-${ti}`;
          const done = isTodoDone(selectedStage, ti);
          return (
            <label key={ti} htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.45rem 0', cursor: 'pointer' }}>
              <input id={checkboxId} type="checkbox" checked={done} onChange={() => toggleTodo(selectedStage, ti)} style={{ marginTop: '2px', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer', accentColor: C.green }} />
              <span style={{ fontSize: '15px', color: done ? C.textMuted : C.navy, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>{linkifyFloodViewer(todo)}</span>
            </label>
          );
        })}
      </div>

      {/* Who's involved */}
      <p style={label}>Who's involved</p>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {stage.who.map((w) => {
          const info = findWhoInfo(w);
          return (
            <div key={w} style={{ border: `1px solid ${C.borderLight}`, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy, margin: 0 }}>{info ? info.who : w}</p>
                {info && <span style={{ fontSize: '11px', fontWeight: 600, color: C.textSecondary, whiteSpace: 'nowrap' }}>Works for: {info.worksFor}</span>}
              </div>
              {info && <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: 1.55, margin: '0 0 0.5rem' }}>{info.does}</p>}
              {info && <p style={{ fontSize: '13px', color: C.navy, margin: 0 }}><strong>Rough cost:</strong> {info.cost}</p>}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '12px', color: C.textMuted, fontStyle: 'italic', margin: '-0.4rem 0 1rem' }}>Costs are a rough guide only.</p>

      {/* Related */}
      {stage.related && stage.related.length > 0 && (
        <div style={{ background: '#EAF1FE', borderRadius: '16px', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
          <p style={label}>Helpful for this stage</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {stage.related.map((label2) => (
              <button key={label2} type="button" onClick={() => goRelated(label2)} style={{ fontSize: '14px', fontWeight: 600, color: C.accent, background: 'white', border: 'none', borderRadius: '10px', padding: '0.55rem 0.9rem', cursor: 'pointer' }}>
                {label2} →
              </button>
            ))}
          </div>
        </div>
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

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.25rem' }}>
        <button type="button" onClick={() => setSelectedStage((s) => Math.max(0, s - 1))} disabled={selectedStage === 0} style={{ ...secondaryBtn, border: `1px solid ${C.borderLight}`, opacity: selectedStage === 0 ? 0.4 : 1, cursor: selectedStage === 0 ? 'not-allowed' : 'pointer' }}>
          Back
        </button>
        <button type="button" onClick={() => setSelectedStage((s) => Math.min(stages.length - 1, s + 1))} disabled={selectedStage === stages.length - 1} style={{ ...primaryBtn, opacity: selectedStage === stages.length - 1 ? 0.4 : 1, cursor: selectedStage === stages.length - 1 ? 'not-allowed' : 'pointer' }}>
          Next stage
        </button>
      </div>
    </div>
  );

  // The list of stages down the left, joined by a line
  const stageList = (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {stages.map((s, i) => {
        const selected = i === selectedStage;
        const complete = isStageComplete(i);
        const last = i === stages.length - 1;
        return (
          <li key={i} style={{ position: 'relative' }}>
            {!last && <span aria-hidden="true" style={{ position: 'absolute', left: '27px', top: '50px', bottom: '-6px', width: '2px', background: complete ? C.green : '#D5E0F2' }} />}
            <button
              type="button"
              onClick={() => setSelectedStage(i)}
              aria-current={selected ? 'step' : undefined}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.6rem', margin: '0 0 6px', borderRadius: '14px', border: 'none', background: selected ? '#EAF1FE' : 'transparent', cursor: 'pointer', textAlign: 'left', position: 'relative' }}
            >
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: complete ? C.green : selected ? C.accent : 'white', border: complete || selected ? 'none' : `2px solid #D5E0F2` }}>
                {complete
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7" /></svg>
                  : <StageIcon title={s.title} size={19} colour={selected ? 'white' : C.sky} />}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: '15px', fontWeight: selected ? 700 : 600, color: C.navy, lineHeight: 1.3 }}>{i + 1}. {s.title}</span>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>{s.time}</span>
              </span>
              {isMobile && <span aria-hidden="true" style={{ color: C.accent, fontSize: '20px' }}>{selected ? '−' : '+'}</span>}
            </button>
            {isMobile && selected && (
              <div style={{ margin: '0.25rem 0 1.25rem', padding: '1rem', border: `1px solid ${C.borderLight}`, borderRadius: '16px', background: 'white', position: 'relative', zIndex: 1 }}>{stageDetail}</div>
            )}
          </li>
        );
      })}
    </ol>
  );

  return (
    <div>
      <PlaybookHeader title="Your journey" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        {/* Top: path choice and progress */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
          {pathToggle}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: isMobile ? '1 1 100%' : '0 1 360px' }}>
            <span style={{ fontFamily: C.headingFont, fontSize: '30px', fontWeight: 700, color: progressPct === 100 ? C.green : C.navy, minWidth: '64px' }}>{progressPct}%</span>
            <div style={{ flex: 1 }}>
              <div style={{ height: '10px', borderRadius: '5px', background: C.inputBg, overflow: 'hidden' }} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">
                <div style={{ width: `${progressPct}%`, height: '100%', background: C.green, borderRadius: '5px', transition: 'width 0.25s' }} />
              </div>
              <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.35rem 0 0' }}>{doneTodos} of {totalTodos} to-dos done</p>
            </div>
          </div>
        </div>

        {isMobile ? stageList : (
          <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: '90px' }}>{stageList}</div>
            <div style={{ borderLeft: `1px solid ${C.borderLight}`, paddingLeft: '2rem' }}>{stageDetail}</div>
          </div>
        )}

        {/* Save progress */}
        {!user && (
          <div style={{ marginTop: '1.75rem', background: C.navy, color: 'white', borderRadius: '18px', padding: isMobile ? '1.1rem' : '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.9rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <p style={{ margin: '0 0 0.2rem', fontSize: '16px', fontWeight: 700 }}>Save your progress</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#C2CDE2', lineHeight: 1.5 }}>Your ticks are saved on this device for now. Create a free account to pick up where you left off on any device.</p>
            </div>
            <button type="button" onClick={() => setShowAuthModal(true)} style={{ ...primaryBtn, whiteSpace: 'nowrap' }}>Save my progress</button>
          </div>
        )}

        <PlaybookDisclaimer />
      </PlaybookCard>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />
      )}
    </div>
  );
}

