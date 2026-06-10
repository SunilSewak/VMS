import { AppRole } from '../auth/permissions';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  department?: string | null;
  division_id?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  // Password field (only visible to super admin)
  password?: string;
}

export interface AppUserCreateInput {
  email: string;
  full_name: string;
  password: string;
  role: AppRole;
  department?: string | null;
  division_id?: string | null;
  status?: UserStatus;
}

export interface AppUserUpdateInput {
  full_name?: string;
  email?: string;
  role?: AppRole;
  department?: string | null;
  division_id?: string | null;
  status?: UserStatus;
  password?: string;
}

export interface AppUserQueryFilters {
  status?: UserStatus;
  role?: AppRole;
  search?: string;
}
