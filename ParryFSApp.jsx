import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import FirstHomePlaybookRouter from './src/first-home-playbook/FirstHomePlaybookRouter.jsx';

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://cpwbixddgcyingntsxci.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwd2JpeGRkZ2N5aW5nbnRzeGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNjgzMjksImV4cCI6MjEwMTY0NDMyOX0.-K5k0pyWV_piJCdcwQUiAzUND-PM35VOXSZSaBSbP6g';

const supabase = (() => {
  const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' };
  
  const getSession = async () => {
    const stored = localStorage.getItem('sb_session');
    return stored ? JSON.parse(stored) : null;
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`;
    window.location.href = redirectUrl;
  };

  const signInWithEmail = async (email, password) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('sb_session', JSON.stringify(data));
      return { data, error: null };
    }
    return { data: null, error: data };
  };

  const signUpWithEmail = async (email, password) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST', headers,
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('sb_session', JSON.stringify(data));
      return { data, error: null };
    }
    return { data: null, error: data };
  };

  const signOut = async () => {
    const session = await getSession();
    if (session?.access_token) {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { ...headers, 'Authorization': `Bearer ${session.access_token}` }
      });
    }
    localStorage.removeItem('sb_session');
  };

  const getUser = async () => {
    const session = await getSession();
    if (!session?.access_token) return null;
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { ...headers, 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!res.ok) { localStorage.removeItem('sb_session'); return null; }
    return await res.json();
  };

  const saveScenario = async (name, inputs, results) => {
    const session = await getSession();
    if (!session?.access_token) return { error: 'Not logged in' };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_scenarios`, {
      method: 'POST',
      headers: { ...headers, 'Authorization': `Bearer ${session.access_token}`, 'Prefer': 'return=representation' },
      body: JSON.stringify({ name, inputs, results, user_id: session.user?.id || JSON.parse(atob(session.access_token.split('.')[1])).sub })
    });
    const data = await res.json();
    return res.ok ? { data, error: null } : { data: null, error: data };
  };

  const getScenarios = async () => {
    const session = await getSession();
    if (!session?.access_token) return { data: [], error: null };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_scenarios?order=created_at.desc`, {
      headers: { ...headers, 'Authorization': `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    return res.ok ? { data, error: null } : { data: [], error: data };
  };

  const deleteScenario = async (id) => {
    const session = await getSession();
    if (!session?.access_token) return { error: 'Not logged in' };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_scenarios?id=eq.${id}`, {
      method: 'DELETE',
      headers: { ...headers, 'Authorization': `Bearer ${session.access_token}` }
    });
    return res.ok ? { error: null } : { error: 'Failed to delete' };
  };

  // Handle OAuth callback
  const handleOAuthCallback = async () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const session = {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        expires_in: params.get('expires_in'),
      };
      localStorage.setItem('sb_session', JSON.stringify(session));
      window.location.hash = '';
      return true;
    }
    return false;
  };

  return { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, getUser, saveScenario, getScenarios, deleteScenario, handleOAuthCallback };
})();

// ─── WINDOW WIDTH HOOK ───────────────────────────────────────────────────────
function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

// ─── SHARED STYLES ───────────────────────────────────────────────────────────
const C = {
  bg: 'linear-gradient(135deg, #E6E9F0 0%, #EEF1F5 100%)',
  headerBg: 'linear-gradient(135deg, #A8B5E5 0%, #C5CEED 100%)',
  cardBg: 'white',
  accent: '#1a1a2e',
  accentLight: 'linear-gradient(135deg, #E8EAF6 0%, #F3F4FB 100%)',
  inputBg: '#F7F8FB',
  textPrimary: '#1a1a2e',
  textSecondary: '#6b6b85',
  textMuted: '#8a8aa8',
  borderLight: '#E8EBF0',
  purple: '#A8B5E5',
  green: '#2E7D60',
  greenBg: 'linear-gradient(135deg, #C5EEDD 0%, #D5F2E6 100%)',
  greenBorder: '#7CC9A9',
  red: '#C62828',
  redBg: 'linear-gradient(135deg, #F5D6D6 0%, #FADEDE 100%)',
  redBorder: '#E57373',
  orange: '#FF9800',
  orangeBg: 'linear-gradient(135deg, #FFE8CC 0%, #FFF0DD 100%)',
  orangeBorder: '#FFB74D',
  blue: '#2196F3',
  blueBg: 'linear-gradient(135deg, #D4E3FC 0%, #E0EBFC 100%)',
  blueBorder: '#90B4E6',
};

const card = {
  background: C.cardBg,
  borderRadius: '24px',
  padding: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  marginBottom: '1.5rem',
};

const inputWrap = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: C.inputBg,
  padding: '1rem 1.25rem',
  borderRadius: '12px',
};

const inputStyle = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  fontSize: '18px',
  fontWeight: '500',
  color: C.textPrimary,
  outline: 'none',
};

const selectStyle = {
  width: '100%',
  background: C.inputBg,
  border: '2px solid transparent',
  padding: '1rem 1.25rem',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '500',
  color: C.textPrimary,
  cursor: 'pointer',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  marginBottom: '0.75rem',
  color: C.textPrimary,
};

const primaryBtn = {
  background: C.accent,
  border: 'none',
  color: 'white',
  padding: '0.875rem 2rem',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(26,26,46,0.25)',
};

const secondaryBtn = {
  background: 'rgba(255,255,255,0.8)',
  border: 'none',
  color: C.textPrimary,
  padding: '0.875rem 2rem',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtNZD = (v, decimals = 0) =>
  (v ?? 0).toLocaleString('en-NZ', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const parseMoney = (v) => Number(String(v).replace(/[^0-9.-]+/g, '')) || 0;

const fmtInput = (v) => (v ? Number(v).toLocaleString('en-NZ') : '');

const calcPMT = (principal, annualRate, years, periodsPerYear = 12) => {
  if (!principal || !years) return 0;
  const r = annualRate / 100 / periodsPerYear;
  const n = years * periodsPerYear;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const fmtYrsMonths = (totalMonths) => {
  const y = Math.floor(totalMonths / 12);
  const m = Math.round(totalMonths % 12);
  if (!y && !m) return '0 months';
  if (!y) return `${m} month${m !== 1 ? 's' : ''}`;
  if (!m) return `${y} year${y !== 1 ? 's' : ''}`;
  return `${y} yr${y !== 1 ? 's' : ''} ${m} mo${m !== 1 ? 's' : ''}`;
};

// ─── SHARED FIELD COMPONENTS ─────────────────────────────────────────────────
const MoneyField = ({ label, value, onChange, placeholder = '0', hint }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <label style={labelStyle}>{label}</label>
    <div style={inputWrap}>
      <span style={{ fontSize: '18px', color: C.textPrimary, fontWeight: '500' }}>$</span>
      <input
        type="text"
        inputMode="numeric"
        value={fmtInput(value)}
        onChange={(e) => onChange(parseMoney(e.target.value))}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
    {hint && <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.5rem 0 0' }}>{hint}</p>}
  </div>
);

const RateField = ({ label, value, onChange, placeholder = '0.00', hint }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <label style={labelStyle}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', background: C.inputBg, padding: '1rem 1.25rem', borderRadius: '12px', gap: '8px' }}>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        value={value || ''}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '18px', fontWeight: '500', color: C.textPrimary, outline: 'none', minWidth: 0 }}
      />
      <span style={{ fontSize: '18px', color: C.textPrimary, fontWeight: '500', flexShrink: 0 }}>%</span>
    </div>
    {hint && <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.5rem 0 0' }}>{hint}</p>}
  </div>
);

const Disclaimer = () => (
  <div style={{ background: C.inputBg, borderRadius: '12px', padding: '1rem', border: `1px solid ${C.borderLight}`, marginTop: '1.5rem' }}>
    <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>
      <strong>Disclaimer:</strong> This calculator is a guide only. It does not provide financial advice and does not consider your full financial situation. Results are based on the assumptions provided and may differ from actual outcomes. Please consult a mortgage adviser before making any decisions.
    </p>
  </div>
);

const StatCard = ({ label, value, sub, highlight, onClick, hint }) => (
  <div
    onClick={onClick}
    style={{
      background: highlight ? (highlight === 'green' ? C.greenBg : C.redBg) : C.accentLight,
      borderRadius: '16px',
      padding: '1.5rem',
      border: `2px solid ${highlight ? (highlight === 'green' ? C.greenBorder : C.redBorder) : 'rgba(168,181,229,0.3)'}`,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
    onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
  >
    <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.5rem', fontWeight: '500' }}>{label}</p>
    <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: highlight === 'green' ? C.green : highlight === 'red' ? C.red : C.textPrimary }}>
      {value}
    </p>
    {sub && <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.25rem 0 0' }}>{sub}</p>}
    {hint && <p style={{ fontSize: '12px', color: C.textSecondary, margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <i className="ti ti-click" style={{ fontSize: '14px' }} /> {hint}
    </p>}
  </div>
);

// ─── AUTH HOOK ───────────────────────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.handleOAuthCallback().then(() => {
      supabase.getUser().then(u => { setUser(u); setLoading(false); });
    });
  }, []);

  const signOut = async () => { await supabase.signOut(); setUser(null); };
  const refreshUser = async () => { const u = await supabase.getUser(); setUser(u); };

  return { user, loading, signOut, refreshUser };
}

// ─── AUTH MODAL ──────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin'); // signin | signup | forgot | confirm
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async () => {
    setError('');
    if (mode === 'signup' && !passwordValid) { setError('Please meet all password requirements'); return; }
    if (mode === 'signup' && (!firstName.trim() || !lastName.trim())) { setError('Please enter your first and last name'); return; }
    
    setLoading(true);

    if (mode === 'forgot') {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, redirect_to: 'https://parryfs.com' })
      });
      setLoading(false);
      if (res.ok) { setMode('confirm'); setConfirmEmail(email); }
      else setError('Could not send reset email. Please try again.');
      return;
    }

    if (mode === 'signup') {
      const { data, error: err } = await supabase.signUpWithEmail(email, password);
      setLoading(false);
      if (err) {
        const msg = err.message || err.error_description || '';
        if (msg.includes('already registered')) setError('An account with this email already exists. Please sign in.');
        else setError(msg || 'Something went wrong. Please try again.');
        return;
      }
      // Success - show confirmation screen regardless of whether access_token exists
      setConfirmEmail(email);
      setMode('confirm');
      return;
    }

    const { data, error: err } = await supabase.signInWithEmail(email, password);
    setLoading(false);
    if (err) {
      const msg = err.message || err.error_description || '';
      if (msg.includes('Invalid login')) setError('Incorrect email or password. Please try again.');
      else if (msg.includes('Email not confirmed')) setError('Please confirm your email first. Check your inbox.');
      else setError(msg || 'Something went wrong. Please try again.');
      return;
    }
    onSuccess();
  };

  const CheckItem = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: ok ? C.green : C.textSecondary }}>
      <i className={`ti ti-${ok ? 'check' : 'circle'}`} style={{ fontSize: '14px' }} />
      {label}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        
        {/* Privacy Policy sub-view */}
        {showPrivacy ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button onClick={() => setShowPrivacy(false)} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <i className="ti ti-arrow-left" /> Back
              </button>
              <button onClick={onClose} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: '18px', color: C.textPrimary }} />
              </button>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Privacy Policy</h3>
            <PRIVACY_POLICY_CONTENT />
          </>
        ) : mode === 'confirm' ? (
          /* Email confirmation / forgot password sent state */
          <>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <i className="ti ti-mail" style={{ fontSize: '32px', color: C.textPrimary }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 0.75rem', color: C.textPrimary }}>
                {mode === 'confirm' && email === confirmEmail && password ? 'Check your email' : 'Reset link sent'}
              </h3>
              <p style={{ fontSize: '14px', color: C.textSecondary, lineHeight: '1.6', margin: '0 0 1.5rem' }}>
                We've sent an email to <strong>{confirmEmail}</strong>.{' '}
                {password ? 'Click the confirmation link to activate your account.' : 'Click the link to reset your password.'}
              </p>
              <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 1.5rem' }}>
                Can't find it? Check your spam folder.
              </p>
              <button onClick={onClose} style={{ ...primaryBtn, width: '100%' }}>Got it</button>
              <button onClick={() => { setMode('signin'); setPassword(''); }} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '14px', marginTop: '1rem', fontWeight: '500' }}>
                Back to sign in
              </button>
            </div>
          </>
        ) : (
          /* Sign in / Sign up form */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '500', margin: 0, color: C.textPrimary }}>
                {mode === 'signin' ? 'Sign in' : mode === 'forgot' ? 'Reset password' : 'Create account'}
              </h3>
              <button onClick={onClose} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: '18px', color: C.textPrimary }} />
              </button>
            </div>

            {mode !== 'forgot' && (
              <>
                <button
                  onClick={() => supabase.signInWithGoogle()}
                  style={{ width: '100%', background: 'white', border: `2px solid ${C.borderLight}`, borderRadius: '12px', padding: '0.875rem', fontSize: '15px', fontWeight: '500', color: C.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1.5rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.purple}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.borderLight}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
                  <span style={{ fontSize: '13px', color: C.textSecondary }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: C.borderLight }} />
                </div>
              </>
            )}

            {/* Name fields for signup */}
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ ...labelStyle, marginBottom: '0.5rem', fontSize: '13px' }}>First name</label>
                  <div style={{ ...inputWrap, padding: '0.75rem 1rem' }}>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" style={{ ...inputStyle, fontSize: '14px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle, marginBottom: '0.5rem', fontSize: '13px' }}>Last name</label>
                  <div style={{ ...inputWrap, padding: '0.75rem 1rem' }}>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" style={{ ...inputStyle, fontSize: '14px' }} />
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Email</label>
              <div style={{ ...inputWrap, padding: '0.875rem 1rem' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ ...inputStyle, fontSize: '15px' }} />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: mode === 'signup' ? '0.75rem' : '1.5rem' }}>
                <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Password</label>
                <div style={{ ...inputWrap, padding: '0.875rem 1rem' }}>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inputStyle, fontSize: '15px' }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                </div>
              </div>
            )}

            {/* Password requirements for signup */}
            {mode === 'signup' && password.length > 0 && (
              <div style={{ background: C.inputBg, borderRadius: '10px', padding: '0.875rem', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <CheckItem ok={passwordChecks.length} label="8+ characters" />
                <CheckItem ok={passwordChecks.uppercase} label="Uppercase letter" />
                <CheckItem ok={passwordChecks.number} label="Number" />
                <CheckItem ok={passwordChecks.special} label="Special character" />
              </div>
            )}

            {mode === 'signin' && (
              <div style={{ textAlign: 'right', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
                <button onClick={() => { setMode('forgot'); setError(''); }} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: 0 }}>
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p style={{ fontSize: '13px', color: C.red, margin: '0 0 1rem', padding: '0.75rem', background: '#FFEBEE', borderRadius: '8px' }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading} style={{ ...primaryBtn, width: '100%', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : mode === 'forgot' ? 'Send reset link' : 'Create account'}
            </button>

            {mode !== 'forgot' && (
              <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, marginTop: '1.25rem', marginBottom: 0 }}>
                {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontWeight: '500', fontSize: '14px', padding: 0 }}>
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p style={{ textAlign: 'center', fontSize: '14px', color: C.textSecondary, marginTop: '1.25rem', marginBottom: 0 }}>
                <button onClick={() => { setMode('signin'); setError(''); }} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontWeight: '500', fontSize: '14px', padding: 0 }}>
                  Back to sign in
                </button>
              </p>
            )}

            <p style={{ textAlign: 'center', fontSize: '12px', color: C.textSecondary, marginTop: '1.25rem', marginBottom: 0 }}>
              By continuing, you agree to our{' '}
              <button onClick={() => setShowPrivacy(true)} style={{ background: 'none', border: 'none', color: C.blue, cursor: 'pointer', fontSize: '12px', padding: 0, textDecoration: 'underline' }}>
                Privacy Policy
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const PRIVACY_POLICY_CONTENT = () => (
  <div style={{ fontSize: '13px', color: '#4a4a68', lineHeight: '1.7' }}>
    <p><strong>Parry Financial Services</strong><br />Last updated: August 2026</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>1. Introduction</h4>
    <p>Parry Financial Services ("we", "us", "our") operates the mortgage calculator tools available at parryfs.com. We are committed to protecting your personal information in accordance with the New Zealand Privacy Act 2020.</p>
    <p>This policy explains what information we collect, why we collect it, how we use it, and your rights regarding that information.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>2. Who We Are</h4>
    <p>
      <strong>Business name:</strong> Parry Financial Services<br />
      <strong>Trading as:</strong> Parry Financial Services (a Mike Pero Mortgages franchise)<br />
      <strong>Contact:</strong> dan@parryfs.com<br />
      <strong>Location:</strong> Auckland, New Zealand
    </p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>3. What Information We Collect</h4>
    <p><strong>If you use the calculators without an account:</strong><br />We do not collect any personal information. All calculations happen in your browser and no data is stored.</p>
    <p><strong>If you create an account:</strong></p>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>First and last name</li>
      <li>Email address</li>
      <li>Password (stored as an encrypted hash - we never see your actual password)</li>
      <li>Calculator inputs you choose to save (purchase price, deposit, income, debts, expenses, age)</li>
      <li>Saved scenario results</li>
      <li>Date and time of account creation and last sign in</li>
    </ul>
    <p><strong>If you sign in with Google:</strong><br />Your name and email address as provided by Google. We do not receive your Google password.</p>
    <p><strong>Automatically collected:</strong><br />Basic usage data, IP address (for security only), browser type and device type.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>4. What We Do Not Collect</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>Credit card or payment information</li>
      <li>IRD number or tax information</li>
      <li>Bank account details</li>
      <li>Information about specific properties beyond what you enter into the calculator</li>
    </ul>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>5. Why We Collect Your Information</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>To create and manage your account</li>
      <li>To save and retrieve your calculator scenarios</li>
      <li>To send account confirmation and password reset emails</li>
      <li>To improve the calculator tools over time</li>
      <li>To protect against fraud and abuse</li>
    </ul>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>6. Who We Share Your Information With</h4>
    <p><strong>We do not sell your personal information to anyone, ever.</strong></p>
    <p>We use the following trusted third-party services:</p>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li><strong>Supabase</strong> - Secure database and authentication (Oceania region)</li>
      <li><strong>Google</strong> - Authentication only (if you use Google sign-in)</li>
      <li><strong>Resend</strong> - Sending confirmation and password reset emails</li>
      <li><strong>Vercel</strong> - Website hosting</li>
    </ul>
    <p>We do not share your information with mortgage lenders, banks, real estate agents, marketing companies, or data brokers.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>7. How Long We Keep Your Information</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>Account information: Until you delete your account</li>
      <li>Saved scenarios: Until you delete them or close your account</li>
      <li>Usage logs: 90 days</li>
      <li>Email logs: 30 days</li>
    </ul>
    <p>When you delete your account, all personal information and saved scenarios are permanently deleted within 30 days.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>8. Security</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>All data transmitted over encrypted HTTPS connections</li>
      <li>Passwords hashed using industry-standard encryption</li>
      <li>Database access protected by Row Level Security (RLS)</li>
      <li>Reputable, security-audited third-party services</li>
    </ul>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>9. Children</h4>
    <p>This service is intended for adults (18 years and over). We do not knowingly collect information from anyone under 18. Contact us at dan@parryfs.com if you believe a minor has created an account.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>10. Your Rights Under the NZ Privacy Act 2020</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li><strong>Access</strong> - Request a copy of the personal information we hold about you</li>
      <li><strong>Correct</strong> - Ask us to correct inaccurate or incomplete information</li>
      <li><strong>Delete</strong> - Request deletion of your account and all associated data</li>
      <li><strong>Withdraw consent</strong> - Delete your account at any time through the app</li>
    </ul>
    <p>Contact us at <strong>dan@parryfs.com</strong>. We will respond within 20 working days as required by the Privacy Act 2020.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>11. Cookies</h4>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>Authentication token - Keeps you signed in (Session / 7 days)</li>
      <li>Session data - Security and fraud prevention (Session)</li>
    </ul>
    <p>We do not use advertising cookies or tracking cookies.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>12. Disclaimer</h4>
    <p>The calculators on parryfs.com are provided for general information purposes only. They do not constitute financial advice and do not create an adviser/client relationship. Results are estimates based on information you provide and typical bank lending criteria, which may differ from actual bank decisions. For personalised financial advice, please contact a licensed mortgage adviser.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>13. Changes to This Policy</h4>
    <p>We may update this policy from time to time. Continued use of parryfs.com after changes are posted constitutes acceptance of the updated policy. Registered users will be notified of significant changes by email.</p>

    <h4 style={{ color: C.textPrimary, marginTop: '1.5rem' }}>14. Complaints</h4>
    <p>Contact us first at <strong>dan@parryfs.com</strong>. If unsatisfied, you may contact the <strong>Office of the Privacy Commissioner</strong>:</p>
    <ul style={{ paddingLeft: '1.25rem' }}>
      <li>Website: privacy.org.nz</li>
      <li>Phone: 0800 803 909</li>
      <li>Email: enquiries@privacy.org.nz</li>
    </ul>

    <p style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${C.borderLight}`, fontSize: '12px' }}>
      Parry Financial Services | parryfs.com | dan@parryfs.com
    </p>
  </div>
);
function SavedScenarios({ onClose, onLoad }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.getScenarios().then(({ data }) => { setScenarios(data || []); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    await supabase.deleteScenario(id);
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Saved scenarios</h3>
          <button onClick={onClose} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-x" style={{ fontSize: '18px', color: C.textPrimary }} />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: C.textSecondary, padding: '2rem 0' }}>Loading...</p>
        ) : scenarios.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <i className="ti ti-inbox" style={{ fontSize: '48px', color: C.textSecondary, opacity: 0.3 }} />
            <p style={{ color: C.textSecondary, marginTop: '1rem' }}>No saved scenarios yet. Complete the Borrow Checker and save your results!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {scenarios.map(s => (
              <div key={s.id} style={{ background: C.inputBg, borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 0.25rem', color: C.textPrimary }}>{s.name}</h4>
                    <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>{new Date(s.created_at).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => { onLoad(s); onClose(); }} style={{ ...primaryBtn, padding: '0.5rem 1rem', fontSize: '13px' }}>Load</button>
                    <button onClick={() => handleDelete(s.id)} style={{ background: '#FFF0F0', border: 'none', color: C.red, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Delete</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '12px' }}>
                  <div><span style={{ color: C.textSecondary }}>Loan</span><br /><strong>${(s.results?.loan || 0).toLocaleString('en-NZ')}</strong></div>
                  <div><span style={{ color: C.textSecondary }}>Deposit</span><br /><strong>{s.results?.lvr ? (100 - s.results.lvr).toFixed(1) : 0}%</strong></div>
                  <div><span style={{ color: C.textSecondary }}>Result</span><br /><strong style={{ color: s.results?.umiPass && s.results?.dtiPass ? C.green : C.orange }}>{s.results?.umiPass && s.results?.dtiPass ? 'Pass' : 'Review'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── USER MENU ───────────────────────────────────────────────────────────────
function UserMenu({ user, onSignOut, onSavedScenarios }) {
  const [open, setOpen] = useState(false);
  const initial = (user?.email || '?')[0].toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '700', color: C.textPrimary,
          flexShrink: 0
        }}
      >
        {initial}
      </button>

      {open && (
        <>
          {/* Backdrop to close menu */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '44px', right: 0,
            background: 'white', borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            minWidth: '200px', zIndex: 100,
            overflow: 'hidden'
          }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: `1px solid ${C.borderLight}` }}>
              <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>Signed in as</p>
              <p style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary, margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button
              onClick={() => { setOpen(false); onSavedScenarios(); }}
              style={{ width: '100%', background: 'none', border: 'none', padding: '0.875rem 1rem', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: C.textPrimary, display: 'flex', alignItems: 'center', gap: '10px' }}
              onMouseEnter={e => e.currentTarget.style.background = C.inputBg}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <i className="ti ti-bookmark" style={{ fontSize: '16px', color: C.textSecondary }} />
              Saved scenarios
            </button>
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              style={{ width: '100%', background: 'none', border: 'none', padding: '0.875rem 1rem', textAlign: 'left', cursor: 'pointer', fontSize: '14px', color: C.red, display: 'flex', alignItems: 'center', gap: '10px', borderTop: `1px solid ${C.borderLight}` }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF0F0'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <i className="ti ti-logout" style={{ fontSize: '16px' }} />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── TOP NAV ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'borrow', label: 'Borrow Checker', icon: 'ti-home-check' },
  { id: 'repayment', label: 'Loan Repayment', icon: 'ti-calculator' },
  { id: 'quickrepay', label: 'Quick Repay', icon: 'ti-trending-up' },
  { id: 'comparison', label: 'Mortgage Comparison', icon: 'ti-arrows-exchange' },
  { id: 'breakeven', label: 'Break Even', icon: 'ti-scale' },
  { id: 'costtowait', label: 'Cost to Wait', icon: 'ti-clock' },
  { id: 'bnpl', label: 'BNPL', icon: 'ti-credit-card' },
  { id: 'first-home-playbook', label: 'First Home Playbook', icon: 'ti-key' },
];

const TopNav = ({ active, setActive, user, onSignIn, onSignOut, onSavedScenarios }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const activeTab = TABS.find(t => t.id === active);

  return (
    <div style={{
      background: C.accent,
      padding: '0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        maxWidth: '1100px',
        margin: '0 auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ display: 'flex', flex: 1 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                color: active === tab.id ? 'white' : 'rgba(255,255,255,0.55)',
                padding: '1rem 1.25rem',
                fontSize: '13px',
                fontWeight: active === tab.id ? '600' : '400',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                borderBottom: active === tab.id ? '3px solid white' : '3px solid transparent',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: '16px' }} />
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', gap: '0.5rem', flexShrink: 0 }}>
          {user ? (
            <UserMenu user={user} onSignOut={onSignOut} onSavedScenarios={onSavedScenarios} />
          ) : (
            <button onClick={onSignIn} style={{ background: 'white', border: 'none', color: C.textPrimary, padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── 1. BORROW CHECKER ───────────────────────────────────────────────────────
function BorrowChecker({ onSavePrompt, onSave }) {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [page, setPage] = useState(1);
  const totalPages = 5;

  const [purchasePrice, setPurchasePrice] = useState(650000);
  const [deposit, setDeposit] = useState(0);
  const [mode, setMode] = useState(null); // null = not chosen, 'know' = knows price, 'discover' = wants to find out
  const [depositKiwiSaver, setDepositKiwiSaver] = useState(0);
  const [depositSavings, setDepositSavings] = useState(0);
  const [depositGift, setDepositGift] = useState(0);
  const [depositOther, setDepositOther] = useState(0);
  const [maxBorrowing, setMaxBorrowing] = useState(null);
  const [applicationType, setApplicationType] = useState('single');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [dependents, setDependents] = useState(0);
  const [applicantAge, setApplicantAge] = useState('');
  const [partnerAge, setPartnerAge] = useState('');
  const [baseSalary, setBaseSalary] = useState(85000);
  const [variableIncome, setVariableIncome] = useState(0);
  const [kiwiSaverRate, setKiwiSaverRate] = useState(3.5);
  const [hasStudentLoan, setHasStudentLoan] = useState(false);
  const [partnerBaseSalary, setPartnerBaseSalary] = useState(0);
  const [partnerVariableIncome, setPartnerVariableIncome] = useState(0);
  const [partnerKiwiSaverRate, setPartnerKiwiSaverRate] = useState(3.5);
  const [partnerHasStudentLoan, setPartnerHasStudentLoan] = useState(false);
  const [numBoarders, setNumBoarders] = useState(0);
  const [boarderWeeklyIncome, setBoarderWeeklyIncome] = useState(0);
  const [creditCardLimit, setCreditCardLimit] = useState(0);
  const [bnplLimit, setBnplLimit] = useState(0);
  const [otherMonthlyLoans, setOtherMonthlyLoans] = useState(0);
  const [declaredExpenses, setDeclaredExpenses] = useState(2000);
  const [showExpenseCalc, setShowExpenseCalc] = useState(false);
  const [expenseItems, setExpenseItems] = useState({
    homeContentsInsurance: { amount: '', freq: 'monthly' },
    lifeDisabilityIncome: { amount: '', freq: 'monthly' },
    powerGas: { amount: '', freq: 'monthly' },
    phoneInternet: { amount: '', freq: 'monthly' },
    transportFuel: { amount: '', freq: 'monthly' },
    groceries: { amount: '', freq: 'weekly' },
    education: { amount: '', freq: 'monthly' },
    childcare: { amount: '', freq: 'monthly' },
    childSupport: { amount: '', freq: 'monthly' },
    clothingPersonalCare: { amount: '', freq: 'monthly' },
    donationsTithing: { amount: '', freq: 'monthly' },
    entertainmentRecreation: { amount: '', freq: 'monthly' },
    healthMedicalInsurance: { amount: '', freq: 'monthly' },
    otherLiving: { amount: '', freq: 'monthly' },
  });

  const expenseLabels = {
    homeContentsInsurance: 'Home & contents insurance',
    lifeDisabilityIncome: 'Life, disability & income protection',
    powerGas: 'Power & gas',
    phoneInternet: 'Phone & internet',
    transportFuel: 'Transport & fuel',
    groceries: 'Groceries',
    education: 'Education',
    childcare: 'Childcare',
    childSupport: 'Child support',
    clothingPersonalCare: 'Clothing & personal care',
    donationsTithing: 'Donations & tithing',
    entertainmentRecreation: 'Entertainment & recreation',
    healthMedicalInsurance: 'Health & medical insurance',
    otherLiving: 'Other living expenses',
  };

  const ADDITIONAL_EXPENSE_KEYS = ['entertainmentRecreation', 'donationsTithing', 'childSupport', 'otherLiving', 'lifeDisabilityIncome'];

  const toMonthly = (amount, freq) => {
    const num = parseFloat(amount) || 0;
    if (freq === 'weekly') return num * 52 / 12;
    if (freq === 'fortnightly') return num * 26 / 12;
    return num;
  };

  const totalExpenses = Object.values(expenseItems).reduce((sum, item) => sum + toMonthly(item.amount, item.freq), 0);
  
  const coreExpenses = Object.entries(expenseItems)
    .filter(([key]) => !ADDITIONAL_EXPENSE_KEYS.includes(key))
    .reduce((sum, [, item]) => sum + toMonthly(item.amount, item.freq), 0);

  const additionalExpenses = Object.entries(expenseItems)
    .filter(([key]) => ADDITIONAL_EXPENSE_KEYS.includes(key))
    .reduce((sum, [, item]) => sum + toMonthly(item.amount, item.freq), 0);

  const applyExpenses = () => {
    setDeclaredExpenses(Math.round(totalExpenses));
    setShowExpenseCalc(false);
  };

  const updateExpenseItem = (key, field, value) => {
    setExpenseItems(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };
  const [results, setResults] = useState(null);
  const [showRepayCalc, setShowRepayCalc] = useState(false);
  const [showDepositOptions, setShowDepositOptions] = useState(false);
  const [showUmiBreakdown, setShowUmiBreakdown] = useState(false);
  const [calcLoanAmount, setCalcLoanAmount] = useState(0);
  const [calcRate, setCalcRate] = useState(6.5);
  const [calcTerm, setCalcTerm] = useState(30);

  useEffect(() => {
    if (page === 5) {
      if (mode === 'discover') {
        calculateMaxBorrowing();
      } else {
        calculate();
      }
    }
  }, [page, purchasePrice, deposit, applicationType, isFirstHomeBuyer, dependents, applicantAge, partnerAge,
    baseSalary, variableIncome, kiwiSaverRate, hasStudentLoan,
    partnerBaseSalary, partnerVariableIncome, partnerKiwiSaverRate, partnerHasStudentLoan,
    numBoarders, boarderWeeklyIncome, creditCardLimit, bnplLimit, otherMonthlyLoans, declaredExpenses, additionalExpenses, mode]);

  useEffect(() => {
    if (results) {
      setCalcLoanAmount(results.loan);
      setCalcRate(6.5);
      setCalcTerm(30);
    }
  }, [results]);

  useEffect(() => {
    if (maxBorrowing && maxBorrowing.canBorrow) {
      setCalcLoanAmount(maxBorrowing.maxLoan);
      setCalcRate(6.5);
      setCalcTerm(30);
    }
  }, [maxBorrowing]);

  function calcNetIncome(gross, ksRate) {
    if (!gross) return 0;
    const acc = Math.min(gross, 156641) * 0.0175;
    const brackets = [
      { lower: 0, upper: 15600, rate: 0.105 },
      { lower: 15600, upper: 53500, rate: 0.175 },
      { lower: 53500, upper: 78100, rate: 0.30 },
      { lower: 78100, upper: 180000, rate: 0.33 },
      { lower: 180000, upper: Infinity, rate: 0.39 },
    ];
    let tax = 0;
    for (const b of brackets) {
      if (gross > b.lower) tax += (Math.min(gross, b.upper) - b.lower) * b.rate;
    }
    // IETC (Independent Earner Tax Credit) - matches ASB calculator
    // Full credit $520 for incomes $24,000 - $66,000
    // Phases out at 13 cents per dollar between $66,000 and $70,000
    // No credit above $70,000 or below $24,000
    let ietc = 0;
    if (gross >= 24000 && gross < 66000) {
      ietc = 520;
    } else if (gross >= 66000 && gross < 70000) {
      ietc = Math.max(0, 520 - (gross - 66000) * 0.13);
    }
    return gross - tax - acc + ietc - gross * (ksRate / 100);
  }

  function calculate() {
    const loan = purchasePrice - deposit;
    const lvr = (loan / purchasePrice) * 100;
    const totalBase = baseSalary + (applicationType === 'joint' ? partnerBaseSalary : 0);
    
    // Kainga Ora eligibility - individual threshold $95k, joint threshold $150k
    const isKO = isFirstHomeBuyer && (
      applicationType === 'single' ? baseSalary <= 95000 : totalBase <= 150000
    );

    // Minimum deposit:
    // 5%  - Kainga Ora eligible
    // 10% - standard low deposit (non-KO, banks will lend but limited options)
    // 20% - full standard lending, all bank options available
    const minDepPct = isKO ? 5 : 10;
    const minDep = purchasePrice * (minDepPct / 100);
    const depPass = deposit >= minDep;
    const isFullDeposit = deposit >= purchasePrice * 0.20;

    const shadedVar = variableIncome * 0.8;
    const shadedPVar = (applicationType === 'joint' ? partnerVariableIncome : 0) * 0.8;
    const cappedBoarder = Math.min(boarderWeeklyIncome, 240);
    const shadedBoarder = cappedBoarder * 52 * numBoarders * 0.8;
    const usableGross = baseSalary + shadedVar + (applicationType === 'joint' ? partnerBaseSalary : 0) + shadedPVar + shadedBoarder;

    const primaryNet = calcNetIncome(baseSalary + shadedVar, kiwiSaverRate);
    const partnerNet = applicationType === 'joint' ? calcNetIncome(partnerBaseSalary + shadedPVar, partnerKiwiSaverRate) : 0;
    // Boarder income - 80% shade already applied, no additional tax deduction
    const boarderNet = shadedBoarder / 12;
    const netMonthly = (primaryNet + partnerNet) / 12 + boarderNet;

    const gleeFloor = 829 + (applicationType === 'single' ? 430 : 860) + dependents * 161 + Math.round((usableGross / 12) * 0.07);
    
    // Core declared expenses (compared against GLEE floor)
    // Additional expenses (entertainment, donations, child support) always added on top
    const coreDeclared = Math.round(declaredExpenses - additionalExpenses);
    const livingExp = Math.max(coreDeclared, gleeFloor) + Math.round(additionalExpenses);
    const usingGlee = Math.max(coreDeclared, gleeFloor) === gleeFloor;

    const ccExp = creditCardLimit * 0.038;
    const bnplExp = bnplLimit * 0.05;
    const slThreshold = 24128;
    const primaryGross = baseSalary + shadedVar;
    const partnerGross = applicationType === 'joint' ? partnerBaseSalary + shadedPVar : 0;
    const slMonthly = (hasStudentLoan && primaryGross > slThreshold ? (primaryGross - slThreshold) * 0.12 / 12 : 0)
                    + (partnerHasStudentLoan && partnerGross > slThreshold ? (partnerGross - slThreshold) * 0.12 / 12 : 0);

    const totalDebt = loan + creditCardLimit + bnplLimit;
    const dti = usableGross > 0 ? totalDebt / usableGross : 0;
    const dtiPass = dti <= 6.0;

    // Loan term calculation
    // KO: hard cap, loan must mature before age 72, use older borrower
    // Standard: 30 years always (banks handle age case-by-case)
    const primaryAge = parseInt(applicantAge) || 0;
    const partnerAgeInt = parseInt(partnerAge) || 0;
    const olderAge = applicationType === 'joint' ? Math.max(primaryAge, partnerAgeInt) : primaryAge;
    const koLoanTerm = olderAge > 0 ? Math.min(30, Math.max(1, 72 - olderAge)) : 30;
    const loanTerm = isKO && olderAge > 0 ? koLoanTerm : 30;
    const isOver55 = olderAge >= 55 && !isKO;

    const monthlyRate = 0.07 / 12;
    const n = loanTerm * 12;
    const stressedPmt = loan > 0 ? (loan * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : 0;
    const umi = netMonthly - stressedPmt - livingExp - ccExp - bnplExp - slMonthly - otherMonthlyLoans;

    const isKO2 = isKO;
    let reqUmi = 200, umiStatus = 'standard';
    if (!isFullDeposit) { 
      reqUmi = isKO ? 200 : 500; 
      umiStatus = isKO ? 'kainga_ora' : 'challenging'; 
    }
    const umiPass = umi >= reqUmi;

    const feedback = [];
    
    const hasExistingDebt = creditCardLimit > 0 || bnplLimit > 0 || otherMonthlyLoans > 0;
    const debtAdvice = hasExistingDebt 
      ? 'Consider reducing existing debts or looking at a lower purchase price to improve your position.'
      : 'Consider increasing your deposit or looking at a lower purchase price to improve your position.';

    // Deposit feedback
    if (!depPass) {
      const shortfall = minDep - deposit;
      feedback.push(isKO
        ? { type: 'info', title: 'You qualify for Kainga Ora First Home Loan', message: `Great news! You're eligible for a Kainga Ora First Home Loan with just a 5% deposit. You'll need to save an additional $${fmtNZD(shortfall)} to meet this requirement.` }
        : { type: 'danger', title: 'Deposit too low', message: `You'll need a minimum 10% deposit ($${fmtNZD(minDep)}) to be considered for a mortgage on this property. You're $${fmtNZD(shortfall)} short.` }
      );
    }

    // DTI feedback
    if (!dtiPass) {
      if (isKO && !umiPass) {
        // Merge DTI and KO UMI fail into single message
        feedback.push({ type: 'warning', title: 'Loan amount too high', message: `The mortgage is too large relative to your income. Even with Kainga Ora eligibility, the repayments can't be serviced at this price. ${debtAdvice}` });
      } else {
        feedback.push(hasExistingDebt
          ? { type: 'warning', title: 'Debt levels', message: 'Your total debt (including this mortgage) is higher than banks typically allow. Consider paying down existing debts or increasing your deposit to lower the loan amount.' }
          : { type: 'warning', title: 'Loan amount too high', message: 'The mortgage loan is too large relative to your income. Consider increasing your deposit or looking at a lower-priced property.' }
        );
      }
    }

    // Servicing feedback - only show if DTI hasn't already failed
    if (!umiPass && dtiPass) {
      if (isKO) {
        feedback.push({ type: 'warning', title: 'Almost there', message: `You qualify for a Kainga Ora First Home Loan based on your deposit and income, but your monthly budget is a little tight. ${debtAdvice}` });
      } else if (!isFullDeposit) {
        feedback.push({ type: 'warning', title: 'Deposit and servicing need attention', message: `With less than 20% deposit and a tight monthly budget, lending options are limited. ${debtAdvice}`, expandable: !hasExistingDebt });
      } else {
        feedback.push({ type: 'warning', title: 'Strong deposit, servicing needs work', message: `Your deposit is solid but your monthly budget is too tight for banks to lend comfortably. ${debtAdvice}` });
      }
    } else if (umiPass && !isFullDeposit && !isKO) {
      feedback.push({ type: 'warning', title: 'Limited lending options', message: 'Your servicing is strong, but with less than 20% deposit your options are limited to select lenders and you may pay a low equity margin on your rate. Consider exploring ways to increase your deposit.', expandable: true });
    }

    // Living expenses floor notification
    if (usingGlee) {
      feedback.push({ type: 'info', title: 'Living expenses adjusted', message: `Banks use standard minimum living costs of $${fmtNZD(gleeFloor)} per month for your situation, which is higher than what you declared.` });
    }

    // Over 55 note for standard lending
    if (isOver55) {
      feedback.push({ type: 'info', title: 'Age consideration', message: `As you're over 55, your mortgage adviser will need to document a retirement repayment strategy as part of your application. This is standard practice and doesn't prevent you from borrowing.` });
    }

    // Success feedback
    if (depPass && dtiPass && umiPass) {
      if (isKO) {
        feedback.push({ type: 'success', title: 'Kainga Ora ready!', message: "Excellent! You meet all the criteria for a Kainga Ora First Home Loan. You're ready to start house hunting with confidence." });
      } else if (isFullDeposit) {
        feedback.push({ type: 'success', title: "You're mortgage ready!", message: "Great news! With a strong 20%+ deposit and solid servicing, you'll have excellent lending options across all major banks." });
      } else {
        feedback.push({ type: 'success', title: "You're mortgage ready!", message: "Good news! You meet the lending criteria. With less than 20% deposit you'll have a smaller selection of lenders and may pay a slightly higher rate, but you can proceed with house hunting." });
      }
    }

    setResults({ loan, lvr, depPass, minDep, minDepPct, isFullDeposit, netMonthly, dti, dtiPass, stressedPmt, loanTerm, isOver55, livingExp, ccExp, bnplExp, slMonthly, umi, reqUmi, umiPass, umiStatus, isKO, feedback, usingGlee });
  }

  function calculateMaxBorrowing() {
    const shadedVar = variableIncome * 0.8;
    const shadedPVar = partnerVariableIncome * 0.8;
    const primaryNet = calcNetIncome(baseSalary + shadedVar, kiwiSaverRate);
    const partnerNet = applicationType === 'joint' ? calcNetIncome(partnerBaseSalary + shadedPVar, partnerKiwiSaverRate) : 0;
    const boarderNet = (Math.min(boarderWeeklyIncome, 240) * 52 * numBoarders * 0.8) / 12;
    const netMonthly = (primaryNet + partnerNet) / 12 + boarderNet;

    const usableGross = baseSalary + shadedVar + (applicationType === 'joint' ? partnerBaseSalary : 0) + shadedPVar;
    const gleeFloor = 829 + (applicationType === 'single' ? 430 : 860) + dependents * 161 + Math.round((usableGross / 12) * 0.07);
    const coreDeclared = Math.round(declaredExpenses - additionalExpenses);
    const livingExp = Math.max(coreDeclared, gleeFloor) + Math.round(additionalExpenses);

    const ccExp = creditCardLimit * 0.038;
    const bnplExp = bnplLimit * 0.05;
    const slThreshold = 24128;
    const primarySL = hasStudentLoan ? Math.max(0, (baseSalary - slThreshold) * 0.12 / 12) : 0;
    const partnerSL = partnerHasStudentLoan ? Math.max(0, (partnerBaseSalary - slThreshold) * 0.12 / 12) : 0;
    const slMonthly = primarySL + partnerSL;

    const totalBase = baseSalary + (applicationType === 'joint' ? partnerBaseSalary : 0);
    const isKO = isFirstHomeBuyer && (applicationType === 'single' ? baseSalary <= 95000 : totalBase <= 150000);
    const reqUmi = isKO ? 200 : 500;

    const availableForMortgage = netMonthly - livingExp - ccExp - bnplExp - slMonthly - otherMonthlyLoans - reqUmi;

    if (availableForMortgage <= 0) {
      setMaxBorrowing({ maxLoan: 0, maxPurchase: deposit, canBorrow: false, tips: [] });
      return;
    }

    const primaryAge = parseInt(applicantAge) || 0;
    const partnerAgeInt = parseInt(partnerAge) || 0;
    const olderAge = applicationType === 'joint' ? Math.max(primaryAge, partnerAgeInt) : primaryAge;
    const loanTerm = isKO && olderAge > 0 ? Math.min(30, Math.max(1, 72 - olderAge)) : 30;
    const n = loanTerm * 12;
    const r = 0.07 / 12;

    const maxLoanFromServicing = availableForMortgage * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    const maxLoanFromDTI = usableGross * 6 - creditCardLimit - bnplLimit;
    const maxLoan = Math.max(0, Math.min(maxLoanFromServicing, maxLoanFromDTI));
    const maxPurchase = maxLoan + deposit;

    const tips = [];

    if (creditCardLimit > 0) {
      const ccImpact = creditCardLimit * 0.038 * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      tips.push({ type: 'credit_card', message: `Reducing or closing your credit card limits could increase your borrowing capacity by approximately $${fmtNZD(Math.round(ccImpact / 1000) * 1000)}. Contact your bank to reduce limits on cards you don't fully use.` });
    }

    if (bnplLimit > 0) {
      const bnplImpact = bnplLimit * 0.05 * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
      tips.push({ type: 'bnpl', message: `Closing your Buy Now Pay Later accounts (Afterpay, Laybuy etc.) could increase your borrowing capacity by approximately $${fmtNZD(Math.round(bnplImpact / 1000) * 1000)}. These are easy to close online.` });
    }

    const currentDepositPct = maxPurchase > 0 ? (deposit / maxPurchase) * 100 : 0;
    if (currentDepositPct < 20) {
      const amountTo20 = maxPurchase * 0.20 - deposit;
      if (amountTo20 > 0) tips.push({ type: 'deposit', message: `Saving an additional $${fmtNZD(Math.round(amountTo20 / 1000) * 1000)} would get you to a 20% deposit, opening up more lenders and potentially a better interest rate.` });
    }

    setMaxBorrowing({ maxLoan: Math.round(maxLoan), maxPurchase: Math.round(maxPurchase), canBorrow: maxLoan > 0, tips, depositPct: currentDepositPct, isKO, loanTerm, netMonthly, livingExp });
  }

  const ProgressBar = () => (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
        {[1,2,3,4,5].map(p => (
          <div key={p} style={{ flex: 1, height: '6px', borderRadius: '3px', background: p <= page ? '#1a1a2e' : 'rgba(255,255,255,0.4)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0, textAlign: 'center', opacity: 0.8 }}>Step {page} of {totalPages}</p>
    </div>
  );

  const Nav = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
      <button onClick={() => {
        if (page === 1 && mode !== null) {
          setMode(null);
        } else {
          setPage(Math.max(1, page - 1));
        }
      }} style={{ ...secondaryBtn, opacity: (page === 1 && mode === null) ? 0 : 1, pointerEvents: (page === 1 && mode === null) ? 'none' : 'auto' }}>
        <i className="ti ti-arrow-left" style={{ marginRight: '6px' }} /> Back
      </button>
      {page < totalPages
        ? (page === 1 && mode === null
            ? null
            : <button onClick={() => setPage(page + 1)} style={primaryBtn}>Continue <i className="ti ti-arrow-right" style={{ marginLeft: '6px' }} /></button>)
        : <button onClick={() => { setPage(1); setResults(null); setMaxBorrowing(null); setMode(null); }} style={secondaryBtn}>Start Over</button>
      }
    </div>
  );

  const fmtType = (t) => ({ success: C.greenBg, danger: C.redBg, warning: C.orangeBg, info: C.blueBg }[t]);
  const fmtBorder = (t) => ({ success: C.greenBorder, danger: C.redBorder, warning: C.orangeBorder, info: C.blueBorder }[t]);
  const fmtIcon = (t) => ({ success: '#4CAF50', danger: '#F44336', warning: '#FF9800', info: '#2196F3' }[t]);
  const fmtIconName = (t) => ({ success: 'check', danger: 'alert-circle', warning: 'alert-triangle', info: 'info-circle' }[t]);

  return (
    <div>
      <div style={{ background: C.headerBg, borderRadius: '24px', padding: '2rem 2.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Borrow Checker</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', margin: '0 0 2rem', opacity: 0.9 }}>Find out if you're ready to buy a home in New Zealand</p>
        <ProgressBar />
      </div>

      <div style={{ ...card, padding: '2.5rem' }}>
        {/* PAGE 1 */}
        {page === 1 && (
          <div>
            {mode === null ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Let's get started</h2>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Do you have a property in mind?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button
                    onClick={() => setMode('know')}
                    style={{ background: C.inputBg, border: `2px solid transparent`, borderRadius: '16px', padding: '1.5rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.purple}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>🏡</div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>Yes, I have a property in mind</p>
                    <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0 }}>I know the purchase price and want to check if I can afford it</p>
                  </button>
                  <button
                    onClick={() => setMode('discover')}
                    style={{ background: C.inputBg, border: `2px solid transparent`, borderRadius: '16px', padding: '1.5rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.purple}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>🔍</div>
                    <p style={{ fontSize: '16px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>No, I want to find out what I can afford</p>
                    <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0 }}>Tell me my maximum borrowing power based on my deposit and income</p>
                  </button>
                </div>
              </>
            ) : mode === 'know' ? (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>What property are you looking at?</h2>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Tell us about the property you want to buy</p>
                <MoneyField label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} placeholder="650,000" />
                <MoneyField label="How much deposit have you saved?" value={deposit} onChange={setDeposit} placeholder="130,000" />
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Tell us about your deposit</h2>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Break down where your deposit is coming from</p>

                {/* First home buyer checkbox */}
                <div style={{ background: C.inputBg, padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isFirstHomeBuyer} onChange={e => setIsFirstHomeBuyer(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                    <div>
                      <span style={{ fontWeight: '500', color: C.textPrimary, display: 'block', marginBottom: '0.25rem' }}>I'm buying my first home</span>
                      <span style={{ fontSize: '13px', color: C.textSecondary }}>First home buyers may qualify for Kainga Ora and lower deposit requirements</span>
                    </div>
                  </label>
                </div>

                {/* KiwiSaver - only shown for first home buyers */}
                {isFirstHomeBuyer && (
                  <MoneyField label="KiwiSaver" value={depositKiwiSaver} onChange={v => { setDepositKiwiSaver(v); setDeposit(v + depositSavings + depositGift + depositOther); }} placeholder="0" hint="Your KiwiSaver balance available for first home withdrawal" />
                )}

                <MoneyField label="Savings" value={depositSavings} onChange={v => { setDepositSavings(v); setDeposit(depositKiwiSaver + v + depositGift + depositOther); }} placeholder="0" hint="Cash savings in your bank account" />
                <MoneyField label="Family gift" value={depositGift} onChange={v => { setDepositGift(v); setDeposit(depositKiwiSaver + depositSavings + v + depositOther); }} placeholder="0" hint="Cash contribution from family" />
                <MoneyField label="Other" value={depositOther} onChange={v => { setDepositOther(v); setDeposit(depositKiwiSaver + depositSavings + depositGift + v); }} placeholder="0" hint="Any other sources" />

                {deposit > 0 && (
                  <div style={{ background: C.accentLight, borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 0.25rem' }}>Total deposit</p>
                    <p style={{ fontSize: '24px', fontWeight: '500', color: C.textPrimary, margin: 0 }}>${fmtNZD(deposit)}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PAGE 2 */}
        {page === 2 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Tell us about yourself</h2>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>This helps us understand your situation</p>
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Are you applying alone or with someone?</label>
              <select value={applicationType} onChange={e => setApplicationType(e.target.value)} style={selectStyle}>
                <option value="single">Just me</option>
                <option value="joint">With a partner</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>{applicationType === 'joint' ? 'Your age' : 'Your age'}</label>
              <div style={inputWrap}>
                <input type="number" inputMode="numeric" min="18" max="75" value={applicantAge} onChange={e => setApplicantAge(e.target.value)} placeholder="e.g. 32" style={inputStyle} />
              </div>
            </div>

            {applicationType === 'joint' && (
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Partner's age</label>
                <div style={inputWrap}>
                  <input type="number" inputMode="numeric" min="18" max="75" value={partnerAge} onChange={e => setPartnerAge(e.target.value)} placeholder="e.g. 30" style={inputStyle} />
                </div>
              </div>
            )}
            {mode !== 'discover' && (
              <div style={{ background: C.inputBg, padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isFirstHomeBuyer} onChange={e => setIsFirstHomeBuyer(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <div>
                    <span style={{ fontWeight: '500', color: C.textPrimary, display: 'block', marginBottom: '0.25rem' }}>I'm buying my first home</span>
                    <span style={{ fontSize: '13px', color: C.textSecondary }}>First home buyers may qualify for lower deposit requirements</span>
                  </div>
                </label>
              </div>
            )}
            <div>
              <label style={labelStyle}>How many dependents do you have?</label>
              <select value={dependents} onChange={e => setDependents(Number(e.target.value))} style={selectStyle}>
                <option value={0}>None</option>
                <option value={1}>1 child</option>
                <option value={2}>2 children</option>
                <option value={3}>3 or more children</option>
              </select>
            </div>
          </div>
        )}

        {/* PAGE 3 */}
        {page === 3 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>What's your annual income?</h2>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Include all sources of regular income</p>
            <MoneyField label={applicationType === 'joint' ? 'Your base salary or wages (before tax)' : 'Base salary or wages (before tax)'} value={baseSalary} onChange={setBaseSalary} placeholder="85,000" />
            <MoneyField label={applicationType === 'joint' ? 'Your additional income from bonuses, overtime or commission (optional)' : 'Additional income from bonuses, overtime or commission (optional)'} value={variableIncome} onChange={setVariableIncome} placeholder="0" />
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>{applicationType === 'joint' ? 'Your KiwiSaver contribution rate' : 'KiwiSaver contribution rate'}</label>
              <select value={kiwiSaverRate} onChange={e => setKiwiSaverRate(Number(e.target.value))} style={selectStyle}>
                <option value={0}>Not contributing</option>
                <option value={3}>3%</option>
                <option value={3.5}>3.5% (default)</option>
                <option value={4}>4%</option>
                <option value={6}>6%</option>
                <option value={8}>8%</option>
                <option value={10}>10%</option>
              </select>
            </div>
            <div style={{ background: C.inputBg, padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasStudentLoan} onChange={e => setHasStudentLoan(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <div>
                  <span style={{ fontWeight: '500', color: C.textPrimary, display: 'block', marginBottom: '0.25rem' }}>I have a student loan</span>
                  <span style={{ fontSize: '13px', color: C.textSecondary }}>Repayments will be calculated based on your income</span>
                </div>
              </label>
            </div>

            {applicationType === 'joint' && (
              <div style={{ background: C.accentLight, borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(168,181,229,0.3)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1.25rem', color: C.textPrimary }}>Partner's income</h3>
                <MoneyField label="Partner's base salary or wages (before tax)" value={partnerBaseSalary} onChange={setPartnerBaseSalary} placeholder="0" />
                <MoneyField label="Partner's additional income (optional)" value={partnerVariableIncome} onChange={setPartnerVariableIncome} placeholder="0" />
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Partner's KiwiSaver contribution rate</label>
                  <select value={partnerKiwiSaverRate} onChange={e => setPartnerKiwiSaverRate(Number(e.target.value))} style={{ ...selectStyle, background: 'white' }}>
                    <option value={0}>Not contributing</option>
                    <option value={3}>3%</option>
                    <option value={3.5}>3.5% (default)</option>
                    <option value={4}>4%</option>
                    <option value={6}>6%</option>
                    <option value={8}>8%</option>
                    <option value={10}>10%</option>
                  </select>
                </div>
                <div style={{ background: 'rgba(168,181,229,0.15)', padding: '1rem', borderRadius: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={partnerHasStudentLoan} onChange={e => setPartnerHasStudentLoan(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                    <div>
                      <span style={{ fontWeight: '500', color: C.textPrimary, display: 'block', marginBottom: '0.25rem' }}>Partner has a student loan</span>
                      <span style={{ fontSize: '12px', color: C.textSecondary }}>Repayments calculated on partner's income</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div style={{ marginBottom: numBoarders > 0 ? '2rem' : 0 }}>
              <label style={labelStyle}>Do you have boarders?</label>
              <select value={numBoarders} onChange={e => setNumBoarders(Number(e.target.value))} style={selectStyle}>
                <option value={0}>No boarders</option>
                <option value={1}>1 boarder</option>
                <option value={2}>2 boarders</option>
              </select>
            </div>
            {numBoarders > 0 && (
              <MoneyField label="Weekly rent per boarder (before tax)" value={boarderWeeklyIncome} onChange={setBoarderWeeklyIncome} placeholder="200" hint="Lenders may cap boarder income to a reasonable figure or as otherwise stated in their credit policy." />
            )}
          </div>
        )}

        {/* PAGE 4 */}
        {page === 4 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Your current debts and expenses</h2>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Be honest here - banks will check these anyway</p>
            <MoneyField label="Total credit card limits" value={creditCardLimit} onChange={setCreditCardLimit} placeholder="0" hint="Add up all your credit card limits, even if you don't use them" />
            <MoneyField label="Buy Now Pay Later limits (Afterpay, Zip, etc.)" value={bnplLimit} onChange={setBnplLimit} placeholder="0" />
            <MoneyField label="Other loan repayments per month (car loans, personal loans, etc.)" value={otherMonthlyLoans} onChange={setOtherMonthlyLoans} placeholder="0" hint="For loan repayments only - not child support (add that in the expense calculator above)" />
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Monthly living expenses</label>
              <div style={inputWrap}>
                <span style={{ fontSize: '18px', color: C.textPrimary, fontWeight: '500' }}>$</span>
                <input
                  type="text"
                  value={fmtInput(declaredExpenses)}
                  onChange={e => setDeclaredExpenses(parseMoney(e.target.value))}
                  placeholder="2,000"
                  style={inputStyle}
                />
              </div>
              <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0.5rem 0 0' }}>Banks have minimum requirements based on household size</p>
              <button
                onClick={() => setShowExpenseCalc(true)}
                style={{ background: 'none', border: 'none', padding: '0.5rem 0 0', fontSize: '14px', color: C.blue, cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <i className="ti ti-calculator" style={{ fontSize: '16px' }} />
                Not sure? Help me calculate my expenses
              </button>
            </div>

            {/* Expense Calculator Modal */}
            {showExpenseCalc && (
              <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
                onClick={() => setShowExpenseCalc(false)}
              >
                <div
                  style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '560px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Expense calculator</h3>
                    <button onClick={() => setShowExpenseCalc(false)} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="ti ti-x" style={{ fontSize: '18px', color: C.textPrimary }} />
                    </button>
                  </div>
                  <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>Enter what you know and toggle the frequency. We'll convert everything to a monthly total.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                    {Object.keys(expenseItems).map(key => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: C.inputBg, borderRadius: '12px', padding: '0.75rem 1rem' }}>
                        <span style={{ flex: 1, fontSize: '14px', color: C.textPrimary, fontWeight: '500' }}>{expenseLabels[key]}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '8px', padding: '4px' }}>
                          {['weekly', 'fortnightly', 'monthly'].map(freq => (
                            <button
                              key={freq}
                              onClick={() => updateExpenseItem(key, 'freq', freq)}
                              style={{
                                background: expenseItems[key].freq === freq ? C.accent : 'transparent',
                                color: expenseItems[key].freq === freq ? 'white' : C.textSecondary,
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.15s'
                              }}
                            >
                              {freq === 'fortnightly' ? 'F/N' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', borderRadius: '8px', padding: '6px 10px', width: '100px' }}>
                          <span style={{ fontSize: '14px', color: C.textSecondary }}>$</span>
                          <input
                            type="number"
                            min="0"
                            value={expenseItems[key].amount}
                            onChange={e => updateExpenseItem(key, 'amount', e.target.value)}
                            placeholder="0"
                            style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '14px', color: C.textPrimary, outline: 'none', fontWeight: '500' }}
                          />
                        </div>
                        <span style={{ fontSize: '12px', color: C.textSecondary, width: '70px', textAlign: 'right' }}>
                          {toMonthly(expenseItems[key].amount, expenseItems[key].freq) > 0
                            ? `$${fmtNZD(toMonthly(expenseItems[key].amount, expenseItems[key].freq))}/mo`
                            : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ background: C.headerBg, borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '500', color: C.textPrimary }}>Total monthly expenses</span>
                      <span style={{ fontSize: '26px', fontWeight: '500', color: C.textPrimary }}>${fmtNZD(Math.round(totalExpenses))}</span>
                    </div>
                  </div>

                  <button
                    onClick={applyExpenses}
                    style={{ ...primaryBtn, width: '100%' }}
                  >
                    Use this amount
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAGE 5 - DISCOVER MODE RESULTS */}
        {page === 5 && mode === 'discover' && maxBorrowing && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 2rem', color: C.textPrimary }}>Your borrowing power</h2>

            {maxBorrowing.canBorrow ? (
              <>
                {/* Main result cards */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  <div style={{ background: C.accentLight, borderRadius: '16px', padding: '1.5rem' }}>
                    <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.5rem' }}>Maximum borrowing</p>
                    <p style={{ fontSize: '32px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>${fmtNZD(maxBorrowing.maxLoan)}</p>
                    <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>Stressed at 7% over {maxBorrowing.loanTerm} years</p>
                  </div>
                  <div style={{ background: C.green + '18', borderRadius: '16px', padding: '1.5rem', border: `2px solid ${C.green}` }}>
                    <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.5rem' }}>Maximum purchase price</p>
                    <p style={{ fontSize: '32px', fontWeight: '500', color: C.green, margin: '0 0 0.25rem' }}>${fmtNZD(maxBorrowing.maxPurchase)}</p>
                    <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0 }}>Your loan + ${fmtNZD(deposit)} deposit</p>
                  </div>
                </div>

                {/* Deposit info */}
                <div style={{ background: C.inputBg, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.25rem' }}>Your deposit</p>
                      <p style={{ fontSize: '20px', fontWeight: '500', color: C.textPrimary, margin: 0 }}>${fmtNZD(deposit)} ({maxBorrowing.depositPct.toFixed(1)}%)</p>
                    </div>
                    {maxBorrowing.isKO && (
                      <div style={{ background: C.green + '18', borderRadius: '8px', padding: '0.5rem 1rem' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: C.green, margin: 0 }}>Kainga Ora eligible ✓</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated repayment */}
                <div
                  onClick={() => setShowRepayCalc(true)}
                  style={{ background: C.inputBg, borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.25rem' }}>Estimated monthly repayment</p>
                  <p style={{ fontSize: '20px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.25rem' }}>
                    ${fmtNZD(calcPMT(maxBorrowing.maxLoan, 6.5, 30))}/mo
                  </p>
                  <p style={{ fontSize: '12px', color: C.textSecondary, margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="ti ti-click" style={{ fontSize: '14px' }} /> Based on 6.5% interest rate, 30 year term — click to explore different rates and terms
                  </p>
                </div>

                {/* Tips section */}
                {maxBorrowing.tips.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '500', color: C.textPrimary, margin: '0 0 1rem' }}>💡 Ways to increase your borrowing power</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {maxBorrowing.tips.map((tip, i) => (
                        <div key={i} style={{ background: '#FFF8E7', borderRadius: '12px', padding: '1rem 1.25rem', border: '1px solid #FFE082' }}>
                          <p style={{ fontSize: '14px', color: C.textPrimary, margin: 0, lineHeight: '1.6' }}>
                            {tip.type === 'credit_card' && '💳 '}
                            {tip.type === 'bnpl' && '📱 '}
                            {tip.type === 'deposit' && '💰 '}
                            {tip.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#FFEBEE', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '24px', margin: '0 0 1rem' }}>😔</p>
                <h3 style={{ fontSize: '18px', fontWeight: '500', color: C.textPrimary, margin: '0 0 0.5rem' }}>Borrowing capacity is limited</h3>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: 0, lineHeight: '1.6' }}>Based on your current income and expenses, we're unable to calculate a borrowing capacity. Consider reducing debts or speaking with a mortgage adviser to explore your options.</p>
              </div>
            )}

            <Disclaimer />
            {onSavePrompt && (
              <div style={{ background: C.accentLight, borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', textAlign: 'center' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Save your results</h4>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1rem' }}>Create a free account to save this and come back anytime.</p>
                <button onClick={onSavePrompt} style={{ ...primaryBtn }}>Save my results</button>
              </div>
            )}
            {onSave && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button onClick={() => onSave({}, maxBorrowing)} style={{ ...primaryBtn }}>
                  <i className="ti ti-bookmark" style={{ marginRight: '6px' }} />
                  Save this scenario
                </button>
              </div>
            )}
          </div>
        )}

        {/* PAGE 5 - STANDARD RESULTS */}
        {page === 5 && mode !== 'discover' && results && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 2rem', color: C.textPrimary }}>Your results</h2>

            <div style={{ marginBottom: '2rem' }}>
              {results.feedback.map((item, i) => (
                <div key={i} style={{ background: fmtType(item.type), borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', border: `2px solid ${fmtBorder(item.type)}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: fmtIcon(item.type), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ti-${fmtIconName(item.type)}`} style={{ fontSize: '20px', color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>{item.title}</h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>{item.message}</p>
                      {item.expandable && (
                        <div style={{ marginTop: '1rem' }}>
                          <button onClick={() => setShowDepositOptions(!showDepositOptions)} style={{ ...secondaryBtn, padding: '0.75rem 1.25rem', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`ti ti-chevron-${showDepositOptions ? 'up' : 'down'}`} /> Ways to increase your deposit
                          </button>
                          {showDepositOptions && (
                            <div style={{ marginTop: '1rem', background: 'white', borderRadius: '12px', padding: '1.5rem' }}>
                              {[
                                { icon: 'ti-gift', title: 'Family gift', text: "A one-off cash contribution from family. Banks view this favorably as it reduces the loan amount and increases your equity. The gift must be properly documented with a statutory declaration." },
                                { icon: 'ti-shield-check', title: 'Family guarantee', text: "Your family uses their own property as additional security for your loan. This allows you to borrow with a smaller deposit while your family guarantees a portion of the loan. They don't give you money upfront." },
                                { icon: 'ti-file-text', title: 'Family loan', text: "A properly documented loan from family that's structured to meet bank requirements. The loan terms, repayment schedule, and interest (if any) must be clearly recorded, and banks will factor the repayments into your servicing." },
                                { icon: 'ti-pig-money', title: 'KiwiSaver withdrawal', text: "First home buyers can withdraw their KiwiSaver funds (excluding $1,000 minimum) after 3 years of contributions. This can significantly boost your deposit." },
                              ].map((opt, j) => (
                                <div key={j} style={{ marginBottom: '1.25rem' }}>
                                  <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className={`ti ${opt.icon}`} style={{ color: C.orange }} /> {opt.title}
                                  </h4>
                                  <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>{opt.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Loan amount" value={`$${fmtNZD(results.loan)}`} />
              <StatCard label="Your deposit" value={`${((deposit / purchasePrice) * 100).toFixed(1)}%`} />
              <StatCard
                label="Estimated repayment"
                value={`$${fmtNZD(calcPMT(results.loan, 6.5, 30))}/mo`}
                hint="Click to explore different rates and terms"
                onClick={() => setShowRepayCalc(true)}
              />
              <div
                onClick={() => setShowUmiBreakdown(!showUmiBreakdown)}
                style={{ background: results.umiPass ? C.greenBg : C.redBg, borderRadius: '16px', padding: '1.5rem', border: `2px solid ${results.umiPass ? C.greenBorder : C.redBorder}`, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: showUmiBreakdown ? '1rem' : 0 }}>
                  <div>
                    <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.5rem', fontWeight: '500' }}>Left each month</p>
                    <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: results.umiPass ? C.green : C.red }}>${fmtNZD(Math.max(0, results.umi))}</p>
                  </div>
                  <i className={`ti ti-chevron-${showUmiBreakdown ? 'up' : 'down'}`} style={{ fontSize: '20px', color: C.textPrimary }} />
                </div>
                {!showUmiBreakdown && <p style={{ fontSize: '12px', color: C.textSecondary, margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}><i className="ti ti-click" style={{ fontSize: '14px' }} /> Click to see how this was calculated</p>}
                {showUmiBreakdown && (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem' }} onClick={e => e.stopPropagation()}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>How we calculated this</h4>
                    <div style={{ fontSize: '13px' }}>
                      {[
                        { label: 'Your net monthly income', value: `+$${fmtNZD(results.netMonthly)}`, color: C.green },
                        { label: `Mortgage (stressed at 7% / ${results.loanTerm} yrs)`, value: `-$${fmtNZD(results.stressedPmt)}`, color: C.red },
                        { label: 'Living expenses', value: `-$${fmtNZD(results.livingExp)}`, color: C.red },
                        ...(results.ccExp > 0 ? [{ label: 'Credit cards (3.8% of limits)', value: `-$${fmtNZD(results.ccExp)}`, color: C.red }] : []),
                        ...(results.bnplExp > 0 ? [{ label: 'BNPL (5% of limits)', value: `-$${fmtNZD(results.bnplExp)}`, color: C.red }] : []),
                        ...((hasStudentLoan || partnerHasStudentLoan) && results.slMonthly > 0 ? [{ label: 'Student loan repayment', value: `-$${fmtNZD(results.slMonthly)}`, color: C.red }] : []),
                        ...(otherMonthlyLoans > 0 ? [{ label: 'Other loan repayments', value: `-$${fmtNZD(otherMonthlyLoans)}`, color: C.red }] : []),
                      ].map((row, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                          <span style={{ color: C.textSecondary, flex: 1 }}>{row.label}</span>
                          <span style={{ fontWeight: '500', color: row.color, flexShrink: 0 }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: `2px solid ${C.borderLight}`, paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '500', color: C.textPrimary, flex: 1 }}>Uncommitted monthly income</span>
                        <span style={{ fontWeight: '600', fontSize: '16px', color: results.umiPass ? C.green : C.red, flexShrink: 0 }}>${fmtNZD(Math.max(0, results.umi))}</span>
                      </div>
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: results.umiPass ? '#E8F5E9' : '#FFEBEE', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: C.textSecondary, flex: 1 }}>
                            {results.umiStatus === 'kainga_ora' ? 'Kainga Ora requires' : results.isFullDeposit ? 'Banks require (20%+ deposit)' : 'Banks require (<20% deposit)'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary, flexShrink: 0 }}>${fmtNZD(results.reqUmi)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Disclaimer />
            {onSavePrompt && (
              <div style={{ background: C.accentLight, borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', border: `1px solid rgba(168,181,229,0.3)`, textAlign: 'center' }}>
                <i className="ti ti-bookmark" style={{ fontSize: '28px', color: C.textSecondary, marginBottom: '0.5rem', display: 'block' }} />
                <h4 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Save your results</h4>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1rem' }}>Create a free account to save this scenario and come back to it anytime.</p>
                <button onClick={onSavePrompt} style={{ ...primaryBtn }}>Save my results</button>
              </div>
            )}
            {onSave && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button onClick={onSave} style={{ ...primaryBtn }}>
                  <i className="ti ti-bookmark" style={{ marginRight: '6px' }} />
                  Save this scenario
                </button>
              </div>
            )}
          </div>
        )}
        <Nav />
      </div>

      {/* Repayment Modal */}
      {showRepayCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowRepayCalc(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Repayment calculator</h3>
              <button onClick={() => setShowRepayCalc(false)} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
                <i className="ti ti-x" style={{ fontSize: '20px', color: C.textPrimary }} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>
              {mode === 'discover'
                ? 'Pre-filled with your maximum borrowing amount. Adjust the rate and term to explore different scenarios.'
                : 'Pre-filled with your loan amount. Adjust the rate and term to explore different scenarios.'}
            </p>
            {mode === 'discover' ? (
              <div style={{ ...inputWrap, marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '13px', color: C.textSecondary, flex: 1 }}>Loan amount</span>
                <span style={{ fontSize: '18px', fontWeight: '500', color: C.textPrimary }}>${fmtNZD(calcLoanAmount)}</span>
              </div>
            ) : (
              <MoneyField label="Loan amount" value={calcLoanAmount} onChange={setCalcLoanAmount} />
            )}
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Interest rate: {calcRate.toFixed(2)}%</label>
              <input type="range" min="3" max="10" step="0.1" value={calcRate} onChange={e => setCalcRate(Number(e.target.value))} style={{ width: '100%', height: '8px', borderRadius: '4px', outline: 'none', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>3%</span>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>10%</span>
              </div>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label style={labelStyle}>Loan term: {calcTerm} years</label>
              <input type="range" min="5" max="30" step="1" value={calcTerm} onChange={e => setCalcTerm(Number(e.target.value))} style={{ width: '100%', height: '8px', borderRadius: '4px', outline: 'none', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>5 years</span>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>30 years</span>
              </div>
            </div>
            <div style={{ background: C.headerBg, borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#4a4a68', margin: '0 0 0.5rem', fontWeight: '500' }}>Monthly repayment</p>
              <p style={{ fontSize: '36px', fontWeight: '500', margin: 0, color: C.textPrimary }}>${fmtNZD(calcPMT(calcLoanAmount, calcRate, calcTerm))}</p>
            </div>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: C.inputBg, borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '13px', color: C.textSecondary }}>Total to repay</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary }}>${fmtNZD(calcPMT(calcLoanAmount, calcRate, calcTerm) * calcTerm * 12)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: C.textSecondary }}>Total interest</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary }}>${fmtNZD(calcPMT(calcLoanAmount, calcRate, calcTerm) * calcTerm * 12 - calcLoanAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 2. LOAN REPAYMENT ───────────────────────────────────────────────────────
function LoanRepayment() {
  const [loans, setLoans] = useState([{ id: '1', name: 'Loan 1', balance: 500000, rate: 6.5, years: 30, months: 0, interestOnly: false }]);
  const [showAmort, setShowAmort] = useState(false);
  const [freq, setFreq] = useState('monthly');

  const freqMap = { monthly: 12, fortnightly: 26, weekly: 52 };
  const freqLabel = { monthly: 'Monthly', fortnightly: 'Fortnightly', weekly: 'Weekly' };

  const addLoan = () => setLoans([...loans, { id: Date.now().toString(), name: `Loan ${loans.length + 1}`, balance: 0, rate: 0, years: 30, months: 0, interestOnly: false }]);
  const removeLoan = (id) => loans.length > 1 && setLoans(loans.filter(l => l.id !== id));
  const updateLoan = (id, field, value) => setLoans(loans.map(l => l.id === id ? { ...l, [field]: value } : l));

  const calcPayment = (l) => {
    const totalMonths = l.years * 12 + l.months;
    if (!totalMonths) return 0;
    const ppy = freqMap[freq];
    const n = (totalMonths / 12) * ppy;
    const r = l.rate / 100 / ppy;
    if (l.interestOnly) return (l.balance * l.rate / 100) / ppy;
    if (!r) return l.balance / n;
    return (l.balance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const totalBalance = loans.reduce((s, l) => s + l.balance, 0);
  const wtdRate = totalBalance > 0 ? loans.reduce((s, l) => s + l.rate * l.balance, 0) / totalBalance : 0;
  const totalPayment = loans.reduce((s, l) => s + calcPayment(l), 0);

  const amortRows = (() => {
    const maxMonths = Math.max(...loans.map(l => l.years * 12 + l.months));
    if (!totalBalance || !maxMonths) return [];
    const ppy = freqMap[freq];
    const n = (maxMonths / 12) * ppy;
    const r = wtdRate / 100 / ppy;
    const pmt = r ? (totalBalance * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : totalBalance / n;
    const rows = [];
    let bal = totalBalance;
    for (let i = 1; i <= n && bal > 0.5; i++) {
      const int = bal * r;
      const prin = Math.min(pmt - int, bal);
      bal = Math.max(0, bal - prin);
      rows.push({ num: i, interest: int, principal: prin, payment: int + prin, balance: bal });
    }
    return rows;
  })();

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Loan Repayment Calculator</h1>
            <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>Calculate your repayments and compare multiple loans</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: C.textPrimary, whiteSpace: 'nowrap' }}>Repayment frequency</label>
            <select value={freq} onChange={e => setFreq(e.target.value)} style={{ background: 'rgba(255,255,255,0.8)', border: 'none', padding: '0.625rem 1rem', borderRadius: '10px', fontSize: '15px', fontWeight: '500', color: C.textPrimary, cursor: 'pointer', outline: 'none' }}>
              <option value="monthly">Monthly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      {loans.map((loan) => (
        <div key={loan.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', margin: 0, color: C.textPrimary }}>{loan.name}</h3>
            {loans.length > 1 && (
              <button onClick={() => removeLoan(loan.id)} style={{ background: '#FFF0F0', border: 'none', color: '#C62828', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>Remove</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Loan balance */}
            <div style={{ width: '160px', flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Loan balance</label>
              <div style={{ ...inputWrap, padding: '0.75rem 0.875rem' }}>
                <span style={{ fontSize: '15px', fontWeight: '500', flexShrink: 0 }}>$</span>
                <input type="text" value={fmtInput(loan.balance)} onChange={e => updateLoan(loan.id, 'balance', parseMoney(e.target.value))} style={{ ...inputStyle, fontSize: '15px', minWidth: 0 }} placeholder="500,000" />
              </div>
            </div>
            {/* Rate */}
            <div style={{ width: '110px', flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Rate</label>
              <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                <input type="number" inputMode="decimal" step="0.01" value={loan.rate || ''} onChange={e => updateLoan(loan.id, 'rate', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '52px' }} placeholder="6.5" />
                <span style={{ fontSize: '14px', fontWeight: '500', flexShrink: 0 }}>%</span>
              </div>
            </div>
            {/* Term */}
            <div style={{ flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Term</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '70px' }}>
                  <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                    <input type="number" inputMode="numeric" min="0" max="40" value={loan.years || ''} onChange={e => updateLoan(loan.id, 'years', parseInt(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '32px' }} placeholder="30" />
                  </div>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>Years</span>
                </div>
                <div style={{ width: '70px' }}>
                  <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                    <input type="number" inputMode="numeric" min="0" max="11" value={loan.months || ''} onChange={e => updateLoan(loan.id, 'months', parseInt(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '32px' }} placeholder="0" />
                  </div>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>Months</span>
                </div>
              </div>
            </div>
            {/* Loan type */}
            <div style={{ width: '160px', flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Loan type</label>
              <select value={loan.interestOnly ? 'io' : 'pi'} onChange={e => updateLoan(loan.id, 'interestOnly', e.target.value === 'io')} style={{ ...selectStyle, padding: '0.75rem 0.875rem', fontSize: '14px' }}>
                <option value="pi">Principal & Interest</option>
                <option value="io">Interest Only</option>
              </select>
            </div>
            {/* Payment */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>{freqLabel[freq]} payment</label>
              <div style={{ background: C.accentLight, borderRadius: '12px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '22px', fontWeight: '500', color: C.green }}>${fmtNZD(calcPayment(loan), 2)}</span>
                <span style={{ fontSize: '13px', color: C.textSecondary }}>{freqLabel[freq]}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button onClick={addLoan} style={{ ...secondaryBtn, width: '100%', marginBottom: '1.5rem' }}>+ Add Another Loan</button>

      <div style={{ ...card, background: C.accentLight }}>
        <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 1.5rem', color: C.textPrimary }}>Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { label: 'Total loan amount', value: `$${fmtNZD(totalBalance)}` },
            { label: 'Weighted average rate', value: `${wtdRate.toFixed(2)}%` },
            { label: `Total ${freqLabel[freq].toLowerCase()} payment`, value: `$${fmtNZD(totalPayment, 2)}` },
          ].map((s, i) => (
            <div key={i}>
              <p style={{ fontSize: '13px', color: C.textSecondary, margin: '0 0 0.5rem' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '500', margin: 0, color: i === 2 ? C.green : C.textPrimary }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAmort ? '1.5rem' : 0 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Amortisation Schedule</h3>
          <button onClick={() => setShowAmort(!showAmort)} style={{ ...secondaryBtn, padding: '0.625rem 1.25rem', fontSize: '14px' }}>{showAmort ? 'Hide' : 'Show'} Schedule</button>
        </div>
        {showAmort && (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: C.inputBg }}>
                  {[freqLabel[freq], 'Payment', 'Principal', 'Interest', 'Balance'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {amortRows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: C.textSecondary }}>{row.num}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right' }}>${fmtNZD(row.payment, 2)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: C.green }}>${fmtNZD(row.principal, 2)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', color: C.red }}>${fmtNZD(row.interest, 2)}</td>
                    <td style={{ padding: '0.625rem 1rem', textAlign: 'right', fontWeight: '500' }}>${fmtNZD(row.balance, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Disclaimer />
    </div>
  );
}

// ─── 3. QUICK REPAY ──────────────────────────────────────────────────────────
function QuickRepay() {
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const [loanAmount, setLoanAmount] = useState(300000);
  const [rate, setRate] = useState(5.75);
  const [years, setYears] = useState(30);
  const [freq, setFreq] = useState('Monthly');
  const [extraAmt, setExtraAmt] = useState(0);
  const [extraAfter, setExtraAfter] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpAfter, setLumpAfter] = useState(0);
  const [results, setResults] = useState(null);

  const freqPeriods = { Monthly: 12, Fortnightly: 26, Weekly: 52 };

  const generate = (amt, r, yrs, fr, extra, extraStart, lump, lumpAt) => {
    const ppy = freqPeriods[fr];
    const n = yrs * ppy;
    const rp = r / 100 / ppy;
    const pmt = (amt * rp) / (1 - Math.pow(1 + rp, -n));
    const extraStartPeriod = Math.round(extraStart * ppy);
    const lumpPeriod = Math.round(lumpAt * ppy);
    let bal = amt, rows = [];
    for (let i = 1; i <= n && bal > 0.5; i++) {
      const int = bal * rp;
      let prin = pmt - int;
      if (extra > 0 && i >= extraStartPeriod) prin += extra;
      if (lump > 0 && i === lumpPeriod) prin += lump;
      if (prin > bal) prin = bal;
      bal = Math.max(0, bal - prin);
      rows.push({ num: i, interest: int, principal: prin, payment: int + prin, balance: bal, year: i / ppy });
    }
    return { rows, pmt };
  };

  useEffect(() => {
    if (!loanAmount || !rate || !years) { setResults(null); return; }
    const with_ = generate(loanAmount, rate, years, freq, extraAmt, extraAfter, lumpSum, lumpAfter);
    const base = generate(loanAmount, rate, years, freq, 0, 0, 0, 0);
    const baseInt = base.rows.reduce((s, r) => s + r.interest, 0);
    const withInt = with_.rows.reduce((s, r) => s + r.interest, 0);
    setResults({ with: with_, base, interestSaved: baseInt - withInt, termSaved: base.rows.length - with_.rows.length, basePmt: base.pmt });
  }, [loanAmount, rate, years, freq, extraAmt, extraAfter, lumpSum, lumpAfter]);

  const reset = () => { setLoanAmount(300000); setRate(5.75); setYears(30); setFreq('Monthly'); setExtraAmt(0); setExtraAfter(0); setLumpSum(0); setLumpAfter(0); };

  const ppy = freqPeriods[freq];

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Quick Repay Calculator</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>See how extra repayments can save you interest and time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1.5rem', color: C.textPrimary }}>Inputs</h3>
          <MoneyField label="Loan amount" value={loanAmount} onChange={setLoanAmount} placeholder="300,000" />
          <RateField label="Interest rate" value={rate} onChange={setRate} placeholder="5.75" />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Term (years)</label>
            <div style={inputWrap}><input type="number" inputMode="numeric" min="1" value={years} onChange={e => setYears(parseInt(e.target.value) || 1)} style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Frequency</label>
            <select value={freq} onChange={e => setFreq(e.target.value)} style={selectStyle}>
              {['Monthly', 'Fortnightly', 'Weekly'].map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: C.accentLight, borderRadius: '12px' }}>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>Extra repayment</label>
            <MoneyField label="Amount per period" value={extraAmt} onChange={setExtraAmt} placeholder="0" />
            <div>
              <label style={labelStyle}>Starting after (years)</label>
              <div style={inputWrap}><input type="number" inputMode="decimal" min="0" step="0.1" value={extraAfter} onChange={e => setExtraAfter(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: C.accentLight, borderRadius: '12px' }}>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>Lump sum repayment</label>
            <MoneyField label="Amount" value={lumpSum} onChange={setLumpSum} placeholder="0" />
            <div>
              <label style={labelStyle}>After (years)</label>
              <div style={inputWrap}><input type="number" inputMode="decimal" min="0" step="0.1" value={lumpAfter} onChange={e => setLumpAfter(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
            </div>
          </div>
          <button onClick={reset} style={{ ...secondaryBtn, width: '100%', background: '#FFF0F0', color: C.red }}>Reset</button>
        </div>

        <div>
          {results && (
            <>
              <div style={{ ...card, background: C.accentLight }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 1.5rem', color: C.textPrimary }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1rem' }}>
                  <StatCard label="Regular payment" value={`$${fmtNZD(results.basePmt, 2)}`} sub={freq} />
                  <StatCard label="Total payments" value={results.with.rows.length.toString()} />
                  {results.interestSaved > 0 && <StatCard label="Interest saved" value={`$${fmtNZD(results.interestSaved)}`} highlight="green" />}
                  {results.termSaved > 0 && <StatCard label="Time saved" value={fmtYrsMonths(results.termSaved / ppy * 12)} highlight="green" />}
                </div>
              </div>

              <div style={card}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Loan balance over time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart margin={{ bottom: 20 }}>
                    <XAxis dataKey="year" type="number" domain={[0, 'dataMax']} label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`$${fmtNZD(v)}`, '']} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                    <Line data={results.with.rows} type="monotone" dataKey="balance" stroke="#1a1a2e" name="With extra payments" dot={false} strokeWidth={2} />
                    <Line data={results.base.rows} type="monotone" dataKey="balance" stroke={C.orange} name="Original schedule" dot={false} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={card}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Amortisation</h3>
                <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead style={{ position: 'sticky', top: 0, background: C.inputBg }}>
                      <tr>{['Period', 'Payment', 'Principal', 'Interest', 'Balance'].map(h => <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {results.with.rows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: C.textSecondary }}>{row.num}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right' }}>${fmtNZD(row.payment, 2)}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: C.green }}>${fmtNZD(row.principal, 2)}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: C.red }}>${fmtNZD(row.interest, 2)}</td>
                          <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: '500' }}>${fmtNZD(row.balance, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {!results && (
            <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', background: C.accentLight }}>
              <div style={{ textAlign: 'center' }}>
                <i className="ti ti-calculator" style={{ fontSize: '48px', color: C.textSecondary, opacity: 0.4 }} />
                <p style={{ color: C.textSecondary, marginTop: '1rem' }}>Enter your loan details to see results</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

// ─── 4. MORTGAGE COMPARISON ──────────────────────────────────────────────────
const MCTextField = ({ label, value, onChange, placeholder }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', background: C.inputBg, border: 'none', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '14px', color: C.textPrimary, outline: 'none', boxSizing: 'border-box' }} />
  </div>
);

const MCNumField = ({ label, value, onChange, placeholder, suffix }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', background: C.inputBg, borderRadius: '8px', overflow: 'hidden' }}>
      <input type="number" inputMode="decimal" step="0.01" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, border: 'none', background: 'transparent', padding: '0.625rem 0.875rem', fontSize: '14px', color: C.textPrimary, outline: 'none', boxSizing: 'border-box' }} />
      {suffix && <span style={{ padding: '0 0.75rem', fontSize: '14px', color: C.textSecondary, flexShrink: 0 }}>{suffix}</span>}
    </div>
  </div>
);

const MCCurrencyField = ({ label, value, onChange, placeholder }) => {
  const [display, setDisplay] = React.useState(value ? Number(value).toLocaleString('en-NZ') : '');

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    setDisplay(e.target.value);
    onChange(raw);
  };

  const handleBlur = () => {
    const num = parseFloat(value.toString().replace(/,/g, ''));
    if (!isNaN(num)) {
      setDisplay(num.toLocaleString('en-NZ'));
    } else {
      setDisplay('');
    }
  };

  const handleFocus = () => {
    const raw = value.toString().replace(/,/g, '');
    setDisplay(raw);
  };

  return (
    <div>
      <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', background: C.inputBg, borderRadius: '8px', padding: '0.625rem 0.875rem', gap: '4px' }}>
        <span style={{ fontSize: '14px', color: C.textSecondary, flexShrink: 0 }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: C.textPrimary, outline: 'none' }}
        />
      </div>
    </div>
  );
};

function MortgageComparison() {
  const initLoan = () => ({ name: '', amount: '', rate: '', curRepayment: '', curFreq: 'Monthly', newRate: '', newRepayment: '', newFreq: 'Monthly' });
  const [loans, setLoans] = useState([initLoan(), initLoan(), initLoan(), initLoan()]);
  const [results, setResults] = useState([]);

  const freqPeriods = { Weekly: 52, Fortnightly: 26, Monthly: 12 };

  const update = (i, field, value) => {
    const next = [...loans];
    next[i] = { ...next[i], [field]: value };
    setLoans(next);
  };

  const calcTerm = (amt, r, pmt, freq) => {
    const ppy = freqPeriods[freq];
    const rp = r / 100 / ppy;
    if (!rp) return { months: Math.ceil(amt / pmt) / ppy * 12, interest: 0 };
    const n = -Math.log(1 - (amt * rp) / pmt) / Math.log(1 + rp);
    return { months: n / ppy * 12, interest: Math.max(0, n * pmt - amt) };
  };

  const calc = () => {
    setResults(loans.map(l => {
      const amt = parseFloat(l.amount.toString().replace(/,/g, '')) || 0;
      const rate = parseFloat(l.rate) || 0;
      const curRep = parseFloat(l.curRepayment.toString().replace(/,/g, '')) || 0;
      if (!amt || !rate || !curRep) return null;
      const cur = calcTerm(amt, rate, curRep, l.curFreq);
      const nr = parseFloat(l.newRate) || rate;
      const nrep = parseFloat(l.newRepayment.toString().replace(/,/g, '')) || curRep;
      const nw = calcTerm(amt, nr, nrep, l.newFreq);
      return { curTerm: fmtYrsMonths(cur.months), newTerm: fmtYrsMonths(nw.months), saved: Math.max(0, cur.months - nw.months), interestSaved: Math.max(0, cur.interest - nw.interest) };
    }));
  };

  const reset = () => { setLoans([initLoan(), initLoan(), initLoan(), initLoan()]); setResults([]); };

  const inputStyle2 = { width: '100%', background: C.inputBg, border: 'none', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '14px', color: C.textPrimary, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Mortgage Comparison</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>Compare current vs new rates and repayments across multiple loans</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {loans.map((l, i) => (
          <div key={i} style={{ ...card, marginBottom: 0, padding: '1.25rem' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Loan {i + 1}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <MCTextField label="Loan name (optional)" value={l.name} onChange={v => update(i, 'name', v)} placeholder={`Loan ${i + 1}`} />
              <MCCurrencyField label="Loan amount ($)" value={l.amount} onChange={v => update(i, 'amount', v)} placeholder="500,000" />
              <MCNumField label="Current interest rate" value={l.rate} onChange={v => update(i, 'rate', v)} placeholder="5.99" suffix="%" />
              <MCCurrencyField label="Current repayment ($)" value={l.curRepayment} onChange={v => update(i, 'curRepayment', v)} placeholder="0" />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>Frequency</label>
                <select value={l.curFreq} onChange={e => update(i, 'curFreq', e.target.value)} style={{ ...selectStyle, padding: '0.625rem 0.875rem', fontSize: '14px' }}>
                  {['Monthly', 'Fortnightly', 'Weekly'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '0.875rem' }}>
                <MCNumField label="New interest rate" value={l.newRate} onChange={v => update(i, 'newRate', v)} placeholder="Optional" suffix="%" />
              </div>
              <MCCurrencyField label="New repayment ($)" value={l.newRepayment} onChange={v => update(i, 'newRepayment', v)} placeholder="Optional" />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>New frequency</label>
                <select value={l.newFreq} onChange={e => update(i, 'newFreq', e.target.value)} style={{ ...selectStyle, padding: '0.625rem 0.875rem', fontSize: '14px' }}>
                  {['Monthly', 'Fortnightly', 'Weekly'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              {results[i] && (
                <div style={{ background: C.accentLight, borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '13px' }}>
                    <div><p style={{ color: C.textSecondary, margin: '0 0 0.25rem' }}>Current term</p><p style={{ fontWeight: '500', margin: 0 }}>{results[i].curTerm}</p></div>
                    <div><p style={{ color: C.textSecondary, margin: '0 0 0.25rem' }}>New term</p><p style={{ fontWeight: '500', margin: 0 }}>{results[i].newTerm}</p></div>
                    {results[i].saved > 0 && <div style={{ gridColumn: '1/-1' }}><p style={{ color: C.textSecondary, margin: '0 0 0.25rem' }}>Time saved</p><p style={{ fontWeight: '500', margin: 0, color: C.green }}>{fmtYrsMonths(results[i].saved)}</p></div>}
                    {results[i].interestSaved > 0 && <div style={{ gridColumn: '1/-1' }}><p style={{ color: C.textSecondary, margin: '0 0 0.25rem' }}>Interest saved</p><p style={{ fontWeight: '500', margin: 0, color: C.green }}>${fmtNZD(results[i].interestSaved)}</p></div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={calc} style={{ ...primaryBtn, flex: 1 }}>Calculate Comparison</button>
        <button onClick={reset} style={{ ...secondaryBtn, flex: 1, background: '#FFF0F0', color: C.red }}>Reset All</button>
      </div>
      <Disclaimer />
    </div>
  );
}

// ─── 5. BREAK EVEN ───────────────────────────────────────────────────────────
function BreakEven() {
  const [balance, setBalance] = useState(500000);
  const [curRate, setCurRate] = useState(6.5);
  const [breakFee, setBreakFee] = useState(12000);
  const [newRate, setNewRate] = useState(5.0);
  const [newTermMonths, setNewTermMonths] = useState(36);
  const [followRate, setFollowRate] = useState(6.0);
  const [fixedExpiry, setFixedExpiry] = useState('');
  const [maturityDate, setMaturityDate] = useState('');
  const [result, setResult] = useState(null);

  const parseDate = (s) => { const parts = s.split('/'); if (parts.length !== 3) return null; const d = new Date(parts[2], parts[1] - 1, parts[0]); return isNaN(d) ? null : d; };

  const monthsBetween = (a, b) => {
    if (b <= a) return 0;
    const y = b.getFullYear() - a.getFullYear();
    const m = b.getMonth() - a.getMonth();
    const d = b.getDate() - a.getDate();
    return Math.max(0, Math.ceil(y * 12 + m + (d < 0 ? -1 : 0)));
  };

  const pmt = (r, n, pv) => { if (!r) return pv / n; const f = Math.pow(1 + r, n); return pv * (r * f) / (f - 1); };

  const calc = () => {
    const today = new Date();
    const expiry = parseDate(fixedExpiry);
    const maturity = parseDate(maturityDate);
    if (!expiry || !maturity) return;

    const monthsToMat = monthsBetween(today, maturity);
    const monthsToExp = monthsBetween(today, expiry);
    const window = newTermMonths;

    const rCur = curRate / 100 / 12, rNew = newRate / 100 / 12, rFollow = followRate / 100 / 12;
    const pMin = pmt(rCur, monthsToMat, balance);
    const pMinNew = pmt(rNew, monthsToMat, balance);

    // Stay scenario
    let stayBal = balance, stayInt = 0;
    for (let m = 1; m <= window; m++) {
      if (stayBal <= 0) break;
      const r = m <= monthsToExp ? rCur : rFollow;
      const p = m <= monthsToExp ? pMin : pmt(r, monthsToMat - m, stayBal);
      const interest = stayBal * r;
      const prin = Math.min(p - interest, stayBal);
      stayBal = Math.max(0, stayBal - prin);
      stayInt += interest;
    }

    // Break scenario
    let breakBal = balance, breakInt = 0;
    for (let m = 1; m <= window; m++) {
      if (breakBal <= 0) break;
      const interest = breakBal * rNew;
      const prin = Math.min(pMinNew - interest, breakBal);
      breakBal = Math.max(0, breakBal - prin);
      breakInt += interest;
    }

    const delta = (stayInt + stayBal) - (breakInt + breakBal + breakFee);
    setResult({ delta, stayInt, stayBal, breakInt, breakBal, window, expiry: expiry < today });
  };

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Break Even Calculator</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>Should you break your fixed rate? Find out here.</p>
      </div>

      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <MoneyField label="Loan balance" value={balance} onChange={setBalance} />
          <RateField label="Current fixed rate (%)" value={curRate} onChange={setCurRate} />
          <MoneyField label="Break fee" value={breakFee} onChange={setBreakFee} />
          <RateField label="Proposed new rate (%)" value={newRate} onChange={setNewRate} />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>New fixed term (months)</label>
            <div style={inputWrap}><input type="number" inputMode="numeric" value={newTermMonths} onChange={e => setNewTermMonths(parseInt(e.target.value) || 0)} style={inputStyle} /></div>
          </div>
          <RateField label="Assumed follow-on rate (%)" value={followRate} onChange={setFollowRate} hint="Rate used for 'stay' scenario after fixed expiry" />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Fixed term expiry date</label>
            <div style={inputWrap}><input type="text" value={fixedExpiry} onChange={e => setFixedExpiry(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Loan maturity date</label>
            <div style={inputWrap}><input type="text" value={maturityDate} onChange={e => setMaturityDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} /></div>
          </div>
        </div>
        <button onClick={calc} style={{ ...primaryBtn, width: '100%', marginTop: '0.5rem' }}>Calculate Break-Even</button>
      </div>

      {result && (
        <div style={{ ...card, background: result.delta > 0 ? C.greenBg : C.redBg, border: `2px solid ${result.delta > 0 ? C.greenBorder : C.redBorder}` }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>{result.delta > 0 ? '✅' : '❌'}</div>
            <h3 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>
              {result.delta > 0
                ? `Breaking and refixing could save approximately $${fmtNZD(Math.abs(result.delta))} over the next ${result.window} months.`
                : `Breaking now may cost approximately $${fmtNZD(Math.abs(result.delta))} more over the next ${result.window} months.`}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '1.25rem' }}>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 0.5rem', fontWeight: '500' }}>Stay scenario</p>
                <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0 }}>Interest: ${fmtNZD(result.stayInt)}</p>
                <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0 }}>Balance: ${fmtNZD(result.stayBal)}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '12px', padding: '1.25rem' }}>
                <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 0.5rem', fontWeight: '500' }}>Break scenario</p>
                <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0 }}>Interest: ${fmtNZD(result.breakInt)}</p>
                <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0 }}>Balance: ${fmtNZD(result.breakBal)}</p>
                <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0 }}>Break fee: ${fmtNZD(breakFee)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <Disclaimer />
    </div>
  );
}

// ─── 6. COST TO WAIT ─────────────────────────────────────────────────────────
function CostToWait() {
  const [loans, setLoans] = useState([{ id: '1', name: '', balance: 0, curRate: 0, newRate: 0 }]);
  const [compareDate, setCompareDate] = useState('');

  const addLoan = () => setLoans([...loans, { id: Date.now().toString(), name: '', balance: 0, curRate: 0, newRate: 0 }]);
  const removeLoan = (id) => loans.length > 1 && setLoans(loans.filter(l => l.id !== id));
  const updateLoan = (id, field, value) => setLoans(loans.map(l => l.id === id ? { ...l, [field]: value } : l));

  const parseCompareDate = () => {
    if (!compareDate) return null;
    const parts = compareDate.split('/');
    if (parts.length !== 3) return null;
    return new Date(parts[2], parts[1] - 1, parts[0]);
  };

  const getDays = () => {
    const d = parseCompareDate();
    if (!d) return 0;
    return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
  };

  const metrics = (l) => {
    const daily = (bal, r) => (bal * r) / 100 / 365;
    const dCur = daily(l.balance, l.curRate), dNew = daily(l.balance, l.newRate);
    return {
      daily: { cur: dCur, new: dNew, diff: dNew - dCur },
      monthly: { cur: dCur * 30.4167, new: dNew * 30.4167, diff: (dNew - dCur) * 30.4167 },
      annual: { cur: l.balance * l.curRate / 100, new: l.balance * l.newRate / 100, diff: l.balance * (l.newRate - l.curRate) / 100 },
    };
  };

  const days = getDays();
  const fmt = (v) => `$${Math.abs(v).toLocaleString('en-NZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Cost to Wait Calculator</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>See the daily, monthly and annual cost of waiting to fix your rate</p>
      </div>

      <div style={card}>
        <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Comparison date (optional)</h3>
        <div style={{ ...inputWrap, maxWidth: '280px' }}>
          <i className="ti ti-calendar" style={{ fontSize: '18px', color: C.textSecondary }} />
          <input type="text" value={compareDate} onChange={e => setCompareDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} />
        </div>
        {days > 0 && <p style={{ fontSize: '14px', color: C.textSecondary, marginTop: '0.75rem' }}>{days} days until comparison date</p>}
      </div>

      {loans.map((loan, idx) => {
        const m = loan.balance > 0 && loan.curRate > 0 && loan.newRate > 0 ? metrics(loan) : null;
        return (
          <div key={loan.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Loan {idx + 1}</h3>
              {loans.length > 1 && <button onClick={() => removeLoan(loan.id)} style={{ background: '#FFF0F0', border: 'none', color: C.red, padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Remove</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: m ? '1.5rem' : 0 }}>
              <div>
                <label style={labelStyle}>Loan name (optional)</label>
                <div style={inputWrap}><input type="text" value={loan.name} onChange={e => updateLoan(loan.id, 'name', e.target.value)} placeholder="e.g. Fixed 1 year" style={inputStyle} /></div>
              </div>
              <MoneyField label="Loan balance" value={loan.balance} onChange={v => updateLoan(loan.id, 'balance', v)} />
              <RateField label="Current rate (%)" value={loan.curRate} onChange={v => updateLoan(loan.id, 'curRate', v)} />
              <RateField label="Proposed rate (%)" value={loan.newRate} onChange={v => updateLoan(loan.id, 'newRate', v)} />
            </div>
            {m && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: C.inputBg }}>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>Period</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>Current Rate</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>Proposed Rate</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>Difference</th>
                      {days > 0 && <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: C.textSecondary, borderBottom: `1px solid ${C.borderLight}` }}>Cost to Date</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Daily', data: m.daily, costToDate: days > 0 ? m.daily.diff * days : null },
                      { label: 'Monthly', data: m.monthly, costToDate: null },
                      { label: 'Annual', data: m.annual, costToDate: null },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                        <td style={{ padding: '0.75rem 1rem' }}>{row.label}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{fmt(row.data.cur)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{fmt(row.data.new)}</td>
                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: row.data.diff > 0 ? C.red : C.green, fontWeight: '500' }}>{row.data.diff > 0 ? '+' : '-'}{fmt(row.data.diff)}</td>
                        {days > 0 && <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '500', color: row.costToDate ? (row.costToDate > 0 ? C.red : C.green) : C.textSecondary }}>{row.costToDate != null ? (row.costToDate > 0 ? '+' : '-') + fmt(row.costToDate) : '—'}</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      <button onClick={addLoan} style={{ ...secondaryBtn, width: '100%', marginBottom: '1.5rem' }}>+ Add Another Loan</button>
      <Disclaimer />
    </div>
  );
}

// ─── 7. BNPL ─────────────────────────────────────────────────────────────────
function BNPLCalc() {
  const [provider, setProvider] = useState('');
  const [limit, setLimit] = useState(0);

  const providerRates = { Afterpay: 1 / 3, Laybuy: 2 / 3, Zip: 1 / 3, Klarna: 1 / 3 };
  const monthly = provider && limit ? Math.round(limit * providerRates[provider] * 100) / 100 : 0;

  return (
    <div>
      <div style={{ ...card, background: C.headerBg }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>BNPL Repayment Estimator</h1>
        <p style={{ fontSize: '15px', color: '#4a4a68', opacity: 0.9, margin: 0 }}>Estimate how much your Buy Now Pay Later limit costs per month</p>
      </div>

      <div style={{ ...card, maxWidth: '540px', margin: '0 auto 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <label style={labelStyle}>BNPL Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)} style={selectStyle}>
            <option value="">Select your provider</option>
            <option value="Afterpay">Afterpay</option>
            <option value="Laybuy">Laybuy</option>
            <option value="Zip">Zip</option>
            <option value="Klarna">Klarna</option>
          </select>
        </div>
        <MoneyField label="Credit limit (NZD)" value={limit} onChange={setLimit} placeholder="2,000" />

        {monthly > 0 && (
          <div style={{ background: C.headerBg, borderRadius: '16px', padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '14px', color: '#4a4a68', margin: '0 0 0.5rem', fontWeight: '500' }}>Estimated monthly repayment</p>
            <p style={{ fontSize: '40px', fontWeight: '500', margin: 0, color: C.textPrimary }}>${fmtNZD(monthly, 2)}</p>
            <p style={{ fontSize: '13px', color: '#4a4a68', margin: '0.75rem 0 0' }}>per month</p>
          </div>
        )}

        <div style={{ background: '#EEF1F5', borderRadius: '12px', padding: '1rem', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '13px', color: C.textSecondary, margin: 0, lineHeight: 1.6 }}>
            <i className="ti ti-info-circle" style={{ marginRight: '6px' }} />
            This is an estimate based on typical repayment cycles. Multiple active purchases or late fees may increase monthly costs.
          </p>
        </div>
      </div>
      <Disclaimer />
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('borrow');
  const { user, loading, signOut, refreshUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSavedScenarios, setShowSavedScenarios] = useState(false);
  const [showSaveName, setShowSaveName] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [pendingSave, setPendingSave] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleSavePrompt = (inputs, results) => {
    if (!user) {
      setPendingSave({ inputs, results });
      setShowAuthModal(true);
    } else {
      setPendingSave({ inputs, results });
      setShowSaveName(true);
    }
  };

  const handleAuthSuccess = async () => {
    await refreshUser();
    setShowAuthModal(false);
    if (pendingSave) setShowSaveName(true);
  };

  const handleSaveConfirm = async () => {
    if (!pendingSave) return;
    const name = scenarioName.trim() || 'My Scenario';
    await supabase.saveScenario(name, pendingSave.inputs, pendingSave.results);
    setShowSaveName(false);
    setPendingSave(null);
    setScenarioName('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'borrow': return (
        <BorrowChecker
          onSavePrompt={!user ? () => { setShowAuthModal(true); } : null}
          onSave={user ? (inputs, results) => handleSavePrompt(inputs, results) : null}
        />
      );
      case 'repayment': return <LoanRepayment />;
      case 'quickrepay': return <QuickRepay />;
      case 'comparison': return <MortgageComparison />;
      case 'breakeven': return <BreakEven />;
      case 'costtowait': return <CostToWait />;
      case 'bnpl': return <BNPLCalc />;
      case 'first-home-playbook': return <FirstHomePlaybookRouter onExit={() => handleSetActiveTab('borrow')} />;
      default: return <BorrowChecker />;
    }
  };

  // Minimal URL sync so /first-home-playbook/* deep links work and the nav
  // tab switch keeps the address bar in step. Existing tabs are unaffected.
  const handleSetActiveTab = (id) => {
    setActiveTab(id);
    window.history.pushState({}, '', id === 'first-home-playbook' ? '/first-home-playbook' : '/');
  };

  useEffect(() => {
    const syncFromPath = () => {
      setActiveTab(window.location.pathname.startsWith('/first-home-playbook') ? 'first-home-playbook' : 'borrow');
    };
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: C.textSecondary }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, width: '100%', boxSizing: 'border-box' }}>
      <TopNav
        active={activeTab}
        setActive={handleSetActiveTab}
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={signOut}
        onSavedScenarios={() => setShowSavedScenarios(true)}
      />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem', boxSizing: 'border-box' }}>
        {renderTab()}
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textMuted, marginTop: '2rem' }}>
          parryfs.com - NZ mortgage calculators · <button onClick={() => setShowPrivacyPolicy(true)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', padding: 0 }}>Privacy Policy</button>
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => { setShowAuthModal(false); setPendingSave(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Saved Scenarios */}
      {showSavedScenarios && (
        <SavedScenarios
          onClose={() => setShowSavedScenarios(false)}
          onLoad={(scenario) => {
            setActiveTab('borrow');
          }}
        />
      )}

      {/* Save Name Modal */}
      {showSaveName && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setShowSaveName(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Name your scenario</h3>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>Give this scenario a name so you can find it easily later.</p>
            <div style={{ ...inputWrap, marginBottom: '1.5rem' }}>
              <input
                type="text"
                value={scenarioName}
                onChange={e => setScenarioName(e.target.value)}
                placeholder="e.g. Mount Eden 3-bed"
                style={{ ...inputStyle }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveConfirm()}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowSaveName(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
              <button onClick={handleSaveConfirm} style={{ ...primaryBtn, flex: 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setShowPrivacyPolicy(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '520px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Privacy Policy</h3>
              <button onClick={() => setShowPrivacyPolicy(false)} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="ti ti-x" style={{ fontSize: '18px', color: C.textPrimary }} />
              </button>
            </div>
            <PRIVACY_POLICY_CONTENT />
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {saveSuccess && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: C.accent, color: 'white', padding: '0.875rem 1.5rem', borderRadius: '12px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 3000, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="ti ti-check" />
          Scenario saved!
        </div>
      )}
    </div>
  );
}

// ─── FIRST HOME PLAYBOOK EXPORTS ───────────────────────────────────────────
// Additive only, added for the /first-home-playbook section (src/first-home-playbook/).
// Nothing above this block is changed. BorrowChecker and the Kāinga Ora
// income-cap check are exported as-is so that section reuses this file's
// logic instead of duplicating it.
export { BorrowChecker, useAuth, AuthModal, supabase, C, card, Disclaimer, primaryBtn, secondaryBtn, inputWrap, inputStyle, fmtNZD, MoneyField };

// Mirrors the income-cap thresholds computed inline in BorrowChecker's
// calculate() (search "Kainga Ora eligibility" above). Kept as a separate
// pure export, rather than editing calculate() itself, per instruction not
// to alter existing Borrow Checker calculation logic. If Kāinga Ora revises
// these thresholds, both this function and calculate() need updating.
export function checkKaingaOraIncomeCap({ applicationType, baseSalary, partnerBaseSalary = 0 }) {
  const totalBase = baseSalary + (applicationType === 'joint' ? partnerBaseSalary : 0);
  return applicationType === 'single' ? baseSalary <= 95000 : totalBase <= 150000;
}
