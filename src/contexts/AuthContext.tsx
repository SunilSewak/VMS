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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, role: AppRole) => Promise<void>;
  logout: () => Promise<void>;
}

// Type for app user from public.users table with role relationship
interface AppUser {
  id: string;
  employee_name: string;
  status: string;
  role_id: string;
  auth_user_id: string;
  roles: {
    id: string;
    role_code: string;
    role_name: string;
  } | null;
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
    // Check for existing Supabase session
    const getSession = async () => {
      try {
        console.log('🔍 === AUTH DEBUG: Session Check Started ===');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log('📦 SESSION:', session);
        console.log('👤 AUTH_USER:', session?.user);
        
        if (session?.user) {
          const authUser = session.user;
          console.log('🔑 AUTH_USER ID:', authUser.id);
          console.log('📧 AUTH_USER EMAIL:', authUser.email);
          console.log('🏷️ AUTH_USER METADATA:', authUser.user_metadata);
          
          // Query public.users table to get the app user profile
          console.log('🔍 Querying public.users table...');
          console.log('🔑 Looking up user with auth_user_id:', authUser.id);
          const { data: appUser, error: userError } = await supabase
            .from('users')
            .select(`
              id,
              employee_name,
              status,
              role_id,
              auth_user_id,
              roles:role_id (
                id,
                role_code,
                role_name
              )
            `)
            .eq('auth_user_id', authUser.id)
            .single() as { data: AppUser | null; error: any };
          
          console.log('👥 APP_USER from public.users:', appUser);
          if (userError) {
            console.error('❌ USER ERROR:', userError);
            console.error('❌ USER ERROR CODE:', userError.code);
            console.error('❌ USER ERROR MESSAGE:', userError.message);
            console.error('❌ USER ERROR DETAILS:', userError.details);
          }
          
          if (appUser) {
            console.log('🆔 APP_USER ID:', appUser.id);
            console.log('👤 APP_USER employee_name:', appUser.employee_name);
            console.log('📍 APP_USER status:', appUser.status);
            console.log('🎭 APP_USER role_id:', appUser.role_id);
            console.log('🔗 APP_USER roles:', appUser.roles);
            
            if (appUser.roles) {
              console.log('🎭 ROLE_CODE:', appUser.roles.role_code);
              console.log('📛 ROLE_NAME:', appUser.roles.role_name);
            }
          }
          
          // Determine the role - use database role if available, fallback to metadata
          let role: AppRole;
          if (appUser?.roles?.role_code) {
            const dbRoleCode = appUser.roles.role_code;
            // Handle both 'SUPER_ADMIN' and 'ROLE_SUPER_ADMIN' formats
            if (dbRoleCode === 'ROLE_SUPER_ADMIN') {
              role = ROLES.SUPER_ADMIN;
              console.log('✅ Using role from database (normalized): ROLE_SUPER_ADMIN →', role);
            } else {
              role = dbRoleCode as AppRole;
              console.log('✅ Using role from database:', role);
            }
          } else {
            role = (authUser.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
            console.log('⚠️ Using role from metadata (fallback):', role);
          }
          
          console.log('🎯 FINAL ROLE:', role);
          console.log('🔍 Is SUPER_ADMIN?', role === ROLES.SUPER_ADMIN);
          console.log('🔍 ROLES.SUPER_ADMIN constant:', ROLES.SUPER_ADMIN);
          
          setUser(mapSupabaseUserToProfile(authUser, role));
          
          // Test hotel query
          const { data: hotels, error: hotelError } = await supabase
            .from('hotels')
            .select('*');
          console.log('🏨 HOTELS:', hotels?.length || 0, 'records');
          if (hotelError) console.error('❌ HOTEL ERROR:', hotelError);
          
          console.log('🔍 === AUTH DEBUG: Session Check Complete ===');
        } else {
          console.log('⚠️ No session found');
        }
      } catch (err) {
        console.error('❌ Failed to restore session:', err);
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔍 === AUTH DEBUG: Login Started ===');
      console.log('📧 Email:', email);
      
      const { data: { user: supabaseUser, session }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('📦 LOGIN SESSION:', session);
      console.log('👤 LOGIN AUTH_USER:', supabaseUser);

      if (supabaseUser && session) {
        console.log('🔑 LOGIN AUTH_USER ID:', supabaseUser.id);
        console.log('📧 LOGIN AUTH_USER EMAIL:', supabaseUser.email);
        console.log('🏷️ LOGIN AUTH_USER METADATA:', supabaseUser.user_metadata);
        
        // Query public.users table
        console.log('🔍 Querying public.users table...');
        console.log('🔑 Looking up user with auth_user_id:', supabaseUser.id);
        const { data: appUser, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            employee_name,
            status,
            role_id,
            auth_user_id,
            roles:role_id (
              id,
              role_code,
              role_name
            )
          `)
          .eq('auth_user_id', supabaseUser.id)
          .single() as { data: AppUser | null; error: any };
        
        console.log('👥 LOGIN APP_USER from public.users:', appUser);
        if (userError) {
          console.error('❌ LOGIN USER ERROR:', userError);
          console.error('❌ LOGIN USER ERROR CODE:', userError.code);
          console.error('❌ LOGIN USER ERROR MESSAGE:', userError.message);
          console.error('❌ LOGIN USER ERROR DETAILS:', userError.details);
        }
        
        if (appUser) {
          console.log('🆔 LOGIN APP_USER ID:', appUser.id);
          console.log('👤 LOGIN APP_USER employee_name:', appUser.employee_name);
          console.log('📍 LOGIN APP_USER status:', appUser.status);
          console.log('🎭 LOGIN APP_USER role_id:', appUser.role_id);
          console.log('🔗 LOGIN APP_USER roles:', appUser.roles);
          
          if (appUser.roles) {
            console.log('🎭 LOGIN ROLE_CODE:', appUser.roles.role_code);
            console.log('📛 LOGIN ROLE_NAME:', appUser.roles.role_name);
          }
        }
        
        // Determine the role - use database role if available, fallback to metadata
        let role: AppRole;
        if (appUser?.roles?.role_code) {
          const dbRoleCode = appUser.roles.role_code;
          // Handle both 'SUPER_ADMIN' and 'ROLE_SUPER_ADMIN' formats
          if (dbRoleCode === 'ROLE_SUPER_ADMIN') {
            role = ROLES.SUPER_ADMIN;
            console.log('✅ LOGIN: Using role from database (normalized): ROLE_SUPER_ADMIN →', role);
          } else {
            role = dbRoleCode as AppRole;
            console.log('✅ LOGIN: Using role from database:', role);
          }
        } else {
          role = (supabaseUser.user_metadata?.role as AppRole) ?? ROLES.VIEWER;
          console.log('⚠️ LOGIN: Using role from metadata (fallback):', role);
        }
        
        console.log('🎯 LOGIN FINAL ROLE:', role);
        console.log('🔍 LOGIN: Is SUPER_ADMIN?', role === ROLES.SUPER_ADMIN);
        console.log('🔍 ROLES.SUPER_ADMIN constant:', ROLES.SUPER_ADMIN);
        
        setUser(mapSupabaseUserToProfile(supabaseUser, role));
        
        // Test hotel query
        const { data: hotels, error: hotelError } = await supabase
          .from('hotels')
          .select('*');
        console.log('🏨 HOTELS AFTER LOGIN:', hotels?.length || 0, 'records');
        if (hotelError) console.error('❌ HOTEL ERROR:', hotelError);
        
        console.log('🔍 === AUTH DEBUG: Login Complete ===');
      }
    } catch (err: any) {
      console.error('❌ Login failed:', err);
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout }}>
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

// Protected Route Guard with SUPER_ADMIN Override
export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

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

  // SUPER_ADMIN Governance Rule: Override all route restrictions
  // SUPER_ADMIN is platform owner and must access ALL modules without configuration
  if (user?.role === ROLES.SUPER_ADMIN) {
    return <>{children}</>;
  }

  // For other roles, check if they have access to this route
  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '8px', background: '#fef2f2' }}>
        <h3>Access Denied</h3>
        <p>Your role ({user.role}) does not have permission to access this resource.</p>
        <button 
          onClick={() => window.location.pathname = ROUTES.dashboard} 
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', borderRadius: '4px' }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

// Role Guard with SUPER_ADMIN Override
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user } = useAuth();

  // SUPER_ADMIN Governance Rule: Override all role restrictions
  // SUPER_ADMIN is platform owner and can view all content
  if (user?.role === ROLES.SUPER_ADMIN) {
    return <>{children}</>;
  }

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
