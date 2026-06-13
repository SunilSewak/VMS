import { AppRole } from '../../auth/permissions';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AppUser {
  id: string;
  email: string;
  employee_name: string;
  role: AppRole;
  role_id?: string | null;
  roles?: {
    id: string;
    role_code: string;
    role_name: string;
  } | null;
  division_id?: string | null;
  division_name?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface AppUserCreateInput {
  email: string;
  employee_name: string;
  password: string;
  role: AppRole;
  division_id?: string | null;
  status?: UserStatus;
}

export interface AppUserUpdateInput {
  employee_name?: string;
  email?: string;
  role?: AppRole;
  division_id?: string | null;
  status?: UserStatus;
}

export interface AppUserQueryFilters {
  status?: UserStatus;
  role?: AppRole;
  search?: string;
}
