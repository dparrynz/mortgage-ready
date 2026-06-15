import React, { useState, useEffect } from 'react';

export default function MortgageReadySandbox() {
  // Page navigation
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // Property Details
  const [purchasePrice, setPurchasePrice] = useState(650000);
  const [deposit, setDeposit] = useState(130000);

  // Applicant Profile
  const [applicationType, setApplicationType] = useState('single');
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState(false);
  const [dependents, setDependents] = useState(0);

  // Income
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

  // Liabilities
  const [creditCardLimit, setCreditCardLimit] = useState(0);
  const [bnplLimit, setBnplLimit] = useState(0);
  const [otherMonthlyLoans, setOtherMonthlyLoans] = useState(0);

  // Expenses
  const [declaredExpenses, setDeclaredExpenses] = useState(2000);

  // Calculated results
  const [results, setResults] = useState(null);

  // Modal state
  const [showRepaymentCalculator, setShowRepaymentCalculator] = useState(false);
  const [calcLoanAmount, setCalcLoanAmount] = useState(0);
  const [calcInterestRate, setCalcInterestRate] = useState(6.5);
  const [calcLoanTerm, setCalcLoanTerm] = useState(30);
  
  // Expandable card state
  const [showDepositOptions, setShowDepositOptions] = useState(false);
  const [showUmiBreakdown, setShowUmiBreakdown] = useState(false);

  // Currency formatting helper
  const formatCurrency = (value) => {
    if (!value) return '';
    return value.toLocaleString('en-NZ');
  };

  const parseCurrency = (value) => {
    if (!value) return 0;
    return Number(value.replace(/[^0-9.-]+/g, ''));
  };

  const handleCurrencyChange = (value, setter) => {
    const numericValue = parseCurrency(value);
    setter(numericValue);
  };

  // Calculate all metrics when reaching results page
  useEffect(() => {
    if (currentPage === 5) {
      calculateResults();
    }
  }, [currentPage, purchasePrice, deposit, applicationType, isFirstHomeBuyer, dependents, 
      baseSalary, variableIncome, kiwiSaverRate, hasStudentLoan, partnerBaseSalary, partnerVariableIncome, partnerKiwiSaverRate, partnerHasStudentLoan,
      numBoarders, boarderWeeklyIncome, creditCardLimit, bnplLimit, otherMonthlyLoans, declaredExpenses]);

  // Initialize calculator when results are ready
  useEffect(() => {
    if (results) {
      setCalcLoanAmount(results.loanAmount);
    }
  }, [results]);

  const calculateRepayment = (amount, rate, years) => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;
    if (monthlyRate === 0) return amount / numPayments;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  function calculateResults() {
    // LOAN AMOUNT & LVR
    const loanAmount = purchasePrice - deposit;
    const lvr = (loanAmount / purchasePrice) * 100;
    
    // Determine minimum deposit requirement
    let minDepositPercent = 20;
    const totalBaseSalary = baseSalary + (applicationType === 'joint' ? partnerBaseSalary : 0);
    if (isFirstHomeBuyer && totalBaseSalary < 150000) {
      minDepositPercent = 5;
    }
    const minDeposit = purchasePrice * (minDepositPercent / 100);
    const depositPass = deposit >= minDeposit;

    // INCOME SHADING
    const shadedVariable = variableIncome * 0.8;
    const shadedPartnerVariable = (applicationType === 'joint' ? partnerVariableIncome : 0) * 0.8;
    const cappedBoarderWeekly = Math.min(boarderWeeklyIncome, 240);
    const shadedBoarder = (cappedBoarderWeekly * 52 * numBoarders) * 0.8;
    const usableGrossIncome = baseSalary + shadedVariable + 
                               (applicationType === 'joint' ? partnerBaseSalary : 0) + 
                               shadedPartnerVariable + 
                               shadedBoarder;

    // TAX ENGINE - NZ PAYE 2024/2025 with ACC levy (2026/2027), then KiwiSaver deduction
    const accLevyRate = 0.0175; // 2026/2027 rate: $1.75 per $100
    const accLevyCap = 156641; // 2026/2027 cap
    
    // Calculate tax for each person separately
    const calculateNetIncome = (grossSalary, kiwiSaverPercent) => {
      if (grossSalary === 0) return 0;
      
      // ACC Levy
      const accLevy = Math.min(grossSalary, accLevyCap) * accLevyRate;
      
      // Progressive PAYE tax calculation
      const brackets = [
        { upper: 15600, rate: 0.105, lower: 0 },
        { upper: 53500, rate: 0.175, lower: 15600 },
        { upper: 78100, rate: 0.30, lower: 53500 },
        { upper: 180000, rate: 0.33, lower: 78100 },
        { upper: Infinity, rate: 0.39, lower: 180000 }
      ];
      
      let totalTax = 0;
      for (const bracket of brackets) {
        if (grossSalary > bracket.lower) {
          const taxableInBracket = Math.min(grossSalary, bracket.upper) - bracket.lower;
          totalTax += taxableInBracket * bracket.rate;
        }
      }
      
      // Net after tax and ACC
      const netAfterTax = grossSalary - totalTax - accLevy;
      
      // KiwiSaver deduction (after tax, based on gross salary)
      const kiwiSaverDeduction = grossSalary * (kiwiSaverPercent / 100);
      
      return netAfterTax - kiwiSaverDeduction;
    };
    
    // Calculate net income for primary applicant
    const primaryNetIncome = calculateNetIncome(baseSalary + shadedVariable, kiwiSaverRate);
    
    // Calculate net income for partner (if joint application)
    const partnerNetIncome = applicationType === 'joint' 
      ? calculateNetIncome(partnerBaseSalary + shadedPartnerVariable, partnerKiwiSaverRate)
      : 0;
    
    // Boarder income (after tax estimation - keep existing simple calc)
    const boarderNetIncome = shadedBoarder > 0 ? shadedBoarder * 0.7 : 0; // Rough 30% tax on boarder income
    
    const netAnnualIncome = primaryNetIncome + partnerNetIncome + boarderNetIncome;
    const netMonthlyIncome = netAnnualIncome / 12;

    // GLEE FLOOR (ASB's income-scaled formula)
    // Base components + 7% of gross monthly income
    const gleeBase = 829; // Accommodation base
    const gleePerAdult = 430;
    const gleePerDependent = 161;
    const gleeIncomeScaling = 0.07; // 7% of gross monthly income
    
    const numAdults = applicationType === 'single' ? 1 : 2;
    const grossMonthlyIncome = usableGrossIncome / 12;
    
    const gleeFloor = gleeBase + 
                      (numAdults * gleePerAdult) + 
                      (dependents * gleePerDependent) +
                      Math.round(grossMonthlyIncome * gleeIncomeScaling);
    
    const selectedLivingExpense = Math.max(declaredExpenses, gleeFloor);
    const isUsingGleeFloor = selectedLivingExpense === gleeFloor;

    // LIABILITY ADJUSTMENTS
    const ccMonthlyExpense = creditCardLimit * 0.03;
    const bnplMonthlyExpense = bnplLimit * 0.05;
    
    // Student loan repayments - calculated per person
    const studentLoanThreshold = 24128;
    const primaryGrossIncome = baseSalary + shadedVariable;
    const partnerGrossIncome = applicationType === 'joint' ? partnerBaseSalary + shadedPartnerVariable : 0;
    
    const primaryStudentLoanMonthly = (hasStudentLoan && primaryGrossIncome > studentLoanThreshold)
      ? ((primaryGrossIncome - studentLoanThreshold) * 0.12) / 12 
      : 0;
    
    const partnerStudentLoanMonthly = (partnerHasStudentLoan && partnerGrossIncome > studentLoanThreshold)
      ? ((partnerGrossIncome - studentLoanThreshold) * 0.12) / 12 
      : 0;
    
    const studentLoanMonthly = primaryStudentLoanMonthly + partnerStudentLoanMonthly;

    // DTI CALCULATION
    const totalDebt = loanAmount + creditCardLimit + bnplLimit;
    const dti = usableGrossIncome > 0 ? totalDebt / usableGrossIncome : 0;
    const dtiPass = dti <= 6.0;

    // UMI SERVICING TEST
    const stressedRate = 0.07;
    const loanTermMonths = 360; // 30 years
    const monthlyRate = stressedRate / 12;
    const stressedMortgagePayment = loanAmount > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
        (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
      : 0;

    const umi = netMonthlyIncome - stressedMortgagePayment - selectedLivingExpense - 
                ccMonthlyExpense - bnplMonthlyExpense - studentLoanMonthly - otherMonthlyLoans;

    // Determine Kainga Ora eligibility
    const isKaingaOraEligible = isFirstHomeBuyer && totalBaseSalary < 150000;
    
    // Determine required UMI based on deposit and eligibility
    let requiredUmi = 200; // Default for 20%+ deposit or Kainga Ora eligible
    let umiStatus = 'standard'; // 'standard', 'kainga_ora', or 'challenging'
    
    if (lvr > 80) {
      if (isKaingaOraEligible) {
        requiredUmi = 200;
        umiStatus = 'kainga_ora';
      } else {
        requiredUmi = 500;
        umiStatus = 'challenging';
      }
    }
    
    const umiPass = umi >= requiredUmi;

    // SMART FEEDBACK ENGINE - Consumer friendly
    const feedback = [];
    
    if (!depositPass) {
      const shortfall = minDeposit - deposit;
      
      if (isKaingaOraEligible) {
        feedback.push({
          type: 'info',
          title: 'You qualify for Kainga Ora First Home Loan',
          message: `Great news! You're eligible for a Kainga Ora First Home Loan with just a 5% deposit. You'll need to save an additional $${shortfall.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})} to meet this requirement.`
        });
      } else {
        feedback.push({
          type: 'danger',
          title: 'Deposit shortfall',
          message: `You'll need to save an additional $${shortfall.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})} to meet the ${minDepositPercent}% deposit requirement for this property.`
        });
      }
    }

    if (!dtiPass) {
      const existingDebt = creditCardLimit + bnplLimit;
      
      if (existingDebt > 0) {
        feedback.push({
          type: 'warning',
          title: 'Debt levels',
          message: 'Your total debt (including this mortgage) is higher than banks typically allow. Consider paying down existing debts or increasing your deposit to lower the loan amount.'
        });
      } else {
        feedback.push({
          type: 'warning',
          title: 'Loan amount too high',
          message: 'The mortgage loan is too large relative to your income. Consider increasing your deposit or looking at a lower-priced property.'
        });
      }
    }

    if (!umiPass) {
      const shortfall = requiredUmi - umi;
      let specificAdvice = [];
      
      if (bnplLimit > 0) {
        const bnplSavings = bnplLimit * 0.05;
        specificAdvice.push(`closing your Buy Now Pay Later accounts (frees up $${bnplSavings.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}/month)`);
      }
      
      if (creditCardLimit > 0 && creditCardLimit > 5000) {
        specificAdvice.push(`reducing credit card limits`);
      }

      if (umiStatus === 'challenging' && !depositPass) {
        // Less than 20% deposit and not Kainga Ora eligible - show expandable options
        feedback.push({
          type: 'warning',
          title: 'Deposit and servicing need attention',
          message: `You may need to explore deposit-boosting options to reach the 20% threshold and improve your monthly budget position.`,
          expandable: true
        });
      } else if (specificAdvice.length > 0) {
        feedback.push({
          type: 'warning',
          title: 'Monthly budget tight',
          message: `Banks want to see at least $${Math.abs(shortfall).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})} more breathing room in your monthly budget. You could achieve this by ${specificAdvice.join(' or ')}.`
        });
      } else {
        feedback.push({
          type: 'warning',
          title: 'Monthly budget tight',
          message: `Banks want to see more breathing room in your monthly budget. Consider a smaller loan, increasing your income, or reducing your purchase price.`
        });
      }
    } else if (umiPass && umiStatus === 'challenging') {
      // Servicing is met but deposit is challenging (less than 20%, not Kainga Ora eligible)
      feedback.push({
        type: 'warning',
        title: 'Limited lending options',
        message: `Your servicing is strong, but with less than 20% deposit and not qualifying for Kainga Ora, your options may be limited. Consider exploring ways to increase your deposit.`,
        expandable: true
      });
    }

    if (isUsingGleeFloor) {
      feedback.push({
        type: 'info',
        title: 'Living expenses adjusted',
        message: `Banks use standard minimum living costs of $${gleeFloor.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})} per month for your situation, which is higher than what you declared.`
      });
    }

    if (depositPass && dtiPass && umiPass) {
      if (umiStatus === 'kainga_ora') {
        feedback.push({
          type: 'success',
          title: 'Kainga Ora ready!',
          message: 'Excellent! You meet all the criteria for a Kainga Ora First Home Loan. You\'re ready to start house hunting with confidence.'
        });
      } else if (lvr <= 80) {
        feedback.push({
          type: 'success',
          title: 'You\'re mortgage ready!',
          message: 'Great news! With a strong deposit (20%+) and solid servicing, you\'ll have excellent lending options across all major banks.'
        });
      } else {
        feedback.push({
          type: 'success',
          title: 'You\'re mortgage ready!',
          message: 'Great news! Based on your financials, you meet the bank lending criteria. You\'re ready to start house hunting with confidence.'
        });
      }
    }

    setResults({
      loanAmount,
      lvr,
      depositPass,
      minDeposit,
      minDepositPercent,
      usableGrossIncome,
      netMonthlyIncome,
      dti,
      dtiPass,
      stressedMortgagePayment,
      selectedLivingExpense,
      ccMonthlyExpense,
      bnplMonthlyExpense,
      studentLoanMonthly,
      umi,
      requiredUmi,
      umiPass,
      umiStatus,
      isKaingaOraEligible,
      feedback,
      isUsingGleeFloor
    });
  }


  const renderProgressBar = () => (
    <div style={{ marginBottom: '0' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '0.75rem' }}>
        {[1, 2, 3, 4, 5].map((page) => (
          <div
            key={page}
            style={{
              flex: 1,
              height: '6px',
              background: page <= currentPage ? '#1a1a2e' : 'rgba(255,255,255,0.4)',
              borderRadius: '3px',
              transition: 'background 0.3s',
              boxShadow: page <= currentPage ? '0 2px 8px rgba(26,26,46,0.2)' : 'none'
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '13px', color: '#4a4a68', margin: 0, textAlign: 'center', opacity: 0.8 }}>
        Step {currentPage} of {totalPages}
      </p>
    </div>
  );

  const renderNavigation = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginTop: '2rem',
      gap: '1rem'
    }}>
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ 
          opacity: currentPage === 1 ? 0 : 1,
          pointerEvents: currentPage === 1 ? 'none' : 'auto',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          color: '#1a1a2e',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
        onMouseEnter={(e) => {
          if (currentPage > 1) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        }}
      >
        <i className="ti ti-arrow-left" style={{ marginRight: '6px' }} aria-hidden="true" />
        Back
      </button>
      
      {currentPage < totalPages ? (
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          style={{
            background: '#1a1a2e',
            border: 'none',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(26,26,46,0.25)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(26,26,46,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(26,26,46,0.25)';
          }}
        >
          Continue
          <i className="ti ti-arrow-right" style={{ marginLeft: '6px' }} aria-hidden="true" />
        </button>
      ) : (
        <button
          onClick={() => setCurrentPage(1)}
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: 'none',
            color: '#1a1a2e',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
          }}
        >
          Start Over
        </button>
      )}
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6E9F0 0%, #EEF1F5 100%)',
      padding: '2rem 1rem'
    }}>
      <h2 className="sr-only">Mortgage Ready Sandbox - New Zealand Bank Servicing Calculator</h2>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #A8B5E5 0%, #C5CEED 100%)',
          borderRadius: '24px',
          padding: '2rem 2.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>
            Mortgage ready check
          </h1>
          <p style={{ fontSize: '15px', color: '#4a4a68', margin: '0 0 2rem', opacity: 0.9 }}>
            Find out if you're ready to buy a home in New Zealand
          </p>

          {renderProgressBar()}
        </div>

        {/* Main Content Card */}
        <div style={{ 
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '1rem'
        }}>

        {/* Page 1: Property Details */}
        {currentPage === 1 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>What property are you looking at?</h2>
            <p style={{ fontSize: '14px', color: '#6b6b85', margin: '0 0 2rem' }}>Tell us about the property you want to buy</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Purchase price
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#A8B5E5'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(purchasePrice)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setPurchasePrice)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="650,000"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                How much deposit have you saved?
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                border: '2px solid transparent',
                transition: 'all 0.2s'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(deposit)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setDeposit)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="130,000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Page 2: About You */}
        {currentPage === 2 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>Tell us about yourself</h2>
            <p style={{ fontSize: '14px', color: '#6b6b85', margin: '0 0 2rem' }}>This helps us understand your situation</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Are you applying alone or with someone?
              </label>
              <select 
                value={applicationType} 
                onChange={(e) => setApplicationType(e.target.value)}
                style={{ 
                  width: '100%',
                  background: '#F7F8FB',
                  border: '2px solid transparent',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="single">Just me</option>
                <option value="joint">With a partner</option>
              </select>
            </div>

            <div style={{ 
              background: '#F7F8FB',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isFirstHomeBuyer} 
                  onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <span style={{ fontWeight: '500', color: '#1a1a2e', display: 'block', marginBottom: '0.25rem' }}>I'm buying my first home</span>
                  <span style={{ fontSize: '13px', color: '#6b6b85' }}>First home buyers may qualify for lower deposit requirements</span>
                </div>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                How many dependents do you have?
              </label>
              <select 
                value={dependents} 
                onChange={(e) => setDependents(Number(e.target.value))}
                style={{ 
                  width: '100%',
                  background: '#F7F8FB',
                  border: '2px solid transparent',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={0}>None</option>
                <option value={1}>1 child</option>
                <option value={2}>2 children</option>
                <option value={3}>3 or more children</option>
              </select>
            </div>
          </div>
        )}

        {/* Page 3: Income */}
        {currentPage === 3 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>What's your annual income?</h2>
            <p style={{ fontSize: '14px', color: '#6b6b85', margin: '0 0 2rem' }}>Include all sources of regular income</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                {applicationType === 'joint' ? 'Your base salary or wages (before tax)' : 'Base salary or wages (before tax)'}
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(baseSalary)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setBaseSalary)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="85,000"
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                {applicationType === 'joint' ? 'Your additional income from bonuses, overtime or commission (optional)' : 'Additional income from bonuses, overtime or commission (optional)'}
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(variableIncome)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setVariableIncome)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                {applicationType === 'joint' ? 'Your KiwiSaver contribution rate' : 'KiwiSaver contribution rate'}
              </label>
              <select 
                value={kiwiSaverRate} 
                onChange={(e) => setKiwiSaverRate(Number(e.target.value))}
                style={{ 
                  width: '100%',
                  background: '#F7F8FB',
                  border: '2px solid transparent',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={0}>Not contributing</option>
                <option value={3}>3%</option>
                <option value={3.5}>3.5% (default)</option>
                <option value={4}>4%</option>
                <option value={6}>6%</option>
                <option value={8}>8%</option>
                <option value={10}>10%</option>
              </select>
            </div>

            <div style={{ 
              background: '#F7F8FB',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '2rem'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasStudentLoan} 
                  onChange={(e) => setHasStudentLoan(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
                <div>
                  <span style={{ fontWeight: '500', color: '#1a1a2e', display: 'block', marginBottom: '0.25rem' }}>
                    {applicationType === 'joint' ? 'I have a student loan' : 'I have a student loan'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6b6b85' }}>Repayments will be calculated based on your income</span>
                </div>
              </label>
            </div>

            {applicationType === 'joint' && (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #E8EAF6 0%, #F3F4FB 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  border: '1px solid rgba(168, 181, 229, 0.3)'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1.25rem', color: '#1a1a2e' }}>
                    Partner's income
                  </h3>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                      Partner's base salary or wages (before tax)
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      background: 'white',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px'
                    }}>
                      <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                      <input 
                        type="text" 
                        value={formatCurrency(partnerBaseSalary)} 
                        onChange={(e) => handleCurrencyChange(e.target.value, setPartnerBaseSalary)}
                        style={{ 
                          flex: 1, 
                          border: 'none', 
                          background: 'transparent',
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#1a1a2e',
                          outline: 'none'
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                      Partner's additional income (optional)
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      background: 'white',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      marginBottom: '1.25rem'
                    }}>
                      <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                      <input 
                        type="text" 
                        value={formatCurrency(partnerVariableIncome)} 
                        onChange={(e) => handleCurrencyChange(e.target.value, setPartnerVariableIncome)}
                        style={{ 
                          flex: 1, 
                          border: 'none', 
                          background: 'transparent',
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#1a1a2e',
                          outline: 'none'
                        }}
                        placeholder="0"
                      />
                    </div>

                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                      Partner's KiwiSaver contribution rate
                    </label>
                    <select 
                      value={partnerKiwiSaverRate} 
                      onChange={(e) => setPartnerKiwiSaverRate(Number(e.target.value))}
                      style={{ 
                        width: '100%',
                        background: 'white',
                        border: '2px solid transparent',
                        padding: '1rem 1.25rem',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1a1a2e',
                        cursor: 'pointer',
                        outline: 'none',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <option value={0}>Not contributing</option>
                      <option value={3}>3%</option>
                      <option value={3.5}>3.5% (default)</option>
                      <option value={4}>4%</option>
                      <option value={6}>6%</option>
                      <option value={8}>8%</option>
                      <option value={10}>10%</option>
                    </select>

                    <div style={{ 
                      background: 'rgba(168, 181, 229, 0.15)',
                      padding: '1rem',
                      borderRadius: '10px'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={partnerHasStudentLoan} 
                          onChange={(e) => setPartnerHasStudentLoan(e.target.checked)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <div>
                          <span style={{ fontWeight: '500', color: '#1a1a2e', display: 'block', marginBottom: '0.25rem' }}>
                            Partner has a student loan
                          </span>
                          <span style={{ fontSize: '12px', color: '#6b6b85' }}>Repayments calculated on partner's income</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div style={{ marginBottom: numBoarders > 0 ? '2rem' : '0' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Do you have boarders?
              </label>
              <select 
                value={numBoarders} 
                onChange={(e) => setNumBoarders(Number(e.target.value))}
                style={{ 
                  width: '100%',
                  background: '#F7F8FB',
                  border: '2px solid transparent',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#1a1a2e',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value={0}>No boarders</option>
                <option value={1}>1 boarder</option>
                <option value={2}>2 boarders</option>
              </select>
            </div>

            {numBoarders > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                  Weekly rent per boarder (before tax)
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  background: '#F7F8FB',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                  <input 
                    type="text" 
                    value={formatCurrency(boarderWeeklyIncome)} 
                    onChange={(e) => handleCurrencyChange(e.target.value, setBoarderWeeklyIncome)}
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      background: 'transparent',
                      fontSize: '18px',
                      fontWeight: '500',
                      color: '#1a1a2e',
                      outline: 'none'
                    }}
                    placeholder="200"
                  />
                </div>
                <p style={{ fontSize: '13px', color: '#6b6b85', margin: 0 }}>
                  Banks cap this at $240 per week per boarder
                </p>
              </div>
            )}
          </div>
        )}

        {/* Page 4: Debts and Expenses */}
        {currentPage === 4 && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>Your current debts and expenses</h2>
            <p style={{ fontSize: '14px', color: '#6b6b85', margin: '0 0 2rem' }}>
              Be honest here - banks will check these anyway
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Total credit card limits
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(creditCardLimit)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setCreditCardLimit)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>
              <p style={{ fontSize: '13px', color: '#6b6b85', margin: 0 }}>
                Add up all your credit card limits, even if you don't use them
              </p>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Buy Now Pay Later limits (Afterpay, Zip, etc.)
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(bnplLimit)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setBnplLimit)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Other loan repayments per month (car loans, personal loans, etc.)
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(otherMonthlyLoans)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setOtherMonthlyLoans)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Monthly living expenses (groceries, power, phone, insurance, etc.)
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                marginBottom: '0.5rem'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(declaredExpenses)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setDeclaredExpenses)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                  placeholder="2,000"
                />
              </div>
              <p style={{ fontSize: '13px', color: '#6b6b85', margin: 0 }}>
                Banks have minimum requirements based on household size
              </p>
            </div>
          </div>
        )}

        {/* Page 5: Results */}
        {currentPage === 5 && results && (
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '500', margin: '0 0 2rem', color: '#1a1a2e' }}>Your results</h2>

            {/* Main Feedback */}
            <div style={{ marginBottom: '2rem' }}>
              {results.feedback.map((item, index) => (
                <div 
                  key={index}
                  style={{ 
                    background: item.type === 'success' ? 'linear-gradient(135deg, #C5EEDD 0%, #D5F2E6 100%)' :
                               item.type === 'danger' ? 'linear-gradient(135deg, #F5D6D6 0%, #FADEDE 100%)' :
                               item.type === 'warning' ? 'linear-gradient(135deg, #FFE8CC 0%, #FFF0DD 100%)' :
                               'linear-gradient(135deg, #D4E3FC 0%, #E0EBFC 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    border: '2px solid',
                    borderColor: item.type === 'success' ? '#7CC9A9' :
                                item.type === 'danger' ? '#E57373' :
                                item.type === 'warning' ? '#FFB74D' :
                                '#90B4E6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.type === 'success' ? '#4CAF50' :
                                 item.type === 'danger' ? '#F44336' :
                                 item.type === 'warning' ? '#FF9800' :
                                 '#2196F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i 
                        className={`ti ti-${item.type === 'success' ? 'check' : item.type === 'danger' ? 'alert-circle' : item.type === 'warning' ? 'alert-triangle' : 'info-circle'}`}
                        style={{ fontSize: '20px', color: 'white' }}
                        aria-hidden="true"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e' }}>{item.title}</h3>
                      <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>{item.message}</p>
                      
                      {item.expandable && (
                        <div style={{ marginTop: '1rem' }}>
                          <button
                            onClick={() => setShowDepositOptions(!showDepositOptions)}
                            style={{
                              background: 'rgba(255, 255, 255, 0.8)',
                              border: 'none',
                              padding: '0.75rem 1.25rem',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: '500',
                              color: '#1a1a2e',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                            }}
                          >
                            <i className={`ti ti-chevron-${showDepositOptions ? 'up' : 'down'}`} aria-hidden="true" />
                            Ways to increase your deposit
                          </button>

                          {showDepositOptions && (
                            <div style={{
                              marginTop: '1rem',
                              background: 'white',
                              borderRadius: '12px',
                              padding: '1.5rem',
                              animation: 'slideDown 0.3s ease-out'
                            }}>
                              <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="ti ti-gift" style={{ fontSize: '18px', color: '#FF9800' }} aria-hidden="true" />
                                  Family gift
                                </h4>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>
                                  A one-off cash contribution from family. Banks view this favorably as it reduces the loan amount and increases your equity. The gift must be properly documented with a statutory declaration.
                                </p>
                              </div>

                              <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="ti ti-shield-check" style={{ fontSize: '18px', color: '#FF9800' }} aria-hidden="true" />
                                  Family guarantee
                                </h4>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>
                                  Your family uses their own property as additional security for your loan. This allows you to borrow with a smaller deposit while your family guarantees a portion of the loan. They don't give you money upfront.
                                </p>
                              </div>

                              <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="ti ti-file-text" style={{ fontSize: '18px', color: '#FF9800' }} aria-hidden="true" />
                                  Family loan
                                </h4>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>
                                  A properly documented loan from family that's structured to meet bank requirements. The loan terms, repayment schedule, and interest (if any) must be clearly recorded, and banks will factor the repayments into your servicing.
                                </p>
                              </div>

                              <div style={{ marginBottom: '1.25rem' }}>
                                <h4 style={{ fontSize: '15px', fontWeight: '500', margin: '0 0 0.5rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <i className="ti ti-pig-money" style={{ fontSize: '18px', color: '#FF9800' }} aria-hidden="true" />
                                  KiwiSaver withdrawal
                                </h4>
                                <p style={{ fontSize: '13px', lineHeight: '1.6', margin: 0, color: '#4a4a68' }}>
                                  First home buyers can withdraw their KiwiSaver funds (excluding $1,000 minimum) after 3 years of contributions. This can significantly boost your deposit.
                                </p>
                              </div>

                              <button
                                style={{
                                  background: '#1a1a2e',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.875rem 1.5rem',
                                  borderRadius: '10px',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  width: '100%',
                                  marginTop: '0.5rem',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 12px rgba(26,26,46,0.3)';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                }}
                              >
                                Book a consultation
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #E8EAF6 0%, #F3F4FB 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(168, 181, 229, 0.3)'
              }}>
                <p style={{ fontSize: '13px', color: '#6b6b85', margin: '0 0 0.5rem', fontWeight: '500' }}>
                  Loan amount
                </p>
                <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: '#1a1a2e' }}>
                  ${results.loanAmount.toLocaleString('en-NZ')}
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #E8EAF6 0%, #F3F4FB 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(168, 181, 229, 0.3)'
              }}>
                <p style={{ fontSize: '13px', color: '#6b6b85', margin: '0 0 0.5rem', fontWeight: '500' }}>
                  Your deposit
                </p>
                <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: '#1a1a2e' }}>
                  {((deposit / purchasePrice) * 100).toFixed(1)}%
                </p>
              </div>

              <div 
                onClick={() => setShowRepaymentCalculator(true)}
                style={{
                  background: 'linear-gradient(135deg, #E8EAF6 0%, #F3F4FB 100%)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid rgba(168, 181, 229, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 181, 229, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: '#6b6b85', margin: '0 0 0.5rem', fontWeight: '500' }}>
                      Estimated repayment
                    </p>
                    <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: '#1a1a2e' }}>
                      ${results.stressedMortgagePayment.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}<span style={{ fontSize: '16px', color: '#6b6b85' }}>/mo</span>
                    </p>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(168, 181, 229, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="ti ti-calculator" style={{ fontSize: '18px', color: '#1a1a2e' }} aria-hidden="true" />
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#6b6b85', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i className="ti ti-click" style={{ fontSize: '14px' }} aria-hidden="true" />
                  Click to calculate different scenarios
                </p>
              </div>

              <div style={{
                background: results.umiPass ? 
                  'linear-gradient(135deg, #C5EEDD 0%, #D5F2E6 100%)' : 
                  'linear-gradient(135deg, #F5D6D6 0%, #FADEDE 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '2px solid',
                borderColor: results.umiPass ? '#7CC9A9' : '#E57373',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setShowUmiBreakdown(!showUmiBreakdown)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: showUmiBreakdown ? '1rem' : 0 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: '#6b6b85', margin: '0 0 0.5rem', fontWeight: '500' }}>
                      Left each month
                    </p>
                    <p style={{ fontSize: '26px', fontWeight: '500', margin: 0, color: results.umiPass ? '#2E7D60' : '#C62828' }}>
                      ${Math.max(0, results.umi).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </p>
                  </div>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className={`ti ti-chevron-${showUmiBreakdown ? 'up' : 'down'}`} style={{ fontSize: '18px', color: '#1a1a2e' }} aria-hidden="true" />
                  </div>
                </div>
                
                {!showUmiBreakdown && (
                  <p style={{ fontSize: '12px', color: '#6b6b85', margin: '0.5rem 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <i className="ti ti-click" style={{ fontSize: '14px' }} aria-hidden="true" />
                    Click to see how this was calculated
                  </p>
                )}

                {showUmiBreakdown && (
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginTop: '1rem'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 1rem', color: '#1a1a2e' }}>
                      How we calculated this
                    </h4>

                    <div style={{ fontSize: '13px', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
                        <span style={{ color: '#6b6b85' }}>Your net monthly income</span>
                        <span style={{ fontWeight: '500', color: '#2E7D60' }}>
                          +${results.netMonthlyIncome.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                      </div>
                      
                      <div style={{ borderTop: '1px solid #E8EBF0', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b6b85', margin: '0 0 0.5rem' }}>
                          Monthly expenses:
                        </p>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                        <span style={{ color: '#6b6b85' }}>Mortgage repayment (stressed at 7%)</span>
                        <span style={{ fontWeight: '500', color: '#C62828' }}>
                          -${results.stressedMortgagePayment.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                        <span style={{ color: '#6b6b85' }}>Living expenses</span>
                        <span style={{ fontWeight: '500', color: '#C62828' }}>
                          -${results.selectedLivingExpense.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                      </div>

                      {results.ccMonthlyExpense > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                          <span style={{ color: '#6b6b85' }}>Credit cards (3% of limits)</span>
                          <span style={{ fontWeight: '500', color: '#C62828' }}>
                            -${results.ccMonthlyExpense.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}

                      {results.bnplMonthlyExpense > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                          <span style={{ color: '#6b6b85' }}>BNPL (5% of limits)</span>
                          <span style={{ fontWeight: '500', color: '#C62828' }}>
                            -${results.bnplMonthlyExpense.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}

                      {(hasStudentLoan || partnerHasStudentLoan) && studentLoanMonthly > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                          <span style={{ color: '#6b6b85' }}>Student loan repayment</span>
                          <span style={{ fontWeight: '500', color: '#C62828' }}>
                            -${results.studentLoanMonthly.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}

                      {otherMonthlyLoans > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                          <span style={{ color: '#6b6b85' }}>Other loan repayments</span>
                          <span style={{ fontWeight: '500', color: '#C62828' }}>
                            -${otherMonthlyLoans.toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                          </span>
                        </div>
                      )}

                      <div style={{ 
                        borderTop: '2px solid #E8EBF0', 
                        paddingTop: '0.75rem',
                        marginTop: '0.75rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: '500', color: '#1a1a2e' }}>Uncommitted monthly income</span>
                        <span style={{ fontWeight: '600', fontSize: '16px', color: results.umiPass ? '#2E7D60' : '#C62828' }}>
                          ${Math.max(0, results.umi).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                        </span>
                      </div>

                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: results.umiPass ? '#E8F5E9' : '#FFEBEE',
                        borderRadius: '8px',
                        border: `1px solid ${results.umiPass ? '#C8E6C9' : '#FFCDD2'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#6b6b85' }}>
                            {results.umiStatus === 'kainga_ora' ? 'Kainga Ora requires' : 
                             results.lvr <= 80 ? 'Banks require (20%+ deposit)' : 
                             'Banks require (<20% deposit)'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                            ${results.requiredUmi.toLocaleString('en-NZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Disclaimer */}
            <div style={{ 
              background: '#F7F8FB',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid #E8EBF0'
            }}>
              <p style={{ fontSize: '13px', color: '#6b6b85', margin: 0, lineHeight: '1.6' }}>
                <i className="ti ti-info-circle" style={{ marginRight: '6px' }} aria-hidden="true" />
                This is a guide only. Actual lending decisions depend on full financial assessments and bank policies.
              </p>
            </div>
          </div>
        )}

        {renderNavigation()}
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '1.5rem 0 0' }}>
        <p style={{ fontSize: '13px', color: '#8a8aa8', margin: 0 }}>
          This calculator provides an estimate based on typical NZ bank lending criteria
        </p>
      </div>

      {/* Repayment Calculator Modal */}
      {showRepaymentCalculator && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowRepaymentCalculator(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '2.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '500', margin: 0, color: '#1a1a2e' }}>
                Repayment calculator
              </h3>
              <button
                onClick={() => setShowRepaymentCalculator(false)}
                style={{
                  background: '#F7F8FB',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#E8EBF0'}
                onMouseLeave={(e) => e.target.style.background = '#F7F8FB'}
              >
                <i className="ti ti-x" style={{ fontSize: '20px', color: '#1a1a2e' }} aria-hidden="true" />
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Loan amount
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                background: '#F7F8FB',
                padding: '1rem 1.25rem',
                borderRadius: '12px'
              }}>
                <span style={{ fontSize: '18px', color: '#1a1a2e', fontWeight: '500' }}>$</span>
                <input 
                  type="text" 
                  value={formatCurrency(calcLoanAmount)} 
                  onChange={(e) => handleCurrencyChange(e.target.value, setCalcLoanAmount)}
                  style={{ 
                    flex: 1, 
                    border: 'none', 
                    background: 'transparent',
                    fontSize: '18px',
                    fontWeight: '500',
                    color: '#1a1a2e',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Interest rate: {calcInterestRate.toFixed(2)}%
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.1"
                value={calcInterestRate}
                onChange={(e) => setCalcInterestRate(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #A8B5E5 0%, #C5CEED 100%)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '12px', color: '#6b6b85' }}>3%</span>
                <span style={{ fontSize: '12px', color: '#6b6b85' }}>10%</span>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '0.75rem', color: '#1a1a2e' }}>
                Loan term: {calcLoanTerm} years
              </label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={calcLoanTerm}
                onChange={(e) => setCalcLoanTerm(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #A8B5E5 0%, #C5CEED 100%)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '12px', color: '#6b6b85' }}>5 years</span>
                <span style={{ fontSize: '12px', color: '#6b6b85' }}>30 years</span>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #A8B5E5 0%, #C5CEED 100%)',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '14px', color: '#4a4a68', margin: '0 0 0.5rem', fontWeight: '500' }}>
                Monthly repayment
              </p>
              <p style={{ fontSize: '36px', fontWeight: '500', margin: 0, color: '#1a1a2e' }}>
                ${calculateRepayment(calcLoanAmount, calcInterestRate, calcLoanTerm).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </p>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#F7F8FB',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '13px', color: '#6b6b85' }}>Total to repay</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                  ${(calculateRepayment(calcLoanAmount, calcInterestRate, calcLoanTerm) * calcLoanTerm * 12).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#6b6b85' }}>Total interest</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                  ${((calculateRepayment(calcLoanAmount, calcInterestRate, calcLoanTerm) * calcLoanTerm * 12) - calcLoanAmount).toLocaleString('en-NZ', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
