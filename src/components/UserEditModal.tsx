import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { ROLES } from '../auth/permissions';
import type { AppUser, AppUserUpdateInput } from '../features/users/types';

interface UserEditModalProps {
  user: AppUser | null;
  isOpen: boolean;
  isSuperAdmin: boolean;
  onClose: () => void;
  onSave: (id: string, updates: AppUserUpdateInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserEditModal({
  user,
  isOpen,
  isSuperAdmin,
  onClose,
  onSave,
  isLoading = false,
}: UserEditModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLES.VIEWER);
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setRole(user.role || ROLES.VIEWER);
      setDepartment(user.department || '');
      setStatus(user.status as 'ACTIVE' | 'INACTIVE' || 'ACTIVE');
      setPassword('');
      setShowPassword(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      if (!fullName.trim()) {
        setError('Full name is required');
        setSaving(false);
        return;
      }

      if (!email.trim()) {
        setError('Email is required');
        setSaving(false);
        return;
      }

      const updates: AppUserUpdateInput = {
        full_name: fullName.trim(),
        email: email.trim(),
        role: role as any,
        department: department.trim() || null,
        status,
      };

      if (password.trim() && isSuperAdmin) {
        updates.password = password.trim();
      }

      await onSave(user.id, updates);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '500px',
          width: '90%',
          padding: 'var(--space-6)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
          }}
        >
          <h3
            style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 700,
              margin: 0,
            }}
          >
            Edit User
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Full Name */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                color: 'var(--text-main)',
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
              }}
              placeholder="Enter full name"
            />
          </div>

          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                color: 'var(--text-main)',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
              }}
              placeholder="Enter email address"
            />
          </div>

          {/* Role */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                color: 'var(--text-main)',
              }}
            >
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
              }}
            >
              {Object.entries(ROLES).map(([key, value]) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                color: 'var(--text-main)',
              }}
            >
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                fontSize: 'var(--font-sm)',
                color: 'var(--text-main)',
              }}
              placeholder="Enter department (optional)"
            />
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                color: 'var(--text-main)',
              }}
            >
              Account Status
            </label>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
              }}
            >
              {['ACTIVE', 'INACTIVE'].map((s) => (
                <label
                  key={s}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: 'var(--font-sm)',
                  }}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                    disabled={isLoading}
                    style={{ cursor: 'pointer' }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          {/* Password (Super Admin only) */}
          {isSuperAdmin && (
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  marginBottom: 'var(--space-2)',
                  color: 'var(--text-main)',
                }}
              >
                Password (Leave blank to keep current)
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    fontSize: 'var(--font-sm)',
                    color: 'var(--text-main)',
                  }}
                  placeholder="Enter new password (optional)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
