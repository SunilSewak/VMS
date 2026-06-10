export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SALES_HEAD: 'SALES_HEAD',
  FINANCE: 'FINANCE',
  VIEWER: 'VIEWER'
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

export const PERMISSIONS = {
  CREATE_REQUEST: 'create:request',
  VIEW_REQUEST: 'view:request',
  APPROVE_REQUEST: 'approve:request',
  MANAGE_HOTELS: 'manage:hotels',
  MANAGE_BOOKINGS: 'manage:bookings',
  MANAGE_FINANCE: 'manage:finance',
  VIEW_REPORTS: 'view:reports',
  MANAGE_USERS: 'manage:users'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  SUPER_ADMIN: Object.values(PERMISSIONS),
  ADMIN: [
    PERMISSIONS.CREATE_REQUEST,
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.APPROVE_REQUEST,
    PERMISSIONS.MANAGE_HOTELS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_USERS
  ],
  SALES_HEAD: [
    PERMISSIONS.CREATE_REQUEST,
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.APPROVE_REQUEST,
    PERMISSIONS.MANAGE_HOTELS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.VIEW_REPORTS
  ],
  FINANCE: [
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.MANAGE_FINANCE,
    PERMISSIONS.VIEW_REPORTS
  ],
  VIEWER: [
    PERMISSIONS.VIEW_REQUEST,
    PERMISSIONS.VIEW_REPORTS
  ]
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Centralized permission helper for access control
 * 
 * Governance Rule:
 * - SUPER_ADMIN has unrestricted access to ALL permissions and routes
 * - This ensures platform owner can access any current or future module
 * - Other roles follow their defined permission sets
 * 
 * @param role - The user's role
 * @param permission - The permission to check
 * @returns true if the user has access, false otherwise
 */
export function hasAccess(role: AppRole | undefined, permission: Permission): boolean {
  // SUPER_ADMIN override: Always grant access
  if (role === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // All other roles follow standard permission checks
  if (!role) {
    return false;
  }
  
  return hasPermission(role, permission);
}

/**
 * Check if a user has access to a specific route
 * 
 * Governance Rule:
 * - SUPER_ADMIN can access ALL routes without restriction
 * - Other roles must be explicitly listed in allowedRoles
 * 
 * @param userRole - The user's role
 * @param allowedRoles - Roles allowed to access this route
 * @returns true if the user can access the route
 */
export function canAccessRoute(userRole: AppRole | undefined, allowedRoles?: AppRole[]): boolean {
  // SUPER_ADMIN override: Always grant access
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }
  
  // If no specific roles defined, allow access (public route)
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  
  // Check if user's role is in allowed roles
  return userRole ? allowedRoles.includes(userRole) : false;
}
