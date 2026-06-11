import { useState, useEffect } from 'react';
import { UserPlus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { ResponsiveDataTable, ColumnDefinition } from '../components/ResponsiveDataTable';
import { UserEditModal } from '../components/UserEditModal';
import { UserRegisterModal } from '../components/UserRegisterModal';
import { getUsers, createUser, updateUser, deleteUser } from '../features/users/userService';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../auth/permissions';
import type { AppUser } from '../features/users/types';
import type { AppUserCreateInput, AppUserUpdateInput } from '../features/users/types';

export function UserSettings() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;

  // Fetch users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError((err as Error).message || 'Unable to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (user: AppUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (userId: string, updates: AppUserUpdateInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateUser(userId, updates);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
      setSuccess('User updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteConfirm(userId);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleRegisterSave = async (input: AppUserCreateInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await createUser(input);
      setUsers((prev) => [user, ...prev]);
      setSuccess('User registered successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to create user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteUser(deleteConfirm);
      setUsers(users.filter(u => u.id !== deleteConfirm));
      setDeleteConfirm(null);
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const columns: ColumnDefinition<AppUser>[] = [
    {
      header: 'Name',
      accessor: (row) => <strong>{row.employee_name}</strong>,
      priority: 'always',
      mobileLabel: 'Name'
    },
    {
      header: 'Email Address',
      accessor: (row) => row.email,
      priority: 'always',
      mobileLabel: 'Email'
    },
    {
      header: 'Role Profile',
      accessor: (row) => {
        const roleCode = row.role || row.roles?.role_code;
        const roleLabel = roleCode
          ? roleCode.replace(/^ROLE_/, '').replace('_', ' ')
          : 'Unknown';
        return <span className="badge badge-info">{roleLabel}</span>;
      },
      priority: 'always',
      mobileLabel: 'Role'
    },
    {
      header: 'Division',
      accessor: (row) => (
        row.division_name
          ? row.division_name
          : row.division_id
            ? row.division_id
            : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'Division'
    },
    {
      header: 'Account Status',
      accessor: (row) => (
        <span className={`badge badge-${row.status === 'ACTIVE' ? 'success' : 'danger'}`}>
          {row.status}
        </span>
      ),
      priority: 'tablet-desktop',
      mobileLabel: 'Status'
    },
  ];


  columns.push({
      header: 'Actions',
      accessor: (row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button
            onClick={() => handleEditClick(row)}
            title="Edit user"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem',
            }}
            disabled={isLoading}
          >
            <Edit2 size={16} />
          </button>
          {isSuperAdmin && (
            <button
              onClick={() => handleDeleteClick(row.id)}
              title="Delete user"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
              }}
              disabled={isLoading || deleteConfirm === row.id}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
      priority: 'always',
      mobileLabel: 'Actions'
    });
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '700', marginBottom: 'var(--space-1)' }}>User Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Manage platform user profiles, authorization permissions, and RBAC policies.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleRegisterClick}>
          <UserPlus size={16} />
          <span>Register User</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#dc2626',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
          }}
        >
          <span>{success}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: 'var(--font-base)', fontWeight: '600', margin: 0 }}>Registered Personnel</h4>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Showing {users.length} profiles</span>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <ResponsiveDataTable
            columns={columns}
            data={users}
            keyExtractor={(row) => row.id}
            emptyState={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found. Use Register User to add a new profile.</div>}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
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
            zIndex: 999,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '400px',
              width: '90%',
              padding: 'var(--space-6)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              Delete User?
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <UserEditModal
        user={selectedUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSave={handleEditSave}
        isLoading={isLoading}
      />

      {/* Register Modal */}
      <UserRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSave={handleRegisterSave}
        isLoading={isLoading}
      />
    </div>
  );
}
