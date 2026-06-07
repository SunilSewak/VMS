/**
 * AVEMS Demo Mode Context
 *
 * Provides a global isDemoMode flag and toggle.
 * Automatically seeds demo data on first enable.
 * Renders a persistent banner when demo mode is active.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IS_DEMO_AVAILABLE, isDemoModeActive, enableDemoMode, disableDemoMode } from '../lib/demoMode';
import { seedDemoData } from '../demo/demoSeed';
import { demoReset, demoExport, demoImport } from '../demo/demoStorage';

interface DemoContextType {
  isDemoMode: boolean;
  isDemoAvailable: boolean;
  toggleDemoMode: () => void;
  resetDemoData: () => void;
  exportDemoData: () => void;
  importDemoData: (json: string) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isReloading, setIsReloading] = useState(false);
  const [isDemoMode] = useState<boolean>(() => isDemoModeActive());

  // Seed on first enable
  useEffect(() => {
    if (isDemoMode) {
      seedDemoData(); // no-ops if already seeded
    }
  }, [isDemoMode]);

  const toggleDemoMode = useCallback(() => {
    if (isReloading) return;
    
    if (isDemoMode) {
      disableDemoMode();
    } else {
      enableDemoMode();
      seedDemoData(false);
    }
    
    setIsReloading(true);
    window.location.reload();
  }, [isDemoMode, isReloading]);

  const resetDemoData = useCallback(() => {
    if (isReloading) return;
    
    demoReset();
    seedDemoData(true);
    
    setIsReloading(true);
    window.location.reload();
  }, [isReloading]);

  const exportDemoData = useCallback(() => {
    const json = demoExport();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avems-demo-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importDemoData = useCallback((json: string) => {
    demoImport(json);
    
    setIsReloading(true);
    window.location.reload();
  }, []);

  return (
    <DemoContext.Provider
      value={{ isDemoMode, isDemoAvailable: IS_DEMO_AVAILABLE, toggleDemoMode, resetDemoData, exportDemoData, importDemoData }}
    >
      {children}
      {isDemoMode && <DemoModeBanner onDisable={toggleDemoMode} />}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}

// ─── Demo Mode Banner ─────────────────────────────────────────────────────────
function DemoModeBanner({ onDisable }: { onDisable: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #d97706 0%, #b45309 100%)',
        color: '#fff',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontFamily: 'var(--font-family)',
        fontSize: '13px',
        fontWeight: '600',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Pulsing dot */}
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#fef3c7',
            display: 'inline-block',
            animation: 'demoPulse 1.5s ease-in-out infinite',
          }}
        />
        <span>DEMO MODE ACTIVE — No data is written to the production database.</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ opacity: 0.8, fontSize: '12px', fontWeight: '400' }}>
          All data is stored locally in your browser.
        </span>
        <button
          onClick={onDisable}
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            padding: '4px 14px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
        >
          Exit Demo Mode
        </button>
      </div>
      <style>{`
        @keyframes demoPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}
