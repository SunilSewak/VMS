import { AppRole, ROLES } from '../auth/permissions';
import { ROUTES } from '../routes/routeRegistry';

export interface Submenu {
  name: string;
  path: string;
  iconName: string;
  roles: AppRole[];
}

export interface NavigationGroup {
  id: string;
  name: string;
  iconName: string;
  submenus: Submenu[];
  roles: AppRole[];
}

// Business Process Navigation Configuration
export const navigationGroups: NavigationGroup[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    iconName: 'LayoutDashboard',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE, ROLES.VIEWER],
    submenus: []
  },
  {
    id: 'planning',
    name: 'Planning',
    iconName: 'FileText',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE],
    submenus: [
      {
        name: 'Requests',
        path: ROUTES.requests,
        iconName: 'FileText',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
      },
      {
        name: 'Meetings',
        path: ROUTES.meetingRequests,
        iconName: 'Calendar',
        roles: [ROLES.SALES_HEAD]
      }
    ]
  },
  {
    id: 'venues',
    name: 'Venues',
    iconName: 'Hotel',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD],
    submenus: [
      {
        name: 'Venue Explorer',
        path: ROUTES.venueExplorer,
        iconName: 'Search',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
      },
      {
        name: 'Venue Comparison',
        path: ROUTES.venueComparison,
        iconName: 'ArrowLeftRight',
        roles: [ROLES.SALES_HEAD]
      },
      {
        name: 'My Shortlists',
        path: ROUTES.myShortlists,
        iconName: 'Bookmark',
        roles: [ROLES.SALES_HEAD]
      },
      {
        name: 'Venue Directory',
        path: ROUTES.hotels,
        iconName: 'List',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      }
    ]
  },
  {
    id: 'commercials',
    name: 'Commercials',
    iconName: 'Receipt',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD],
    submenus: [
      {
        name: 'Commercial Requests',
        path: ROUTES.requests,
        iconName: 'FilePlus',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        name: 'My Quotations',
        path: ROUTES.quotations,
        iconName: 'FileText',
        roles: [ROLES.SALES_HEAD]
      },
      {
        name: 'Approved Commercials',
        path: ROUTES.approvals,
        iconName: 'CheckCircle',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
      }
    ]
  },
  {
    id: 'operations',
    name: 'Operations',
    iconName: 'CalendarRange',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD],
    submenus: [
      {
        name: 'Bookings',
        path: ROUTES.bookings,
        iconName: 'CalendarCheck',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
      },
      {
        name: 'Rooming',
        path: '#',
        iconName: 'Building',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
      },
      {
        name: 'Event Execution',
        path: '#',
        iconName: 'Activity',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD]
      }
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    iconName: 'Coins',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE],
    submenus: [
      {
        name: 'Invoices',
        path: `${ROUTES.finance}?tab=invoices`,
        iconName: 'FileInvoice',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
      },
      {
        name: 'Payments',
        path: `${ROUTES.finance}?tab=payments`,
        iconName: 'CreditCard',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.FINANCE]
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    iconName: 'BarChart3',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE, ROLES.VIEWER],
    submenus: [
      {
        name: 'Reports',
        path: ROUTES.reports,
        iconName: 'FileText',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.FINANCE, ROLES.VIEWER]
      },
      {
        name: 'Dashboards',
        path: '#',
        iconName: 'LayoutDashboard',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      }
    ]
  },
  {
    id: 'administration',
    name: 'Administration',
    iconName: 'Settings',
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    submenus: [
      {
        name: 'Demo Tools',
        path: ROUTES.demoTools,
        iconName: 'Bug',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        name: 'Users',
        path: ROUTES.users,
        iconName: 'Users',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        name: 'Venue Import',
        path: ROUTES.venueImport,
        iconName: 'FileArchive',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        name: 'Masters',
        path: '#',
        iconName: 'Database',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      },
      {
        name: 'Settings',
        path: '#',
        iconName: 'Sliders',
        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
      }
    ]
  }
];

export function getNavigationGroupsForRole(role: AppRole): NavigationGroup[] {
  // SUPER_ADMIN Governance Rule: Show ALL groups and submenus
  if (role === ROLES.SUPER_ADMIN) {
    return navigationGroups;
  }

  // Filter groups and submenus based on role permissions
  return navigationGroups
    .map(group => ({
      ...group,
      submenus: group.submenus.filter(submenu => submenu.roles.includes(role))
    }))
    .filter(group => {
      // Keep groups that have visible submenus OR are standalone (like Dashboard)
      return group.roles.includes(role) && (group.submenus.length > 0 || group.submenus.length === 0);
    });
}

export function hasAccessToNavigationGroup(role: AppRole, groupId: string): boolean {
  const groups = getNavigationGroupsForRole(role);
  return groups.some(g => g.id === groupId);
}
