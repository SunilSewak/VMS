export const ROUTES = {
  dashboard: "/dashboard",
  meetingRequests: "/meeting-requests",
  meetingRequestNew: "/meeting-requests/new",
  meetingRequestView: "/meeting-requests/:id",
  meetingRequestEdit: "/meeting-requests/:id/edit",
  hotels: "/hotels",
  venueExplorer: "/venue-explorer",
  venueDetails: "/venue-explorer/:id",
  venueComparison: "/venue-comparison",
  myShortlists: "/my-shortlists",
  bookings: "/bookings",
  bookingNew: "/bookings/new",
  bookingDetails: "/bookings/:id",
  bookingReview: "/bookings/:id/review",
  invoices: "/invoices",
  invoiceNew: "/invoices/new",
  invoiceDetails: "/invoices/:id",
  finance: "/finance",
  reports: "/reports",
  users: "/settings/users",
  venueImport: "/admin/venue-import",
  demoTools: "/admin/demo-tools",
  login: "/login"
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
