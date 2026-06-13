import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { NavigationGroup } from '../config/navigationGroups';

interface NavigationDropdownProps {
  group: NavigationGroup;
  isActive: boolean;
}

export function NavigationDropdown({ group, isActive }: NavigationDropdownProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Determine if this is a standalone link (no submenus) or a dropdown
  const isStandalone = group.submenus.length === 0;
  
  // Get standalone link path
  const getStandalonePath = () => {
    if (group.id === 'home') return '/home';
    if (group.id === 'dashboard') return '/dashboard';
    return '/';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHovered(false);
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsExpanded(false);
  };

  const handleToggleExpanded = () => {
    setIsExpanded((current) => !current);
  };

  // Render icon
  const renderIcon = (name: string) => {
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent size={16} /> : <LucideIcons.HelpCircle size={16} />;
  };

  // Check if any submenu is active
  const isSubmenuActive = group.submenus.some(submenu => {
    const pathname = location.pathname;
    const path = submenu.path.split('?')[0];
    return pathname === path || pathname.startsWith(path);
  });

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        height: '100%'
      }}
      onMouseEnter={!isStandalone ? handleMouseEnter : undefined}
      onMouseLeave={!isStandalone ? handleMouseLeave : undefined}
    >
      {/* Top-level menu item - Link for standalone, button for dropdown */}
      {isStandalone ? (
        <Link
          to={getStandalonePath()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '0 var(--space-4)',
            height: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
            fontWeight: isActive ? '600' : '500',
            fontSize: 'var(--font-size-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            borderBottom: isActive ? '3px solid #38bdf8' : '3px solid transparent',
            textDecoration: 'none',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (!isActive) {
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              e.currentTarget.style.fontWeight = '500';
            }
          }}
        >
          {renderIcon(group.iconName)}
          <span>{group.name}</span>
        </Link>
      ) : (
        <button
          onClick={handleToggleExpanded}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '0 var(--space-4)',
            height: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            color: isActive || isHovered || isSubmenuActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
            fontWeight: isHovered || isActive || isSubmenuActive ? '600' : '500',
            fontSize: 'var(--font-size-md)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            borderBottom: isActive || isSubmenuActive ? '3px solid #38bdf8' : '3px solid transparent'
          }}
        >
          {renderIcon(group.iconName)}
          <span>{group.name}</span>
          <LucideIcons.ChevronDown
            size={14}
            style={{
              transition: 'transform 0.2s',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          />
        </button>
      )}

      {/* Dropdown menu */}
      {isExpanded && group.submenus.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '240px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-2) 0',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {group.submenus.map((submenu) => {
            const isPlaceholder = submenu.path === '#';
            const isActive = !isPlaceholder && location.pathname === submenu.path.split('?')[0];

            if (isPlaceholder) {
              return (
                <button
                  key={submenu.name}
                  disabled
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-4)',
                    color: 'var(--text-muted)',
                    fontWeight: '500',
                    fontSize: 'var(--font-size-sm)',
                    textDecoration: 'none',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'not-allowed',
                    opacity: 0.65
                  }}
                  title="Coming soon"
                >
                  {renderIcon(submenu.iconName)}
                  <span>{submenu.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={submenu.name}
                to={submenu.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) var(--space-4)',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: 'var(--font-size-sm)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = isActive ? 'var(--background)' : 'rgba(0,0,0,0.02)';
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.backgroundColor = isActive ? 'var(--background)' : 'transparent';
                }}
              >
                {renderIcon(submenu.iconName)}
                <span>{submenu.name}</span>
                {isActive && (
                  <LucideIcons.ChevronRight size={12} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Hover overlay for desktop (non-blocking) */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            backgroundColor: 'transparent'
          }}
        />
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
