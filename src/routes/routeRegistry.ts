export const ROUTES = {
  dashboard: "/dashboard",
  requests: "/requests",
  hotels: "/hotels",
  quotations: "/quotations",
  approvals: "/approvals",
  bookings: "/bookings",
  finance: "/finance",
  reports: "/reports",
  users: "/settings/users",
  login: "/login"
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
