import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ROLES } from '../auth/permissions';
import type { AppUserCreateInput } from '../features/users/types';
import { getDivisions } from '../features/meetings/meetingService';
import type { Division } from '../features/meetings/types';
import { Modal } from './Modal';

interface UserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: AppUserCreateInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserRegisterModal({ isOpen, onClose, onSave, isLoading = false }: UserRegisterModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>(ROLES.VIEWER);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [divisionId, setDivisionId] = useState('');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const loadDivisions = async () => {
      try {
        const data = await getDivisions();
        setDivisions(data || []);
      } catch (err) {
        console.error('Failed to load divisions:', err);
      }
    };

    loadDivisions();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!employeeName.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Temporary password is required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === ROLES.SALES_HEAD && !divisionId) {
      setError('Division is required for Sales Head users.');
      return;
    }

    setError(null);

    await onSave({
      employee_name: employeeName.trim(),
      email: email.trim(),
      password: password,
      role: role as any,
      division_id: divisionId || null,
      status,
    });

    setEmployeeName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDivisionId('');
    setStatus('ACTIVE');
    setRole(ROLES.VIEWER);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
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
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Employee Name</label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Temporary Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
              placeholder="Enter temporary password (min 8 characters)"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
              placeholder="Re-enter password"
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
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600, color: 'var(--text-main)' }}>Division</label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--background)', fontSize: 'var(--font-sm)' }}
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>{division.division_name}</option>
              ))}
            </select>
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
    </Modal>
  );
}
