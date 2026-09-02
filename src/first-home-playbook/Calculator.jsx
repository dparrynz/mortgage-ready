import React, { useState } from 'react';
import { BorrowChecker, useAuth, AuthModal, supabase, C, primaryBtn, secondaryBtn } from '../../ParryFSApp.jsx';
import { PlaybookHeader, PlaybookCard, PlaybookDisclaimer } from './shared.jsx';

// Mirrors the save/auth wiring in ParryFSApp.jsx's <App> exactly (running a
// calculation needs no login; saving a scenario does) so BorrowChecker
// behaves identically here as on the main Borrow Checker tab.
export default function Calculator({ onExit, onBackToHub, onNavigate }) {
  const { user, refreshUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveName, setShowSaveName] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [pendingSave, setPendingSave] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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

  return (
    <div>
      <PlaybookHeader title="Know Your Numbers" onExit={onExit} onBackToHub={onBackToHub} />
      <BorrowChecker
        onSavePrompt={!user ? () => setShowAuthModal(true) : null}
        onSave={user ? handleSavePrompt : null}
      />
      <PlaybookCard>
        <PlaybookDisclaimer onNavigate={onNavigate} />
      </PlaybookCard>

      {showAuthModal && (
        <AuthModal onClose={() => { setShowAuthModal(false); setPendingSave(null); }} onSuccess={handleAuthSuccess} />
      )}

      {showSaveName && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }} onClick={() => setShowSaveName(false)}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: '500', margin: '0 0 0.5rem', color: C.textPrimary }}>Name your scenario</h3>
            <p style={{ fontSize: '14px', color: C.textSecondary, margin: '0 0 1.5rem' }}>Give this scenario a name so you can find it easily later.</p>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="e.g. Mount Eden 3-bed"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveConfirm()}
              style={{ width: '100%', boxSizing: 'border-box', background: C.inputBg, border: 'none', borderRadius: '12px', padding: '1rem 1.25rem', fontSize: '16px', color: C.textPrimary, outline: 'none', marginBottom: '1.5rem' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowSaveName(false)} style={{ ...secondaryBtn, flex: 1 }}>Cancel</button>
              <button onClick={handleSaveConfirm} style={{ ...primaryBtn, flex: 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: C.accent, color: 'white', padding: '0.875rem 1.5rem', borderRadius: '12px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: 3000 }}>
          Scenario saved!
        </div>
      )}
    </div>
  );
}
