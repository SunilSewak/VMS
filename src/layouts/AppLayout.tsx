import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { getNavigationForRole } from '../config/navigation';
import { CommandSearch } from '../components/CommandSearch';
import * as LucideIcons from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [commandSearchOpen, setCommandSearchOpen] = useState(false);

  // Dynamic Lucide icon resolver
  const renderIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent size={18} /> : <LucideIcons.HelpCircle size={18} />;
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered menu items based on logged in user's role
  const menuItems = user ? getNavigationForRole(user.role) : [];

  return (
    <div className="app-container">
      {/* 1. TOP HEADER */}
      <header style={{
        height: '64px',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)'
        }}>
          {/* Left Side: Brand Logo and Hamburger button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }} className="logo-container">
          {/* Hamburger button (Mobile only) */}
          <button 
            className="show-mobile"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              color: 'var(--text-muted)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--surface-hover)'
            }}
          >
            <LucideIcons.Menu size={20} />
          </button>

          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '16px'
            }}>
              A
            </div>
            <div>
              <h1 style={{ fontSize: 'var(--font-sm)', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--primary)', lineHeight: 1.1 }}>
                AVEMS
              </h1>
              <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }} className="hide-mobile">
                Ajanta Pharma
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Command Search Bar Trigger */}
        <div style={{ flex: 1, maxWidth: '480px', margin: '0 var(--space-4)' }} className="hide-mobile">
          <div 
            onClick={() => setCommandSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              transition: 'all var(--transition-fast)'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <LucideIcons.Search size={16} style={{ color: 'var(--text-light)' }} />
              <span style={{ fontSize: 'var(--font-xs)' }}>Search venues, requests, bookings...</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              <span className="keycap" style={{ fontSize: '9px', padding: '1px 4px' }}>Ctrl</span>
              <span className="keycap" style={{ fontSize: '9px', padding: '1px 4px' }}>K</span>
            </div>
          </div>
        </div>

        {/* Right Side: Notification and Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {/* Mobile Search Button */}
          <button 
            className="show-mobile"
            onClick={() => setCommandSearchOpen(true)}
            style={{
              color: 'var(--text-muted)',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--background)'
            }}
          >
            <LucideIcons.Search size={16} />
          </button>

          {/* Notifications Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                color: 'var(--text-muted)',
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)',
                position: 'relative'
              }}
            >
              <LucideIcons.Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '8px',
                height: '8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--status-danger)'
              }} />
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '280px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: 'var(--space-3)',
                zIndex: 110
              }}>
                <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                  Notifications
                </h4>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
                  <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                    No pending venue action requests.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--background)'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user?.full_name.charAt(0) || 'U'}
              </div>
              <span style={{ fontSize: 'var(--font-xs)', fontWeight: '500', color: 'var(--text-main)' }} className="hide-mobile">
                {user?.full_name.split(' ')[0] || 'User'}
              </span>
            </button>

            {userDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '200px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                padding: 'var(--space-1) 0',
                zIndex: 110
              }}>
                <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.full_name}</p>
                  <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: '500' }}>{user?.role.replace('_', ' ')}</p>
                </div>
                <button 
                  onClick={() => logout()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--status-danger)',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <LucideIcons.LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
        </div>
      </header>

      {/* 2. DESKTOP TOP NAVIGATION BAR */}
      <nav className="hide-mobile" style={{
        backgroundColor: '#1e1b4b',
        color: '#ffffff',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: '64px',
        zIndex: 90
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '48px',
          padding: '0 var(--space-4)'
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-1)', height: '100%' }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path.split('?')[0];
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: '0 var(--space-4)',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-md)',
                    transition: 'all var(--transition-fast)',
                    borderBottom: isActive ? '3px solid var(--secondary)' : '3px solid transparent',
                    height: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {renderIcon(item.iconName)}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. MOBILE SLIDE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: 'fadeIn var(--transition-fast) forwards'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: '#1e1b4b',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: 'var(--space-5) var(--space-4)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: '700', color: '#38bdf8' }}>AVEMS</h1>
                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Ajanta Venue Portal</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: '#ffffff', display: 'flex' }}>
                <LucideIcons.X size={20} />
              </button>
            </div>

            {/* Navigation links */}
            <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path.split('?')[0];
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontSize: 'var(--font-size-md)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {renderIcon(item.iconName)}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer details */}
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              Logged in as: {user?.full_name} ({user?.role.toLowerCase().replace('_', ' ')})
            </div>
          </div>
        </div>
      )}

      {/* CSS Slide transition styling for mobile drawer */}
      <style>{`
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="main-content">
        {children}
      </main>

      {/* Ctrl+K Search Modal */}
      <CommandSearch 
        isOpen={commandSearchOpen} 
        onClose={() => setCommandSearchOpen(false)} 
      />
    </div>
  );
}
