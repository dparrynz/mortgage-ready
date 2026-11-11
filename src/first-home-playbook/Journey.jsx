import React, { useState, useEffect, useMemo } from 'react';
import { C, primaryBtn, secondaryBtn, useAuth, AuthModal, supabase, useWindowWidth, SegmentedToggle } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer, linkifyGlossaryTerms, PLAYBOOK_ROOT, JOURNEY_PROGRESS_LS_KEY } from './shared.jsx';
import {
  JOURNEY_RELATED_ROUTES,
  journeyStagesForPath, normaliseJourneyProgress,
  JOURNEY_FULL_TEXT,
  JOURNEY_FULL_TEXT_AUCTION,
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


// A small picture for each person in "Who's involved"
const WHO_ICONS = {
  'Mortgage adviser': <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" /><path d="M15.5 4.5h4v3h-2l-1.5 1.3V7.5" /></>,
  'Solicitor or conveyancer': <><path d="M12 4v16" /><path d="M8 20h8" /><path d="M5 7h14" /><path d="M7 7l-3 6a3 3 0 0 0 6 0z" /><path d="M17 7l-3 6a3 3 0 0 0 6 0z" /></>,
  'Real estate agent': <><path d="M5 21V4" /><path d="M5 5h13v7H5" /><path d="M9.5 10.5 11.5 8l2 2.5" /><path d="M10 10.5v-.5h3v.5" /></>,
  'Bank (lender)': <><path d="M3 10 12 4l9 6" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20h18" /></>,
  'Building inspector': <><rect x="5" y="4" width="11" height="16" rx="2" /><path d="M8 9h5M8 12.5h3" /><circle cx="16" cy="15" r="3" /><path d="m18.2 17.2 2.3 2.3" /></>,
  'Registered valuer': <><path d="M3.5 12.5 12 4h7.5v7.5L11 20z" /><circle cx="15.5" cy="8" r="1.4" /></>,
  'Insurer': <><path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  'Council': <><rect x="4" y="8" width="16" height="12" rx="1" /><path d="M8 8V5h8v3" /><path d="M8 12h2M14 12h2M8 16h2M14 16h2" /></>,
};

function WhoIcon({ name }) {
  const paths = WHO_ICONS[name];
  if (!paths) return null;
  return (
    <span style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#EAF1FE', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.sky} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
    </span>
  );
}

// Progress wheel with the percentage in the middle
function ProgressRing({ pct, size = 84 }) {
  const stroke = 9;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DCE6F5" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.red} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset 0.3s' }} />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.headingFont, fontSize: size > 70 ? '21px' : '17px', fontWeight: 700, color: C.navy }}>{pct}%</span>
    </div>
  );
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
      if (!cancelled) { setChecklist(normaliseJourneyProgress(merged)); setLoaded(true); }
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(checklist)); } catch {}
    if (user) supabase.saveJourneyProgress(checklist);
  }, [checklist, loaded, user]);

  useEffect(() => { setExpandedFullText(false); }, [selectedStage, path]);

  // Ticks are keyed by the to-do wording so they carry across both paths
  const toggleTodo = (stageIdx, todoIdx) => {
    const key = stages[stageIdx].todos[todoIdx];
    setChecklist((prev) => {
      const done = { ...(prev.done || {}) };
      if (done[key]) delete done[key]; else done[key] = true;
      return { done };
    });
  };

  const isTodoDone = (stageIdx, todoIdx) => !!checklist.done?.[stages[stageIdx].todos[todoIdx]];
  const isStageComplete = (stageIdx) => stages[stageIdx].todos.every((_, ti) => isTodoDone(stageIdx, ti));

  const totalTodos = stages.reduce((sum, s) => sum + s.todos.length, 0);
  const doneTodos = stages.reduce((sum, s, i) => sum + s.todos.filter((_, ti) => isTodoDone(i, ti)).length, 0);
  const progressPct = totalTodos ? Math.round((doneTodos / totalTodos) * 100) : 0;

  const stage = stages[selectedStage];
  const fullText = (path === 'auction' && JOURNEY_FULL_TEXT_AUCTION[selectedStage]) || JOURNEY_FULL_TEXT[selectedStage];

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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '1.1rem' }}>
        <h2 style={{ fontSize: isMobile ? '19px' : '22px', fontWeight: 700, color: C.navy, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '42px', height: '42px', borderRadius: '12px', background: C.inputBg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><StageIcon title={stage.title} size={22} /></span>
          {stage.title}
        </h2>
        <span style={{ fontSize: '13px', fontWeight: 600, color: C.accent, background: C.inputBg, borderRadius: '999px', padding: '0.3rem 0.75rem' }}>{stage.time}</span>
      </div>

      {/* To-dos */}
      <div style={{ background: C.inputBg, borderRadius: '16px', padding: '1rem 1.1rem', marginBottom: '1rem' }}>
        <p style={label}>Your to-dos</p>
        {stage.todos.map((todo, ti) => {
          const checkboxId = `journey-todo-${path}-${selectedStage}-${ti}`;
          const done = isTodoDone(selectedStage, ti);
          return (
            <label key={ti} htmlFor={checkboxId} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', padding: '0.45rem 0', cursor: 'pointer' }}>
              <input id={checkboxId} type="checkbox" checked={done} onChange={() => toggleTodo(selectedStage, ti)} style={{ marginTop: '2px', width: '18px', height: '18px', flexShrink: 0, cursor: 'pointer', accentColor: C.red }} />
              <span style={{ fontSize: '15px', color: done ? C.textMuted : C.navy, textDecoration: done ? 'line-through' : 'none', lineHeight: 1.5 }}>{linkifyFloodViewer(todo)}</span>
            </label>
          );
        })}
      </div>

      {/* The detail, in bullet points */}
          {fullText && (
            <div>
              {(
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={label}>What happens</p>
                  {fullText.paragraphs.map((p, i) => (
                    <p key={`p-${i}`} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: '0 0 0.75rem' }}>
                      {linkifyGlossaryTerms(p, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                    </p>
                  ))}
                  {fullText.list && (
                    <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                      {fullText.list.map((item, i) => (
                        <li key={i} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, marginBottom: '0.35rem' }}>
                          {linkifyGlossaryTerms(item, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fullText.paragraphs2 && fullText.paragraphs2.map((p, i) => (
                    <p key={`p2-${i}`} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: '0 0 0.75rem' }}>{p}</p>
                  ))}
                  {fullText.list2 && (
                    <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem' }}>
                      {fullText.list2.map((item, i) => (
                        <li key={i} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, marginBottom: '0.35rem' }}>
                          {linkifyGlossaryTerms(item, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fullText.floodViewerLink && (
                    <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: '0 0 0.75rem' }}>
                      In Auckland, the{' '}
                      <a href={FLOOD_VIEWER_URL} target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: 'underline' }}>
                        Auckland Flood Viewer
                      </a>{' '}
                      shows flood plains and overland flow paths for any address.
                    </p>
                  )}
                  {fullText.depositSourcesLink && (
                    <p style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: '0 0 0.75rem' }}>
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
                    <p key={`t-${i}`} style={{ fontSize: '15px', color: C.textSecondary, lineHeight: 1.65, margin: 0 }}>
                      {linkifyGlossaryTerms(p, JOURNEY_GLOSSARY_LINKS, usedAnchors, onNavigate)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

      {/* Who's involved */}
      <p style={label}>Who's involved</p>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {stage.who.map((w) => {
          const info = findWhoInfo(w);
          return (
            <div key={w} style={{ border: `1px solid ${C.borderLight}`, borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                {info && <WhoIcon name={info.who} />}
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: C.navy, margin: 0 }}>{info ? info.who : w}</p>
                  {info && <span style={{ fontSize: '12px', fontWeight: 600, color: C.textSecondary }}>Works for {info.worksFor.charAt(0).toLowerCase() + info.worksFor.slice(1)}</span>}
                </div>
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
            {!last && <span aria-hidden="true" style={{ position: 'absolute', left: '27px', top: '50px', bottom: '-6px', width: '2px', background: complete ? C.red : '#D5E0F2' }} />}
            <button
              type="button"
              onClick={() => setSelectedStage(i)}
              aria-current={selected ? 'step' : undefined}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.6rem', margin: '0 0 6px', borderRadius: '14px', border: 'none', background: selected ? '#EAF1FE' : 'transparent', cursor: 'pointer', textAlign: 'left', position: 'relative' }}
            >
              <span style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: complete ? C.red : selected ? C.accent : 'white', border: complete || selected ? 'none' : `2px solid #D5E0F2` }}>
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

  const progressCard = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: C.inputBg, borderRadius: '18px', padding: '1rem', marginBottom: '1.25rem' }}>
      <ProgressRing pct={progressPct} size={isMobile ? 72 : 84} />
      <div>
        <p style={{ margin: '0 0 0.2rem', fontSize: '15px', fontWeight: 700, color: C.navy }}>{progressPct === 100 ? 'All done!' : 'Your progress'}</p>
        <p style={{ margin: 0, fontSize: '13px', color: C.textSecondary, lineHeight: 1.45 }}>{doneTodos} of {totalTodos} to-dos ticked off</p>
      </div>
    </div>
  );

  const savePrompt = !user && (
    <div style={{ marginTop: '1.25rem', background: C.navy, color: 'white', borderRadius: '18px', padding: '1.1rem' }}>
      <p style={{ margin: '0 0 0.3rem', fontSize: '16px', fontWeight: 700 }}>Save your progress</p>
      <p style={{ margin: '0 0 0.9rem', fontSize: '13px', color: '#C2CDE2', lineHeight: 1.5 }}>Your ticks are saved on this device for now. Create a free account to pick up where you left off on any device.</p>
      <button type="button" onClick={() => setShowAuthModal(true)} style={{ ...primaryBtn, width: '100%' }}>Save my progress</button>
    </div>
  );

  return (
    <div>
      <PlaybookHeader title="Your journey" onExit={onExit} onBackToHub={onBackToHub} />
      <PlaybookCard style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
        {/* Top: how it's being sold */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem 1.25rem', marginBottom: '1.5rem' }}>
          {pathToggle}
          <p style={{ margin: 0, fontSize: '14px', color: C.textSecondary, lineHeight: 1.5, flex: '1 1 260px' }}>
            Pick how the home is being sold. Your ticks carry across both, so nothing is lost if you switch.
          </p>
        </div>

        {isMobile ? (
          <>
            {progressCard}
            {stageList}
            {savePrompt}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
            <div>
              {progressCard}
              {stageList}
              {savePrompt}
            </div>
            <div style={{ borderLeft: `1px solid ${C.borderLight}`, paddingLeft: '2rem' }}>{stageDetail}</div>
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

