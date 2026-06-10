import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { ROLES } from '../auth/permissions';
import type { AppUserCreateInput } from '../features/users/types';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AppUserCreateInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserRegisterModal({ isOpen, onClose, onSave, isLoading = false }: UserRegisterModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLES.VIEWER);
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setError(null);

    await onSave({
      full_name: fullName.trim(),
      email: email.trim(),
      role: role as any,
      department: department.trim() || null,
      status,
      password: password.trim(),
    });

    setFullName('');
    setEmail('');
    setDepartment('');
    setPassword('');
    setStatus('ACTIVE');
    setRole(ROLES.VIEWER);
    setShowPassword(false);
    onClose();
  };

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
          maxWidth: '520px',
          width: '90%',
          padding: 'var(--space-6)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, margin: 0 }}>Register New User</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
            >
              {Object.entries(ROLES).map(([_, value]) => (
                <option key={value} value={value}>{value.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
              placeholder="Enter department"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                style={{ position: 'absolute', top: '50%', right: '0.75rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Account Status</label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {['ACTIVE', 'INACTIVE'].map((value) => (
                <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="register-status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value as 'ACTIVE' | 'INACTIVE')}
                    disabled={isLoading}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-main)', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Saving...' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}
