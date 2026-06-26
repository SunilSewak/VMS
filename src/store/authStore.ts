import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/auth';
import { AuthService } from '@/services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (employeeId: string, password: string) => Promise<{ success: boolean; error?: string; forcePasswordChange?: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  canAccessMenuItem: (menuItem: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      
      login: async (employeeId: string, password: string) => {
        set({ loading: true });
        const response = await AuthService.login({ employee_id: employeeId, password });
        
        if (response.success && response.user && response.token) {
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
          return { success: true, forcePasswordChange: response.forcePasswordChange };
        } else {
          set({ loading: false });
          return { success: false, error: response.error };
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      },
      
      refreshUser: async () => {
        const { token, user } = get();
        if (!token || !user) return;
        
        const decoded = AuthService.verifyToken(token);
        if (decoded && decoded.userId) {
          const refreshedUser = await AuthService.getUserById(decoded.userId);
          if (refreshedUser) {
            set({ user: refreshedUser });
          }
        }
      },
      
      hasPermission: (resource: string, action: string) => {
        const { user } = get();
        if (!user) return false;
        return AuthService.hasPermission(user, resource, action);
      },
      
      canAccessMenuItem: (menuItem: string) => {
        const { user } = get();
        if (!user) return false;
        return AuthService.canAccessMenuItem(user, menuItem);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
