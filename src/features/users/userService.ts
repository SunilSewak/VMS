import { supabase } from '../../lib/supabase';
import type { AppUser, AppUserCreateInput, AppUserQueryFilters, AppUserUpdateInput, UserStatus } from './types';
import type { AppRole } from '../auth/permissions';

const USER_SELECT = `
  id,
  email,
  employee_name,
  role_id,
  division_id,
  status,
  created_at,
  updated_at,
  created_by,
  updated_by,
  roles:role_id (
    id,
    role_code,
    role_name
  ),
  divisions:division_id (
    division_name
  )
`;

type RoleRecord = {
  id: string;
  role_code: string;
  role_name: string;
};

interface DbUserWithRole {
  id: string;
  auth_user_id: string; // ✅ UUID linking to auth.users.id
  email: string;
  employee_name: string;
  role_id?: string | null;
  division_id?: string | null;
  status: UserStatus;
  created_at: string;
  updated_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  roles?: RoleRecord | null;
  divisions?: { division_name: string } | null;
}

function normalizeRoleCode(roleCode?: string): AppRole {
  if (!roleCode) {
    return 'VIEWER';
  }

  if (roleCode.startsWith('ROLE_')) {
    return roleCode.slice(5) as AppRole;
  }

  return roleCode as AppRole;
}

function mapDbUserToAppUser(user: DbUserWithRole): AppUser {
  return {
    ...user,
    role: normalizeRoleCode(user.roles?.role_code),
    division_name: user.divisions?.division_name ?? null,
  };
}

async function getRoleRecord(role: AppRole): Promise<RoleRecord> {
  const roleCodes = [role, `ROLE_${role}`];
  const { data, error } = await supabase
    .from<RoleRecord>('roles')
    .select('id,role_code,role_name')
    .in('role_code', roleCodes)
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    throw new Error(`Role not found for ${role}`);
  }

  return data[0];
}

/**
 * Fetch all users with optional filters
 */
export async function getUsers(filters?: AppUserQueryFilters): Promise<AppUser[]> {
  try {
    let query = supabase
      .from<DbUserWithRole>('users')
      .select(USER_SELECT)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.role) {
      const roleRecord = await getRoleRecord(filters.role);
      query = query.eq('role_id', roleRecord.id);
    }

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`email.ilike.${searchTerm},employee_name.ilike.${searchTerm}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapDbUserToAppUser);
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
      .from<DbUserWithRole>('users')
      .select(USER_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('User not found');
    }

    return mapDbUserToAppUser(data);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

/**
 * Create a new user
 * 
 * SECURITY: User creation is handled by a secure Supabase Edge Function
 * that has access to the service role key (server-side only).
 * 
 * Flow:
 * 1. Frontend calls this function
 * 2. This function calls Edge Function with user's auth token
 * 3. Edge Function verifies admin permissions
 * 4. Edge Function creates auth user with service role key
 * 5. Edge Function creates public.users record
 * 6. Returns success/failure to frontend
 */
export async function createUser(input: AppUserCreateInput): Promise<AppUser> {
  try {
    // Validation
    if (input.role === 'SALES_HEAD' && !input.division_id) {
      throw new Error('Division is required for Sales Head users.');
    }

    // Call Edge Function (supabase.functions.invoke automatically sends auth token)
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email: input.email,
        employee_name: input.employee_name,
        password: input.password,
        role: input.role,
        division_id: input.division_id || null,
        status: input.status || 'ACTIVE',
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw new Error(error.message || 'Failed to create user');
    }

    console.log('Edge Function raw response:', data);

    if (!data || !data.success) {
      const errorMsg = data?.error || 'Failed to create user';
      console.error('Edge function returned error:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ User created successfully via Edge Function:', {
      authUserId: data.user.auth_user_id,
      publicUserId: data.user.id,
      email: data.user.email,
      role: data.user.role
    });

    // Map the response to AppUser format
    return {
      id: data.user.id,
      email: data.user.email,
      employee_name: data.user.employee_name,
      role: data.user.role as AppRole,
      role_id: null,
      roles: null,
      division_id: input.division_id || null,
      division_name: data.user.division_name || null,
      status: data.user.status,
      created_at: data.user.created_at,
      updated_at: null,
      created_by: null,
      updated_by: null
    };
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
    const currentUser = await getUserById(id);

    if (input.role === 'SALES_HEAD') {
      if (input.division_id === null) {
        throw new Error('Division is required for Sales Head users.');
      }
      if (input.division_id === undefined && !currentUser.division_id) {
        throw new Error('Division is required for Sales Head users.');
      }
    }

    if (currentUser.role === 'SALES_HEAD' && input.division_id === null) {
      throw new Error('Division is required for Sales Head users.');
    }

    const updateData: any = {};

    if (input.employee_name) updateData.employee_name = input.employee_name;
    if (input.email) updateData.email = input.email;
    if (input.role) {
      const roleRecord = await getRoleRecord(input.role);
      updateData.role_id = roleRecord.id;
    }
    if (input.division_id !== undefined) updateData.division_id = input.division_id;
    if (input.status) updateData.status = input.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from<DbUserWithRole>('users')
      .update(updateData)
      .eq('id', id)
      .select(USER_SELECT)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapDbUserToAppUser(data as DbUserWithRole);
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
 * Toggle user status (Active/Inactive)
 */
export async function toggleUserStatus(id: string): Promise<AppUser> {
  try {
    const user = await getUserById(id);
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const { data, error } = await supabase
      .from<DbUserWithRole>('users')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(USER_SELECT)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapDbUserToAppUser(data as DbUserWithRole);
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
}
