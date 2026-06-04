import { AppRole } from '../auth/permissions';

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: string;
  };
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserProfile extends BaseEntity {
  email: string;
  full_name: string;
  role: AppRole;
  department?: string;
  avatar_url?: string;
}
