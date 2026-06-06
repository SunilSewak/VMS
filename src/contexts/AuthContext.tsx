import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { AppRole, ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: AppRole) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
  logout: () => Promise<void>;
  signInWithMock: (role: AppRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapSupabaseUserToProfile(supabaseUser: SupabaseUser, role: AppRole): UserProfile {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    full_name: supabaseUser.user_metadata?.full_name ?? supabaseUser.email ?? 'User',
    role,
    created_at: supabaseUser.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    // Check for mock session in localStorage first
    const mockSessionJson = localStorage.getItem('AVEMS_MOCK_SESSION');
    if (mockSessionJson) {
      try {
        const mockUser = JSON.parse(mockSessionJson) as UserProfile;
        setUser(mockUser);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Failed to restore mock session:', err);
        localStorage.removeItem('AVEMS_MOCK_SESSION');
      }
    }

    // Check for existing Supabase session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const role = (session.user.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
          setUser(mapSupabaseUserToProfile(session.user, role));
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const role = (session.user.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
          setUser(mapSupabaseUserToProfile(session.user, role));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: AppRole) => {
    setIsLoading(true);
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (supabaseUser) {
        // Update user metadata with role
        await supabase.auth.updateUser({
          data: { role },
        });
        setUser(mapSupabaseUserToProfile(supabaseUser, role));
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      throw new Error(err?.message ?? 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, role: AppRole) => {
    setIsLoading(true);
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) throw error;

      if (supabaseUser) {
        setUser(mapSupabaseUserToProfile(supabaseUser, role));
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      throw new Error(err?.message ?? 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Clear mock session from localStorage if present
      localStorage.removeItem('AVEMS_MOCK_SESSION');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      console.error('Logout failed:', err);
      throw new Error(err?.message ?? 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMock = async (role: AppRole) => {
    // Development helper: create a mock session without actual auth
    // This allows testing the app flow without Supabase auth setup
    setIsLoading(true);
    try {
      const mockUser: UserProfile = {
        id: `mock-${Date.now()}`,
        email: `${role.toLowerCase()}@ajantapharma.com`,
        full_name: `${role} User`,
        role,
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      // Persist mock session to localStorage so it survives page reloads
      localStorage.setItem('AVEMS_MOCK_SESSION', JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, signInWithMock }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected Route Guard Placeholder
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Unauthorized</h2>
        <p>Please log in to view this page.</p>
        <button 
          onClick={() => window.location.pathname = ROUTES.login} 
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', borderRadius: '4px' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// Role Guard Placeholder
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback ? <>{fallback}</> : (
        <div style={{ padding: '2rem', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2' }}>
          <h3>Access Denied</h3>
          <p>Your role ({user?.role || 'Guest'}) does not have permission to access this resource.</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
