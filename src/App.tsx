import './styles/theme.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { DemoProvider } from './contexts/DemoContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MeetingRequests } from './pages/MeetingRequests';
import { MeetingRequestForm } from './pages/MeetingRequestForm';
import { Hotels } from './pages/Hotels';
import { VenueExplorer } from './pages/VenueExplorer';
import { VenueDetails } from './pages/VenueDetails';
import { MyShortlists } from './pages/MyShortlists';
import { Bookings } from './pages/Bookings';
import { BookingCreate } from './pages/BookingCreate';
import { BookingDetails } from './pages/BookingDetails';
import { BookingReview } from './pages/BookingReview';
import { Invoices } from './pages/Invoices';
import { InvoiceCreate } from './pages/InvoiceCreate';
import { InvoiceDetails } from './pages/InvoiceDetails';
import { Payments } from './pages/Payments';
import { PaymentCreate } from './pages/PaymentCreate';
import { PaymentDetails } from './pages/PaymentDetails';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { Rooming } from './pages/Rooming';
import { RoomingDetails } from './pages/RoomingDetails';
import { UserSettings } from './pages/UserSettings';
import { VenueBulkImport } from './pages/VenueBulkImport';
import { DemoTools } from './pages/DemoTools';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTES } from './routes/routeRegistry';
import { ROLES } from './auth/permissions';
import { useEffect } from 'react';

// Redirect helper component
function RedirectToDashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.dashboard);
  }, [navigate]);
  return null;
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
                    <MeetingRequestForm />
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
                <ProtectedRoute allowedRoles={[ROLES.SALES_HEAD, ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <BookingCreate />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.bookingDetails} element={
                <ProtectedRoute>
                  <AppLayout>
                    <BookingDetails />
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

              <Route path={ROUTES.invoices} element={
                <ProtectedRoute>
                  <AppLayout>
                    <Invoices />
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path={ROUTES.invoiceNew} element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AppLayout>
                    <InvoiceCreate />
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
