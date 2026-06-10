import { AppRole, ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';

export interface NavigationItem {
  name: string;
  path: string;
  iconName: string;
  roles: AppRole[];
}

export const navigationConfig: NavigationItem[] = [
  // Dashboard is visible to all
  {
    name: 'Dashboard',
    path: ROUTES.dashboard,
    iconName: 'LayoutDashboard',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE, ROLES.VIEWER]
  },
  // Requests: Admin/Super Admin sees it as 'Requests', Sales Head sees it as 'Meetings'
  {
    name: 'Requests',
    path: ROUTES.meetingRequests,
    iconName: 'FileText',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
  },
  {
    name: 'Meetings',
    path: ROUTES.meetingRequests,
    iconName: 'FileText',
    roles: [ROLES.SALES_HEAD]
  },
  // Venue Explorer: Sales Head specific hero screen
  {
    name: 'Venue Explorer',
    path: ROUTES.venueExplorer,
    iconName: 'Search',
    roles: [ROLES.SALES_HEAD]
  },
  // My Shortlists: Sales Head only
  {
    name: 'My Shortlists',
    path: ROUTES.myShortlists,
    iconName: 'Bookmark',
    roles: [ROLES.SALES_HEAD]
  },
  // Venues: Admin specific master screen
  {
    name: 'Venues',
    path: ROUTES.hotels,
    iconName: 'Hotel',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  },
  // Bookings is visible to both
  {
    name: 'Bookings',
    path: ROUTES.bookings,
    iconName: 'CalendarRange',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
  },
  // Invoices: Admin specific
  {
    name: 'Invoices',
    path: ROUTES.invoices,
    iconName: 'DollarSign',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
  },
  // Finance: Admin module
  {
    name: 'Finance',
    path: ROUTES.finance,
    iconName: 'Coins',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
  },
  // Reports
  {
    name: 'Reports',
    path: ROUTES.reports,
    iconName: 'BarChart3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE, ROLES.VIEWER]
  },
  // Masters (Admin sees /settings/users as Masters)
  {
    name: 'Masters',
    path: ROUTES.users,
    iconName: 'Users',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  },
  // Venue Import (for bulk hotel and hall onboarding)
  {
    name: 'Venue Import',
    path: ROUTES.venueImport,
    iconName: 'FileArchive',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
  }
];

export function getNavigationForRole(role: AppRole): NavigationItem[] {
  // SUPER_ADMIN Governance Rule: Show ALL navigation items without filtering
  // This ensures platform owner sees all current and future modules
  if (role === ROLES.SUPER_ADMIN) {
    return navigationConfig;
  }
  
  // For all other roles, filter navigation based on role permissions
  return navigationConfig.filter(item => item.roles.includes(role));
}
