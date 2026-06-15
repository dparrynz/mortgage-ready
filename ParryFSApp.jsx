import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

// ─── TOP NAV ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'borrow', label: 'Borrow Checker', icon: 'ti-home-check' },
  { id: 'repayment', label: 'Loan Repayment', icon: 'ti-calculator' },
  { id: 'quickrepay', label: 'Quick Repay', icon: 'ti-trending-up' },
  { id: 'comparison', label: 'Mortgage Comparison', icon: 'ti-arrows-exchange' },
  { id: 'breakeven', label: 'Break Even', icon: 'ti-scale' },
  { id: 'costtowait', label: 'Cost to Wait', icon: 'ti-clock' },
  { id: 'bnpl', label: 'BNPL', icon: 'ti-credit-card' },
];

const TopNav = ({ active, setActive }) => {
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
    }}>
      {/* Desktop nav */}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
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
    </div>
  );
};

// ─── 1. BORROW CHECKER ───────────────────────────────────────────────────────
function BorrowChecker() {
  const [page, setPage] = useState(1);
  const totalPages = 5;

  const [purchasePrice, setPurchasePrice] = useState(650000);
  const [deposit, setDeposit] = useState(130000);
  const [applicationType, setApplicationType] = useState('single');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [dependents, setDependents] = useState(0);
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
  const [results, setResults] = useState(null);
  const [showRepayCalc, setShowRepayCalc] = useState(false);
  const [showDepositOptions, setShowDepositOptions] = useState(false);
  const [showUmiBreakdown, setShowUmiBreakdown] = useState(false);
  const [calcLoanAmount, setCalcLoanAmount] = useState(0);
  const [calcRate, setCalcRate] = useState(6.5);
  const [calcTerm, setCalcTerm] = useState(30);

  useEffect(() => {
    if (page === 5) calculate();
  }, [page, purchasePrice, deposit, applicationType, isFirstHomeBuyer, dependents,
    baseSalary, variableIncome, kiwiSaverRate, hasStudentLoan,
    partnerBaseSalary, partnerVariableIncome, partnerKiwiSaverRate, partnerHasStudentLoan,
    numBoarders, boarderWeeklyIncome, creditCardLimit, bnplLimit, otherMonthlyLoans, declaredExpenses]);

  useEffect(() => { if (results) setCalcLoanAmount(results.loanAmount); }, [results]);

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
    return gross - tax - acc - gross * (ksRate / 100);
  }

  function calculate() {
    const loan = purchasePrice - deposit;
    const lvr = (loan / purchasePrice) * 100;
    const totalBase = baseSalary + (applicationType === 'joint' ? partnerBaseSalary : 0);
    const minDepPct = isFirstHomeBuyer && totalBase < 150000 ? 5 : 20;
    const minDep = purchasePrice * (minDepPct / 100);
    const depPass = deposit >= minDep;

    const shadedVar = variableIncome * 0.8;
    const shadedPVar = (applicationType === 'joint' ? partnerVariableIncome : 0) * 0.8;
    const cappedBoarder = Math.min(boarderWeeklyIncome, 240);
    const shadedBoarder = cappedBoarder * 52 * numBoarders * 0.8;
    const usableGross = baseSalary + shadedVar + (applicationType === 'joint' ? partnerBaseSalary : 0) + shadedPVar + shadedBoarder;

    const primaryNet = calcNetIncome(baseSalary + shadedVar, kiwiSaverRate);
    const partnerNet = applicationType === 'joint' ? calcNetIncome(partnerBaseSalary + shadedPVar, partnerKiwiSaverRate) : 0;
    const boarderNet = shadedBoarder > 0 ? shadedBoarder * 0.7 : 0;
    const netMonthly = (primaryNet + partnerNet + boarderNet) / 12;

    const gleeFloor = 829 + (applicationType === 'single' ? 430 : 860) + dependents * 161 + Math.round((usableGross / 12) * 0.07);
    const livingExp = Math.max(declaredExpenses, gleeFloor);
    const usingGlee = livingExp === gleeFloor;

    const ccExp = creditCardLimit * 0.03;
    const bnplExp = bnplLimit * 0.05;
    const slThreshold = 24128;
    const primaryGross = baseSalary + shadedVar;
    const partnerGross = applicationType === 'joint' ? partnerBaseSalary + shadedPVar : 0;
    const slMonthly = (hasStudentLoan && primaryGross > slThreshold ? (primaryGross - slThreshold) * 0.12 / 12 : 0)
                    + (partnerHasStudentLoan && partnerGross > slThreshold ? (partnerGross - slThreshold) * 0.12 / 12 : 0);

    const totalDebt = loan + creditCardLimit + bnplLimit;
    const dti = usableGross > 0 ? totalDebt / usableGross : 0;
    const dtiPass = dti <= 6.0;

    const monthlyRate = 0.07 / 12;
    const n = 360;
    const stressedPmt = loan > 0 ? (loan * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : 0;
    const umi = netMonthly - stressedPmt - livingExp - ccExp - bnplExp - slMonthly - otherMonthlyLoans;

    const isKO = isFirstHomeBuyer && totalBase < 150000;
    let reqUmi = 200, umiStatus = 'standard';
    if (lvr > 80) { reqUmi = isKO ? 200 : 500; umiStatus = isKO ? 'kainga_ora' : 'challenging'; }
    const umiPass = umi >= reqUmi;

    const feedback = [];
    if (!depPass) {
      const shortfall = minDep - deposit;
      feedback.push(isKO
        ? { type: 'info', title: 'You qualify for Kainga Ora First Home Loan', message: `Great news! You're eligible for a Kainga Ora First Home Loan with just a 5% deposit. You'll need to save an additional $${fmtNZD(shortfall)} to meet this requirement.` }
        : { type: 'danger', title: 'Deposit shortfall', message: `You'll need to save an additional $${fmtNZD(shortfall)} to meet the ${minDepPct}% deposit requirement for this property.` }
      );
    }
    if (!dtiPass) {
      const existingDebt = creditCardLimit + bnplLimit;
      feedback.push(existingDebt > 0
        ? { type: 'warning', title: 'Debt levels', message: 'Your total debt (including this mortgage) is higher than banks typically allow. Consider paying down existing debts or increasing your deposit to lower the loan amount.' }
        : { type: 'warning', title: 'Loan amount too high', message: 'The mortgage loan is too large relative to your income. Consider increasing your deposit or looking at a lower-priced property.' }
      );
    }
    if (!umiPass) {
      const shortfall = reqUmi - umi;
      const advice = [];
      if (bnplLimit > 0) advice.push(`closing your Buy Now Pay Later accounts (frees up $${fmtNZD(bnplLimit * 0.05)}/month)`);
      if (creditCardLimit > 5000) advice.push('reducing credit card limits');
      if (umiStatus === 'challenging' && !depPass) {
        feedback.push({ type: 'warning', title: 'Deposit and servicing need attention', message: 'You may need to explore deposit-boosting options to reach the 20% threshold and improve your monthly budget position.', expandable: true });
      } else if (advice.length > 0) {
        feedback.push({ type: 'warning', title: 'Monthly budget tight', message: `Banks want to see at least $${fmtNZD(Math.abs(shortfall))} more breathing room in your monthly budget. You could achieve this by ${advice.join(' or ')}.` });
      } else {
        feedback.push({ type: 'warning', title: 'Monthly budget tight', message: 'Banks want to see more breathing room in your monthly budget. Consider a smaller loan, increasing your income, or reducing your purchase price.' });
      }
    } else if (umiPass && umiStatus === 'challenging') {
      feedback.push({ type: 'warning', title: 'Limited lending options', message: 'Your servicing is strong, but with less than 20% deposit and not qualifying for Kainga Ora, your options may be limited. Consider exploring ways to increase your deposit.', expandable: true });
    }
    if (usingGlee) feedback.push({ type: 'info', title: 'Living expenses adjusted', message: `Banks use standard minimum living costs of $${fmtNZD(gleeFloor)} per month for your situation, which is higher than what you declared.` });
    if (depPass && dtiPass && umiPass) {
      if (umiStatus === 'kainga_ora') feedback.push({ type: 'success', title: 'Kainga Ora ready!', message: "Excellent! You meet all the criteria for a Kainga Ora First Home Loan. You're ready to start house hunting with confidence." });
      else if (lvr <= 80) feedback.push({ type: 'success', title: "You're mortgage ready!", message: "Great news! With a strong deposit (20%+) and solid servicing, you'll have excellent lending options across all major banks." });
      else feedback.push({ type: 'success', title: "You're mortgage ready!", message: "Great news! Based on your financials, you meet the bank lending criteria. You're ready to start house hunting with confidence." });
    }

    setResults({ loan, lvr, depPass, minDep, minDepPct, netMonthly, dti, dtiPass, stressedPmt, livingExp, ccExp, bnplExp, slMonthly, umi, reqUmi, umiPass, umiStatus, isKO, feedback, usingGlee });
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
      <button onClick={() => setPage(Math.max(1, page - 1))} style={{ ...secondaryBtn, opacity: page === 1 ? 0 : 1, pointerEvents: page === 1 ? 'none' : 'auto' }}>
        <i className="ti ti-arrow-left" style={{ marginRight: '6px' }} /> Back
      </button>
      {page < totalPages
        ? <button onClick={() => setPage(page + 1)} style={primaryBtn}>Continue <i className="ti ti-arrow-right" style={{ marginLeft: '6px' }} /></button>
        : <button onClick={() => { setPage(1); setResults(null); }} style={secondaryBtn}>Start Over</button>
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
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>What property are you looking at?</h2>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 2rem' }}>Tell us about the property you want to buy</p>
            <MoneyField label="Purchase price" value={purchasePrice} onChange={setPurchasePrice} placeholder="650,000" />
            <MoneyField label="How much deposit have you saved?" value={deposit} onChange={setDeposit} placeholder="130,000" />
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
            <div style={{ background: C.inputBg, padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={isFirstHomeBuyer} onChange={e => setIsFirstHomeBuyer(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <div>
                  <span style={{ fontWeight: '500', color: C.textPrimary, display: 'block', marginBottom: '0.25rem' }}>I'm buying my first home</span>
                  <span style={{ fontSize: '13px', color: C.textSecondary }}>First home buyers may qualify for lower deposit requirements</span>
                </div>
              </label>
            </div>
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
              <MoneyField label="Weekly rent per boarder (before tax)" value={boarderWeeklyIncome} onChange={setBoarderWeeklyIncome} placeholder="200" hint="Banks cap this at $240 per week per boarder" />
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
            <MoneyField label="Other loan repayments per month (car loans, personal loans, etc.)" value={otherMonthlyLoans} onChange={setOtherMonthlyLoans} placeholder="0" />
            <MoneyField label="Monthly living expenses (groceries, power, phone, insurance, etc.)" value={declaredExpenses} onChange={setDeclaredExpenses} placeholder="2,000" hint="Banks have minimum requirements based on household size" />
          </div>
        )}

        {/* PAGE 5 - RESULTS */}
        {page === 5 && results && (
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
                              <button style={{ ...primaryBtn, width: '100%', marginTop: '0.5rem' }}>Book a consultation</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Loan amount" value={`$${fmtNZD(results.loan)}`} />
              <StatCard label="Your deposit" value={`${((deposit / purchasePrice) * 100).toFixed(1)}%`} />
              <StatCard
                label="Estimated repayment"
                value={`$${fmtNZD(results.stressedPmt)}/mo`}
                hint="Click to calculate different scenarios"
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
                        { label: 'Mortgage repayment (stressed at 7%)', value: `-$${fmtNZD(results.stressedPmt)}`, color: C.red },
                        { label: 'Living expenses', value: `-$${fmtNZD(results.livingExp)}`, color: C.red },
                        ...(results.ccExp > 0 ? [{ label: 'Credit cards (3% of limits)', value: `-$${fmtNZD(results.ccExp)}`, color: C.red }] : []),
                        ...(results.bnplExp > 0 ? [{ label: 'BNPL (5% of limits)', value: `-$${fmtNZD(results.bnplExp)}`, color: C.red }] : []),
                        ...((hasStudentLoan || partnerHasStudentLoan) && results.slMonthly > 0 ? [{ label: 'Student loan repayment', value: `-$${fmtNZD(results.slMonthly)}`, color: C.red }] : []),
                        ...(otherMonthlyLoans > 0 ? [{ label: 'Other loan repayments', value: `-$${fmtNZD(otherMonthlyLoans)}`, color: C.red }] : []),
                      ].map((row, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ color: C.textSecondary }}>{row.label}</span>
                          <span style={{ fontWeight: '500', color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: `2px solid ${C.borderLight}`, paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: '500', color: C.textPrimary }}>Uncommitted monthly income</span>
                        <span style={{ fontWeight: '600', fontSize: '16px', color: results.umiPass ? C.green : C.red }}>${fmtNZD(Math.max(0, results.umi))}</span>
                      </div>
                      <div style={{ marginTop: '1rem', padding: '0.75rem', background: results.umiPass ? '#E8F5E9' : '#FFEBEE', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', color: C.textSecondary }}>
                            {results.umiStatus === 'kainga_ora' ? 'Kainga Ora requires' : results.lvr <= 80 ? 'Banks require (20%+ deposit)' : 'Banks require (<20% deposit)'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: C.textPrimary }}>${fmtNZD(results.reqUmi)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Disclaimer />
          </div>
        )}
        <Nav />
      </div>

      {/* Repayment Modal */}
      {showRepayCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setShowRepayCalc(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '500', margin: 0, color: C.textPrimary }}>Repayment calculator</h3>
              <button onClick={() => setShowRepayCalc(false)} style={{ background: C.inputBg, border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
                <i className="ti ti-x" style={{ fontSize: '20px', color: C.textPrimary }} />
              </button>
            </div>
            <MoneyField label="Loan amount" value={calcLoanAmount} onChange={setCalcLoanAmount} />
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
            <div style={{ width: '90px', flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Rate</label>
              <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                <input type="number" step="0.01" value={loan.rate || ''} onChange={e => updateLoan(loan.id, 'rate', parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '36px' }} placeholder="6.5" />
                <span style={{ fontSize: '14px', fontWeight: '500', flexShrink: 0 }}>%</span>
              </div>
            </div>
            {/* Term */}
            <div style={{ flexShrink: 0 }}>
              <label style={{ ...labelStyle, marginBottom: '0.5rem' }}>Term</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '70px' }}>
                  <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                    <input type="number" min="0" max="40" value={loan.years || ''} onChange={e => updateLoan(loan.id, 'years', parseInt(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '32px' }} placeholder="30" />
                  </div>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>Years</span>
                </div>
                <div style={{ width: '70px' }}>
                  <div style={{ ...inputWrap, padding: '0.75rem 0.75rem' }}>
                    <input type="number" min="0" max="11" value={loan.months || ''} onChange={e => updateLoan(loan.id, 'months', parseInt(e.target.value) || 0)} style={{ ...inputStyle, fontSize: '15px', minWidth: 0, width: '32px' }} placeholder="0" />
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

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
        <div style={card}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1.5rem', color: C.textPrimary }}>Inputs</h3>
          <MoneyField label="Loan amount" value={loanAmount} onChange={setLoanAmount} placeholder="300,000" />
          <RateField label="Interest rate" value={rate} onChange={setRate} placeholder="5.75" />
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Term (years)</label>
            <div style={inputWrap}><input type="number" min="1" value={years} onChange={e => setYears(parseInt(e.target.value) || 1)} style={inputStyle} /></div>
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
              <div style={inputWrap}><input type="number" min="0" step="0.1" value={extraAfter} onChange={e => setExtraAfter(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: C.accentLight, borderRadius: '12px' }}>
            <label style={{ ...labelStyle, marginBottom: '1rem' }}>Lump sum repayment</label>
            <MoneyField label="Amount" value={lumpSum} onChange={setLumpSum} placeholder="0" />
            <div>
              <label style={labelStyle}>After (years)</label>
              <div style={inputWrap}><input type="number" min="0" step="0.1" value={lumpAfter} onChange={e => setLumpAfter(parseFloat(e.target.value) || 0)} style={inputStyle} /></div>
            </div>
          </div>
          <button onClick={reset} style={{ ...secondaryBtn, width: '100%', background: '#FFF0F0', color: C.red }}>Reset</button>
        </div>

        <div>
          {results && (
            <>
              <div style={{ ...card, background: C.accentLight }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: '0 0 1.5rem', color: C.textPrimary }}>Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <StatCard label="Regular payment" value={`$${fmtNZD(results.basePmt, 2)}`} sub={freq} />
                  <StatCard label="Total payments" value={results.with.rows.length.toString()} />
                  {results.interestSaved > 0 && <StatCard label="Interest saved" value={`$${fmtNZD(results.interestSaved)}`} highlight="green" />}
                  {results.termSaved > 0 && <StatCard label="Time saved" value={fmtYrsMonths(results.termSaved / ppy * 12)} highlight="green" />}
                </div>
              </div>

              <div style={card}>
                <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1rem', color: C.textPrimary }}>Loan balance over time</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart>
                    <XAxis dataKey="year" type="number" domain={[0, 'dataMax']} label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                    <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => [`$${fmtNZD(v)}`, '']} />
                    <Legend />
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
function MortgageComparison() {
  const initLoan = () => ({ name: '', amount: 0, rate: 0, curRepayment: 0, curFreq: 'Monthly', newRate: 0, newRepayment: 0, newFreq: 'Monthly' });
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
      if (!l.amount || !l.rate || !l.curRepayment) return null;
      const cur = calcTerm(l.amount, l.rate, l.curRepayment, l.curFreq);
      const nr = l.newRate || l.rate;
      const nrep = l.newRepayment || l.curRepayment;
      const nw = calcTerm(l.amount, nr, nrep, l.newFreq);
      return { curTerm: fmtYrsMonths(cur.months), newTerm: fmtYrsMonths(nw.months), saved: Math.max(0, cur.months - nw.months), interestSaved: Math.max(0, cur.interest - nw.interest) };
    }));
  };

  const reset = () => { setLoans([initLoan(), initLoan(), initLoan(), initLoan()]); setResults([]); };

  const InputSmall = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>{label}</label>
      <input type={type} step="0.01" value={type === 'text' ? fmtInput(value) : (value || '')} onChange={e => onChange(type === 'text' ? parseMoney(e.target.value) : (parseFloat(e.target.value) || 0))} placeholder={placeholder}
        style={{ width: '100%', background: C.inputBg, border: 'none', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '14px', color: C.textPrimary, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );

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
              <InputSmall label="Loan name (optional)" value={l.name} onChange={v => update(i, 'name', v)} type="text-plain" placeholder={`Loan ${i + 1}`} />
              <InputSmall label="Loan amount ($)" value={l.amount} onChange={v => update(i, 'amount', v)} type="text" />
              <InputSmall label="Current interest rate (%)" value={l.rate} onChange={v => update(i, 'rate', v)} type="number" placeholder="5.99" />
              <InputSmall label="Current repayment ($)" value={l.curRepayment} onChange={v => update(i, 'curRepayment', v)} type="text" />
              <div>
                <label style={{ fontSize: '12px', fontWeight: '500', color: C.textSecondary, display: 'block', marginBottom: '0.375rem' }}>Frequency</label>
                <select value={l.curFreq} onChange={e => update(i, 'curFreq', e.target.value)} style={{ ...selectStyle, padding: '0.625rem 0.875rem', fontSize: '14px' }}>
                  {['Monthly', 'Fortnightly', 'Weekly'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '0.875rem' }}>
                <InputSmall label="New interest rate (%)" value={l.newRate} onChange={v => update(i, 'newRate', v)} type="number" placeholder="Optional" />
              </div>
              <InputSmall label="New repayment ($)" value={l.newRepayment} onChange={v => update(i, 'newRepayment', v)} type="text" />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <MoneyField label="Loan balance" value={balance} onChange={setBalance} />
          <RateField label="Current fixed rate (%)" value={curRate} onChange={setCurRate} />
          <MoneyField label="Break fee" value={breakFee} onChange={setBreakFee} />
          <RateField label="Proposed new rate (%)" value={newRate} onChange={setNewRate} />
          <div>
            <label style={labelStyle}>New fixed term (months)</label>
            <div style={inputWrap}><input type="number" value={newTermMonths} onChange={e => setNewTermMonths(parseInt(e.target.value) || 0)} style={inputStyle} /></div>
          </div>
          <RateField label="Assumed follow-on rate (%)" value={followRate} onChange={setFollowRate} hint="Rate used for 'stay' scenario after fixed expiry" />
          <div>
            <label style={labelStyle}>Fixed term expiry date (DD/MM/YYYY)</label>
            <div style={inputWrap}><input type="text" value={fixedExpiry} onChange={e => setFixedExpiry(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} /></div>
          </div>
          <div>
            <label style={labelStyle}>Loan maturity date (DD/MM/YYYY)</label>
            <div style={inputWrap}><input type="text" value={maturityDate} onChange={e => setMaturityDate(e.target.value)} placeholder="DD/MM/YYYY" style={inputStyle} /></div>
          </div>
        </div>
        <button onClick={calc} style={{ ...primaryBtn, width: '100%', marginTop: '1.5rem' }}>Calculate Break-Even</button>
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

  const renderTab = () => {
    switch (activeTab) {
      case 'borrow': return <BorrowChecker />;
      case 'repayment': return <LoanRepayment />;
      case 'quickrepay': return <QuickRepay />;
      case 'comparison': return <MortgageComparison />;
      case 'breakeven': return <BreakEven />;
      case 'costtowait': return <CostToWait />;
      case 'bnpl': return <BNPLCalc />;
      default: return <BorrowChecker />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav active={activeTab} setActive={setActiveTab} />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' }}>
        {renderTab()}
        <p style={{ textAlign: 'center', fontSize: '13px', color: C.textMuted, marginTop: '2rem' }}>
          parryfs.com - NZ mortgage calculators
        </p>
      </div>
    </div>
  );
}
