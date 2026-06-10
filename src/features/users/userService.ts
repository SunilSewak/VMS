import { supabase } from '../../lib/supabase';
import type { AppUser, AppUserCreateInput, AppUserUpdateInput, AppUserQueryFilters } from './types';

/**
 * Fetch all users with optional filters
 */
export async function getUsers(filters?: AppUserQueryFilters): Promise<AppUser[]> {
  try {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`email.ilike.${searchTerm},full_name.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<AppUser> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('User not found');
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user
 */
export async function createUser(input: AppUserCreateInput): Promise<AppUser> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: input.email,
          full_name: input.full_name,
          password: input.password,
          role: input.role,
          department: input.department || null,
          division_id: input.division_id || null,
          status: input.status || 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

/**
 * Update an existing user
 */
export async function updateUser(id: string, input: AppUserUpdateInput): Promise<AppUser> {
  try {
    const updateData: any = {};

    if (input.full_name) updateData.full_name = input.full_name;
    if (input.email) updateData.email = input.email;
    if (input.role) updateData.role = input.role;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.division_id !== undefined) updateData.division_id = input.division_id;
    if (input.status) updateData.status = input.status;
    if (input.password) updateData.password = input.password;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Delete a user
 */
export async function deleteUser(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

/**
 * Reset user password (Super Admin only)
 */
export async function resetUserPassword(id: string, newPassword: string): Promise<AppUser> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        password: newPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

/**
 * Toggle user status (Active/Inactive)
 */
export async function toggleUserStatus(id: string): Promise<AppUser> {
  try {
    const user = await getUserById(id);
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { data, error } = await supabase
      .from('users')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
}
