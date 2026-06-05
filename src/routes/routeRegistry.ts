export const ROUTES = {
  dashboard: "/dashboard",
  requests: "/requests",
  meetingRequests: "/meeting-requests",
  meetingRequestNew: "/meeting-requests/new",
  meetingRequestView: "/meeting-requests/:id",
  meetingRequestEdit: "/meeting-requests/:id/edit",
  hotels: "/hotels",
  venueExplorer: "/venue-explorer",
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
