/**
 * AVEMS Demo Mode Controller
 *
 * Central control for demo mode. Only active when:
 *  1. Build is DEV (import.meta.env.DEV === true), AND
 *  2. User has toggled demo mode ON (persisted in localStorage) or DEMO_MODE env is true.
 *
 * In demo mode:
 *  - No Supabase reads or writes occur.
 *  - All data is served from in-memory seed fixtures stored in localStorage.
 *  - The banner is rendered by AppLayout.
 */

import { env } from './env';

const DEMO_KEY = 'avems_demo_mode';

// Demo mode is only available in development builds.
export const IS_DEMO_AVAILABLE: boolean = (import.meta as any).env?.DEV === true || env.VITE_DEMO_MODE === true;

export function isDemoModeActive(): boolean {
  if (!IS_DEMO_AVAILABLE) return false;
  try {
    return localStorage.getItem(DEMO_KEY) === 'true';
  } catch {
    return false;
  }
}

export function enableDemoMode(): void {
  if (!IS_DEMO_AVAILABLE) return;
  localStorage.setItem(DEMO_KEY, 'true');
}

export function disableDemoMode(): void {
  localStorage.removeItem(DEMO_KEY);
}

export function toggleDemoMode(): boolean {
  const next = !isDemoModeActive();
  next ? enableDemoMode() : disableDemoMode();
  return next;
}
