export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SALES_HEAD';

export type UserStatus = 'ACTIVE' | 'DISABLED';

export type PasswordResetStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface User {
  id: string;
  employee_id: string;
  employee_name: string;
  mobile_number?: string;
  designation?: string;
  cluster?: string;
  team?: string;
  role: UserRole;
  status: UserStatus;
  force_password_change: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface LoginCredentials {
  employee_id: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  forcePasswordChange?: boolean;
}

export interface CreateUserInput {
  employee_id: string;
  password: string;
  employee_name: string;
  mobile_number?: string;
  designation?: string;
  cluster?: string;
  team?: string;
  role: UserRole;
  status?: UserStatus;
  force_password_change?: boolean;
}

export interface UpdateUserInput {
  employee_name?: string;
  mobile_number?: string;
  designation?: string;
  cluster?: string;
  team?: string;
  role?: UserRole;
  status?: UserStatus;
  force_password_change?: boolean;
}

export interface PasswordResetRequest {
  id: string;
  user_id: string;
  employee_id: string;
  request_reason?: string;
  status: PasswordResetStatus;
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
}

export interface CreatePasswordResetInput {
  employee_id: string;
  request_reason?: string;
}

export interface ReviewPasswordResetInput {
  status: PasswordResetStatus;
  review_notes?: string;
  new_password?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordInput {
  new_password: string;
  confirm_password: string;
}

export interface Permission {
  resource: string;
  action: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'planning', action: 'view' },
    { resource: 'events', action: 'view' },
    { resource: 'events', action: 'manage_all' },
    { resource: 'master_data', action: 'view' },
    { resource: 'master_data', action: 'manage' },
    { resource: 'finance', action: 'view' },
    { resource: 'finance', action: 'manage' },
    { resource: 'analytics', action: 'view' },
    { resource: 'user_management', action: 'view' },
    { resource: 'user_management', action: 'manage' },
    { resource: 'roles', action: 'view' },
    { resource: 'roles', action: 'manage' },
    { resource: 'system_settings', action: 'view' },
    { resource: 'system_settings', action: 'manage' },
  ],
  ADMIN: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'planning', action: 'view' },
    { resource: 'events', action: 'view' },
    { resource: 'events', action: 'manage_all' },
    { resource: 'master_data', action: 'view' },
    { resource: 'master_data', action: 'manage' },
    { resource: 'finance', action: 'view' },
    { resource: 'analytics', action: 'view' },
    { resource: 'user_management', action: 'view' },
    { resource: 'user_management', action: 'manage' },
  ],
  SALES_HEAD: [
    { resource: 'dashboard', action: 'view' },
    { resource: 'planning', action: 'view' },
    { resource: 'planning', action: 'approve' },
    { resource: 'events', action: 'view' },
    { resource: 'reports', action: 'view' },
  ],
};

export const ROLE_MENU_ITEMS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    'dashboard',
    'planning',
    'events',
    'master_data',
    'finance',
    'analytics',
    'administration',
  ],
  ADMIN: [
    'dashboard',
    'planning',
    'events',
    'master_data',
    'finance',
    'administration',
  ],
  SALES_HEAD: [
    'dashboard',
    'planning',
    'events',
    'reports',
  ],
};
