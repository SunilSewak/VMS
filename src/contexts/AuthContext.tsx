import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';
import { AppRole, ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (role: AppRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock default session for development using standard SUPER_ADMIN role
  const [user, setUser] = useState<UserProfile | null>({
    id: 'mock-user-123',
    email: 'sunil.sewak@ajantapharma.com',
    full_name: 'Sunil Sewak',
    role: ROLES.SUPER_ADMIN,
    created_at: new Date().toISOString()
  });
  const [isLoading] = useState(false);

  const login = async (role: AppRole) => {
    setUser({
      id: 'mock-user-123',
      email: `${role.toLowerCase()}@ajantapharma.com`,
      full_name: `Mock ${role}`,
      role,
      created_at: new Date().toISOString()
    });
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
