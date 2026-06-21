import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

// Extend the Supabase User type with our custom profile
export interface UserProfile {
  id: string;
  employee_code: string;
  employee_name: string;
  email: string;
  role_id: string;
  active_flag: boolean;
  role?: {
    name: string;
  };
}

interface AuthState {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));
