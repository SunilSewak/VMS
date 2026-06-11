import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';
import { getNavigationGroupsForRole } from '../config/navigationGroups';
import { NavigationDropdown } from '../components/NavigationDropdown';
import { CommandSearch } from '../components/CommandSearch';
import { getNotifications, removeNotification } from '../lib/notificationStorage';
import * as LucideIcons from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(() => getNotifications());
  const [commandSearchOpen, setCommandSearchOpen] = useState(false);

  useEffect(() => {
    setNotifications(getNotifications());

    const handleStorageSync = () => setNotifications(getNotifications());
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  const handleDismissNotification = (id: string) => {
    removeNotification(id);
    setNotifications(getNotifications());
  };

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
  const navigationGroups = user ? getNavigationGroupsForRole(user.role) : [];

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
              onClick={() => {
                const next = !showNotifications;
                setShowNotifications(next);
                if (next) setNotifications(getNotifications());
              }}
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
                backgroundColor: notifications.length ? 'var(--status-danger)' : 'transparent'
              }} />
            </button>
            
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '320px',
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
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'grid', gap: '0.75rem' }}>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      No pending venue action requests.
                    </p>
                  ) : notifications.map((note) => (
                    <div key={note.id} style={{ padding: '0.85rem', borderRadius: '12px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                      <p style={{ margin: 0, fontSize: '0.82rem', lineHeight: 1.4, color: 'var(--text-main)' }}>{note.message}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(note.created_at).toLocaleString()}</span>
                        <button
                          onClick={() => handleDismissNotification(note.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
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
            {navigationGroups.map((group) => {
              const currentPath = location.pathname.split('?')[0];
              let isGroupActive = false;
              
              if (group.submenus.length > 0) {
                // For groups with submenus, check if any submenu path matches
                isGroupActive = group.submenus.some(sub => currentPath.startsWith(sub.path.split('?')[0]));
              } else {
                // For standalone items, check exact or default path
                if (group.id === 'home') {
                  isGroupActive = currentPath === ROUTES.home;
                } else if (group.id === 'dashboard') {
                  isGroupActive = currentPath === ROUTES.dashboard;
                }
              }

              return (
                <NavigationDropdown
                  key={group.id}
                  group={group}
                  isActive={isGroupActive}
                />
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

            {/* Navigation links - Grouped by Business Process */}
            <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {navigationGroups.map((group) => {
                const groupHasAccess = group.roles.includes(user?.role || 'VIEWER');
                if (!groupHasAccess) return null;

                if (group.submenus.length === 0) {
                  // Standalone links (Home, Dashboard)
                  const standalonePath = group.id === 'home' ? ROUTES.home : 
                                        group.id === 'dashboard' ? ROUTES.dashboard : '/';
                  
                  return (
                    <Link
                      key={group.id}
                      to={standalonePath}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        fontWeight: '600',
                        fontSize: 'var(--font-size-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {renderIcon(group.iconName)}
                      <span>{group.name}</span>
                    </Link>
                  );
                }

                return (
                  <div key={group.id}>
                    {/* Group Header */}
                    <Link
                      to={group.submenus[0]?.path || '#'}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        color: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        fontWeight: '600',
                        fontSize: 'var(--font-size-sm)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {renderIcon(group.iconName)}
                      <span>{group.name}</span>
                    </Link>

                    {/* Group Submenus */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', paddingLeft: 'var(--space-5)', marginTop: 'var(--space-1)' }}>
                      {group.submenus.map((submenu) => {
                        const isActive = location.pathname === submenu.path.split('?')[0];
                        return (
                          <Link
                            key={submenu.name}
                            to={submenu.path}
                            onClick={() => setMobileMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-3)',
                              padding: 'var(--space-2) var(--space-4)',
                              borderRadius: 'var(--radius-md)',
                              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                              fontWeight: isActive ? '500' : '400',
                              fontSize: 'var(--font-size-sm)',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            {renderIcon(submenu.iconName)}
                            <span>{submenu.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
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
