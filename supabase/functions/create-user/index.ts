// Supabase Edge Function: create-user
// Purpose: Securely create auth users with service role key (server-side only)
// 
// Security: Service role key is stored as Supabase secret, never exposed to client

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateUserRequest {
  email: string
  employee_name: string
  password: string
  role: string
  division_id?: string | null
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header (user's JWT token)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with service role (server-side only!)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '')

    // Verify the requesting user is authenticated using admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(jwt)
    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token')
    }

    // Verify the requesting user has admin privileges
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, roles!inner(role_code)')
      .eq('auth_user_id', user.id)
      .single()

    if (userError || !userData) {
      throw new Error('Unauthorized: User not found')
    }

    const userRole = (userData.roles as any)?.role_code
    if (!['ROLE_SUPER_ADMIN', 'ROLE_ADMIN'].includes(userRole)) {
      throw new Error('Unauthorized: Admin privileges required')
    }

    // Parse request body
    const requestData: CreateUserRequest = await req.json()

    // Validation
    if (!requestData.email || !requestData.employee_name || !requestData.role || !requestData.password) {
      throw new Error('Missing required fields: email, employee_name, role, password')
    }

    if (requestData.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }

    if (requestData.role === 'SALES_HEAD' && !requestData.division_id) {
      throw new Error('Division is required for Sales Head users')
    }

    // Get role record
    const { data: roleRecord, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id, role_code')
      .eq('role_code', `ROLE_${requestData.role}`)
      .single()

    if (roleError || !roleRecord) {
      throw new Error(`Invalid role: ${requestData.role}`)
    }

    // STEP 1: Create Supabase Auth user (server-side with service role)
    const { data: authData, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: requestData.email,
      password: requestData.password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        employee_name: requestData.employee_name,
        role: requestData.role
      }
    })

    if (authCreateError || !authData.user) {
      console.error('Auth user creation failed:', authCreateError)
      throw new Error(`Failed to create auth user: ${authCreateError?.message || 'Unknown error'}`)
    }

    const authUserId = authData.user.id

    // Verify email was confirmed
    console.log('Auth user created:', {
      id: authUserId,
      email: authData.user.email,
      email_confirmed_at: authData.user.email_confirmed_at,
      confirmed: !!authData.user.email_confirmed_at
    })

    // STEP 2: Insert into public.users with auth_user_id linkage
    const { data: publicUser, error: publicUserError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUserId,
        email: requestData.email,
        employee_name: requestData.employee_name,
        role_id: roleRecord.id,
        division_id: requestData.division_id || null,
        status: requestData.status || 'ACTIVE',
      })
      .select(`
        id,
        auth_user_id,
        email,
        employee_name,
        role_id,
        division_id,
        status,
        created_at,
        roles!inner(id, role_code, role_name),
        divisions(division_name)
      `)
      .single()

    if (publicUserError) {
      // Rollback: Delete the auth user if public.users insert fails
      await supabaseAdmin.auth.admin.deleteUser(authUserId)
      console.error('Public user creation failed:', publicUserError)
      throw new Error(`Failed to create user record: ${publicUserError.message}`)
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: publicUser.id,
          auth_user_id: publicUser.auth_user_id,
          email: publicUser.email,
          employee_name: publicUser.employee_name,
          role: requestData.role,
          role_name: (publicUser.roles as any)?.role_name,
          division_name: (publicUser.divisions as any)?.division_name,
          status: publicUser.status,
          created_at: publicUser.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
