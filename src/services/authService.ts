import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase';
import {
  User,
  LoginCredentials,
  AuthResponse,
  CreateUserInput,
  UpdateUserInput,
  PasswordResetRequest,
  CreatePasswordResetInput,
  ReviewPasswordResetInput,
  ChangePasswordInput,
  ResetPasswordInput,
  UserRole,
  UserStatus,
  PasswordResetStatus,
  ROLE_PERMISSIONS,
  ROLE_MENU_ITEMS,
} from '@/types/auth';

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-in-production-min-32-chars'
);
const JWT_EXPIRY = '24h';
const SALT_ROUNDS = 12;

export class AuthService {
  // Hash password using bcrypt
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  // Verify password using bcrypt
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static async generateToken(user: User): Promise<string> {
    const token = await new SignJWT({
      userId: user.id,
      employeeId: user.employee_id,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(JWT_SECRET);
    return token;
  }

  // Verify JWT token
  static async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch (error) {
      return null;
    }
  }

  // Login with Employee ID and Password
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[AUTH] Searching for employee:', credentials.employee_id);
      
      // Fetch user by employee_id
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', credentials.employee_id)
        .single();

      if (error) {
        console.log('[AUTH] Database error:', error);
        return { success: false, error: 'Invalid Employee ID or Password' };
      }

      if (!user) {
        console.log('[AUTH] User not found in database');
        return { success: false, error: 'Invalid Employee ID or Password' };
      }

      console.log('[AUTH] User found:', user.employee_id, 'Status:', user.status);

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        console.log('[AUTH] Account disabled, status:', user.status);
        return { success: false, error: 'Account is disabled. Please contact administrator.' };
      }

      // Verify password
      console.log('[AUTH] Verifying password...');
      const isValidPassword = await this.verifyPassword(credentials.password, user.password_hash);
      console.log('[AUTH] Password verification result:', isValidPassword ? 'SUCCESS' : 'FAILED');
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid Employee ID or Password' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      // Generate token
      const token = await this.generateToken(user);

      // Remove password hash from response
      const { password_hash, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        forcePasswordChange: user.force_password_change,
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) return null;

      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Get user by Employee ID
  static async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    try {
      console.log('[AUTH] getUserByEmployeeId searching for:', employeeId);
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error) {
        console.log('[AUTH] getUserByEmployeeId database error:', error);
        return null;
      }

      if (!user) {
        console.log('[AUTH] getUserByEmployeeId: User not found');
        return null;
      }

      console.log('[AUTH] getUserByEmployeeId: User found:', user.employee_id, 'Status:', user.status);
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Get user by employee ID error:', error);
      return null;
    }
  }

  // Create new user
  static async createUser(input: CreateUserInput, createdBy: string): Promise<User | null> {
    try {
      // Check if employee_id already exists
      const existingUser = await this.getUserByEmployeeId(input.employee_id);
      if (existingUser) {
        throw new Error('Employee ID already exists');
      }

      // Hash password
      const password_hash = await this.hashPassword(input.password);

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          employee_id: input.employee_id,
          password_hash,
          employee_name: input.employee_name,
          mobile_number: input.mobile_number,
          designation: input.designation,
          cluster: input.cluster,
          team: input.team,
          role: input.role,
          status: input.status || 'ACTIVE',
          force_password_change: input.force_password_change ?? true,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (error || !user) {
        console.error('Create user error:', error);
        return null;
      }

      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  }

  // Update user
  static async updateUser(userId: string, input: UpdateUserInput): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          employee_name: input.employee_name,
          mobile_number: input.mobile_number,
          designation: input.designation,
          cluster: input.cluster,
          team: input.team,
          role: input.role,
          status: input.status,
          force_password_change: input.force_password_change,
        })
        .eq('id', userId)
        .select('*')
        .single();

      if (error || !user) {
        console.error('Update user error:', error);
        return null;
      }

      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      return !error;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  // List all users with filters
  static async listUsers(filters?: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }): Promise<User[]> {
    try {
      let query = supabase.from('users').select('*').order('created_at', { ascending: false });

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`employee_id.ilike.%${filters.search}%,employee_name.ilike.%${filters.search}%`);
      }

      const { data: users, error } = await query;

      if (error || !users) return [];

      return users.map((user: any) => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      console.error('List users error:', error);
      return [];
    }
  }

  // Change password (user changing their own password)
  static async changePassword(userId: string, input: ChangePasswordInput): Promise<boolean> {
    try {
      // Get current user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) return false;

      // Verify current password
      const isValidPassword = await this.verifyPassword(input.current_password, user.password_hash);
      if (!isValidPassword) return false;

      // Hash new password
      const new_password_hash = await this.hashPassword(input.new_password);

      // Update password and reset force_password_change flag
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: new_password_hash,
          force_password_change: false,
        })
        .eq('id', userId);

      return !updateError;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  // Reset password (admin resetting user's password)
  static async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      // Hash new password
      const password_hash = await this.hashPassword(newPassword);

      // Update password and set force_password_change flag
      const { error } = await supabase
        .from('users')
        .update({
          password_hash,
          force_password_change: true,
        })
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  }

  // Create password reset request
  static async createPasswordResetRequest(
    input: CreatePasswordResetInput,
    userId: string
  ): Promise<PasswordResetRequest | null> {
    try {
      // Verify employee_id exists
      const user = await this.getUserByEmployeeId(input.employee_id);
      if (!user) return null;

      // Check if there's already a pending request
      const { data: existingRequest } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'PENDING')
        .single();

      if (existingRequest) {
        return existingRequest;
      }

      // Create new request
      const { data: request, error } = await supabase
        .from('password_reset_requests')
        .insert({
          user_id: userId,
          employee_id: input.employee_id,
          request_reason: input.request_reason,
          status: 'PENDING',
        })
        .select('*')
        .single();

      if (error || !request) return null;

      return request;
    } catch (error) {
      console.error('Create password reset request error:', error);
      return null;
    }
  }

  // List password reset requests
  static async listPasswordResetRequests(filters?: {
    status?: PasswordResetStatus;
  }): Promise<PasswordResetRequest[]> {
    try {
      let query = supabase
        .from('password_reset_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data: requests, error } = await query;

      if (error || !requests) return [];

      return requests;
    } catch (error) {
      console.error('List password reset requests error:', error);
      return [];
    }
  }

  // Review password reset request
  static async reviewPasswordResetRequest(
    requestId: string,
    input: ReviewPasswordResetInput,
    reviewedBy: string
  ): Promise<boolean> {
    try {
      // Get the request
      const { data: request, error } = await supabase
        .from('password_reset_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !request) return false;

      // Update request status
      const { error: updateError } = await supabase
        .from('password_reset_requests')
        .update({
          status: input.status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: input.review_notes,
        })
        .eq('id', requestId);

      if (updateError) return false;

      // If approved and new password provided, reset the password
      if (input.status === 'APPROVED' && input.new_password) {
        await this.resetPassword(request.user_id, input.new_password);
        
        // Mark as completed
        await supabase
          .from('password_reset_requests')
          .update({ status: 'COMPLETED' })
          .eq('id', requestId);
      }

      return true;
    } catch (error) {
      console.error('Review password reset request error:', error);
      return false;
    }
  }

  // Check if user has permission
  static hasPermission(user: User, resource: string, action: string): boolean {
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.some(
      (p) => p.resource === resource && (p.action === action || p.action === 'manage')
    );
  }

  // Check if user can access menu item
  static canAccessMenuItem(user: User, menuItem: string): boolean {
    const menuItems = ROLE_MENU_ITEMS[user.role] || [];
    return menuItems.includes(menuItem);
  }
}
