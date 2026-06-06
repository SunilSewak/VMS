import './styles/theme.css';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { VenueRequests } from './pages/VenueRequests';
import { MeetingRequests } from './pages/MeetingRequests';
import { MeetingRequestForm } from './pages/MeetingRequestForm';
import { Hotels } from './pages/Hotels';
import { VenueExplorer } from './pages/VenueExplorer';
import { VenueDetails } from './pages/VenueDetails';
import { MyShortlists } from './pages/MyShortlists';
import { Quotations } from './pages/Quotations';
import { Approvals } from './pages/Approvals';
import { Bookings } from './pages/Bookings';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { UserSettings } from './pages/UserSettings';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ROUTES } from './routes/routeRegistry';
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

            <Route path={ROUTES.requests} element={
              <ProtectedRoute>
                <AppLayout>
                  <VenueRequests />
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
            <Route path={ROUTES.quotations} element={
              <ProtectedRoute>
                <AppLayout>
                  <Quotations />
                </AppLayout>
              </ProtectedRoute>
            } />

            <Route path={ROUTES.approvals} element={
              <ProtectedRoute>
                <AppLayout>
                  <Approvals />
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
              <ProtectedRoute>
                <AppLayout>
                  <UserSettings />
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
