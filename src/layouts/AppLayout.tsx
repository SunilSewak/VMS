import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../routes/routeRegistry';
import { 
  LayoutDashboard, 
  FileText, 
  Hotel, 
  Receipt, 
  CheckSquare, 
  CalendarRange, 
  Coins, 
  BarChart3, 
  Users, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Official Navigation Names and Route Registry mappings
  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', path: ROUTES.dashboard, icon: <LayoutDashboard size={20} /> },
    { name: 'Meeting Requests', path: ROUTES.requests, icon: <FileText size={20} /> },
    { name: 'Hotels', path: ROUTES.hotels, icon: <Hotel size={20} /> },
    { name: 'Quotations', path: ROUTES.quotations, icon: <Receipt size={20} /> },
    { name: 'Approvals', path: ROUTES.approvals, icon: <CheckSquare size={20} /> },
    { name: 'Bookings', path: ROUTES.bookings, icon: <CalendarRange size={20} /> },
    { name: 'Finance', path: ROUTES.finance, icon: <Coins size={20} /> },
    { name: 'Reports', path: ROUTES.reports, icon: <BarChart3 size={20} /> },
    { name: 'User Management', path: ROUTES.users, icon: <Users size={20} /> }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'var(--background)',
      fontFamily: 'var(--font-family)',
      position: 'relative'
    }}>
      {/* Sidebar - Fixed width */}
      <aside style={{
        width: sidebarOpen ? '260px' : '0px',
        backgroundColor: '#1e1b4b',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        zIndex: 50,
        position: 'relative'
      }}>
        {/* Sidebar Header Brand */}
        <div style={{
          padding: 'var(--space-6) var(--space-4)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          whiteSpace: 'nowrap'
        }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: '700', letterSpacing: '0.05em', color: '#38bdf8' }}>
              AVEMS
            </h1>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
              Ajanta Venue & Event
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ color: '#ffffff' }}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-2)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: 'var(--font-sm)',
                  transition: 'all var(--transition-fast)',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Detail */}
        {user && (
          <div style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            whiteSpace: 'nowrap'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: '700'
            }}>
              {user.full_name.charAt(0)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 'var(--font-sm)', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                {user.role.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Layout Area - Fluid remaining viewport width */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <header style={{
          height: '64px',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                style={{
                  color: 'var(--text-muted)',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--surface-hover)'
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: '600', color: 'var(--text-main)' }}>
              {menuItems.find(item => item.path === location.pathname)?.name || 'System Overview'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', position: 'relative' }}>
            {/* Notifications */}
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
                <Bell size={18} />
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
                  zIndex: 100
                }}>
                  <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: '600', marginBottom: 'var(--space-2)' }}>
                    Notifications
                  </h4>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      No new notification requests.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Action Dropdown */}
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
                <User size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: 'var(--font-sm)', fontWeight: '500', color: 'var(--text-main)' }}>
                  {user?.full_name.split(' ')[0] || 'User'}
                </span>
              </button>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: 0,
                  width: '180px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'var(--space-1) 0',
                  zIndex: 100
                }}>
                  <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 'var(--font-xs)', fontWeight: '600', color: 'var(--text-main)' }}>{user?.email}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role.replace('_', ' ')}</p>
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
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Container - Width constraints removed for fluid expansion */}
        <main style={{
          flex: 1,
          padding: 'var(--space-6)',
          overflowY: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          animation: 'fadeIn var(--transition-normal) forwards'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
