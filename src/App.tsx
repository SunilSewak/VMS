import './styles/theme.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SalesHeadHome } from './pages/SalesHeadHome';
import { MeetingRequests } from './pages/MeetingRequests';
import { MeetingRequestForm } from './pages/MeetingRequestForm';
import { RequestProcessingWorkspace } from './pages/RequestProcessingWorkspace';
import { Hotels } from './pages/Hotels';
import { VenueExplorer } from './pages/VenueExplorer';
import { VenueDetails } from './pages/VenueDetails';
import { MyShortlists } from './pages/MyShortlists';
import { Bookings } from './pages/Bookings';
import { BookingCreate } from './pages/BookingCreate';
import { BookingDetailsRouter } from './pages/BookingDetailsRouter';
import { BookingReview } from './pages/BookingReview';
import { BookingWorkspace } from './pages/BookingWorkspace';
import { Invoices } from './pages/Invoices';
import { InvoiceUpload } from './pages/InvoiceUpload';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Payments } from './pages/Payments';
import { PaymentCreate } from './pages/PaymentCreate';
import { PaymentDetails } from './pages/PaymentDetails';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { Rooming } from './pages/Rooming';
import { RoomingDetails } from './pages/RoomingDetails';
import { UserSettings } from './pages/UserSettings';
import { ZoneMaster } from './pages/ZoneMaster';
import { VenueBulkImport } from './pages/VenueBulkImport';
import { VenueUploadCenter } from './pages/VenueUploadCenter';
import { VenueAdmin } from './pages/VenueAdmin';
import { VenueDataCenter } from './pages/VenueDataCenter';
import { HotelDetailsWorkspace } from './components/HotelDetailsWorkspace';
import { DemoTools } from './pages/DemoTools';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTES } from './routes/routeRegistry';
import { ROLES } from './auth/permissions';
import { useEffect } from 'react';

// Redirect helper component with role-based routing
function RedirectToDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Sales Head lands on Home workspace
    if (user?.role === ROLES.SALES_HEAD) {
      navigate(ROUTES.home);
    } 
    // Admin lands on Meeting Requests (operational workspace)
    else if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
      navigate(ROUTES.home); // Home will show Meeting Requests for Admin
    } 
    // All other roles land on Dashboard
    else {
      navigate(ROUTES.dashboard);
    }
  }, [navigate, user]);
  
  return null;
}

// Home Router - Shows different content based on role
function HomeRouter() {
  const { user } = useAuth();
  
  // Admin/Super Admin: Home = Meeting Requests
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
    return <MeetingRequests />;
  }
  
  // Sales Head: Home = Sales Head Home page
  if (user?.role === ROLES.SALES_HEAD) {
    return <SalesHeadHome />;
  }
  
  // Fallback (shouldn't happen due to ProtectedRoute)
  return <Dashboard />;
}

// Meeting Request View Router - Shows different content based on role
function MeetingRequestViewRouter() {
  const { user } = useAuth();
  
  // Admin/Super Admin: View = Processing Workspace
  if (user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN) {
    return <RequestProcessingWorkspace />;
  }
  
  // Other roles: View = Form in view mode
  return <MeetingRequestForm />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route */}
              <Route path={ROUTES.login} element={<Login />} />

              {/* Redirect root to Dashboard */}
              <Route path="/" element={<RedirectToDashboard />} />

              {/* Protected Application Routes */}
              
              {/* Home Route - Role-based destination */}
              <Route path={ROUTES.home} element={
                <ProtectedRoute allowedRoles={[ROLES.SALES_HEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    {/* Admin: Home = Meeting Requests, Sales Head: Home = Sales Head Home */}
                    <HomeRouter />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.dashboard} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.meetingRequests} element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingRequests />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.meetingRequestNew} element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingRequestForm />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.meetingRequestView} element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingRequestViewRouter />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.meetingRequestEdit} element={
                <ProtectedRoute>
                  <AppLayout>
                    <MeetingRequestForm />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.hotels} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Hotels />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.venueExplorer} element={
                <ProtectedRoute>
                  <AppLayout>
                    <VenueExplorer />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.venueDetails} element={
                <ProtectedRoute>
                  <AppLayout>
                    <VenueDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />


              <Route path={ROUTES.myShortlists} element={
                <ProtectedRoute>
                  <AppLayout>
                    <MyShortlists />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookings} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Bookings />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookingNew} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <BookingCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookingDetails} element={
                <ProtectedRoute>
                  <AppLayout>
                    <BookingDetailsRouter />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookingReview} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <BookingReview />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookingWorkspace} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <BookingWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.invoices} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Invoices />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.invoiceUpload} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <InvoiceUpload />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.invoiceDetails} element={
                <ProtectedRoute>
                  <AppLayout>
                    <InvoiceDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.rooming} element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.VIEWER]}>
                  <AppLayout>
                    <Rooming />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.roomingDetails} element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.SALES_HEAD, ROLES.VIEWER]}>
                  <AppLayout>
                    <RoomingDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.payments} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Payments />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.paymentNew} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <PaymentCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.paymentDetails} element={
                <ProtectedRoute>
                  <AppLayout>
                    <PaymentDetails />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.finance} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Finance />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.reports} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.users} element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <UserSettings />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/administration/masters/zones" element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <ZoneMaster />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/administration/masters/venues" element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <VenueAdmin />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/administration/masters/venues/data-center" element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <VenueDataCenter />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/administration/masters/venues/:id" element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <HotelDetailsWorkspace />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/administration/masters/venues/bulk-upload" element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <VenueUploadCenter />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.venueImport} element={
                <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                  <AppLayout>
                    <VenueBulkImport />
                  </AppLayout>
                </ProtectedRoute>
              } />

            <Route path={ROUTES.demoTools} element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                <AppLayout>
                  <DemoTools />
                </AppLayout>
              </ProtectedRoute>
            } />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DemoProvider>
    </ErrorBoundary>
  );
}
