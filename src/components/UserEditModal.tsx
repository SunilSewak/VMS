import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ROLES } from '../auth/permissions';
import { getDivisions } from '../features/meetings/meetingService';
import type { AppUser, AppUserUpdateInput } from '../features/users/types';
import type { Division } from '../features/meetings/types';

interface UserEditModalProps {
  user: AppUser | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: AppUserUpdateInput) => Promise<void>;
  isLoading?: boolean;
}

export function UserEditModal({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: UserEditModalProps) {
  const [employeeName, setEmployeeName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>(ROLES.VIEWER);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [divisionId, setDivisionId] = useState('');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Populate form when user changes
  useEffect(() => {
    if (user) {
      setEmployeeName(user.employee_name || '');
      setEmail(user.email || '');
      setRole(user.role || ROLES.VIEWER);
      setStatus(user.status as 'ACTIVE' | 'INACTIVE' || 'ACTIVE');
      setDivisionId(user.division_id || '');
    }
  }, [user]);

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

  const handleSave = async () => {
    if (!user) return;

    setError(null);

    try {
      if (!employeeName.trim()) {
        setError('Name is required');
        return;
      }

      if (!email.trim()) {
        setError('Email is required');
        return;
      }

      if (role === ROLES.SALES_HEAD && !divisionId) {
        setError('Division is required for Sales Head users.');
        return;
      }

      const updates: AppUserUpdateInput = {
        employee_name: employeeName.trim(),
        email: email.trim(),
        role: role as any,
        division_id: divisionId || null,
        status,
      };

      await onSave(user.id, updates);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save user');
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
              Employee Name
            </label>
            <input
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
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
              {Object.entries(ROLES).map(([_, value]) => (
                <option key={value} value={value}>
                  {value.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Division */}
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
              Division
            </label>
            <select
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
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
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>{division.division_name}</option>
              ))}
            </select>
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
