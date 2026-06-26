import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./features/auth/Login";
import { ChangePassword } from "./features/auth/ChangePassword";
import { ForgotPassword } from "./features/auth/ForgotPassword";
import { Unauthorized } from "./features/auth/Unauthorized";
import { MastersLayout } from "./features/masters/MastersLayout";
import { CitiesList } from "./features/masters/CitiesList";
import { HotelCategoriesList } from "./features/masters/HotelCategoriesList";
import { HotelsList } from "./features/masters/HotelsList";
import { HallsList } from "./features/masters/HallsList";
import { EventsLayout } from "./features/events/EventsLayout";
import { EventsList } from "./features/events/EventsList";
import { EventCreate } from "./features/events/EventCreate";
import { EventWorkspaceLayout } from "./features/workspace/EventWorkspaceLayout";
import { SummaryTab } from "./features/workspace/tabs/SummaryTab";
import { VenueTab } from "./features/workspace/tabs/VenueTab";
import { AccommodationTab } from "./features/workspace/tabs/AccommodationTab";
import { RoomingTab } from "./features/workspace/tabs/RoomingTab";
import { InvoicesTab } from "./features/workspace/tabs/InvoicesTab";
import { AuditTab } from "./features/workspace/tabs/AuditTab";
import { SAPClosureTab } from "./features/workspace/tabs/SAPClosureTab";
import { TimelineTab } from "./features/workspace/tabs/TimelineTab";
import { DocumentsTab } from "./features/workspace/tabs/DocumentsTab";

import { PlanningLayout } from "./features/planning/PlanningLayout";
import { PlanningDashboard } from "./features/planning/PlanningDashboard";
import { AnnualCalendarView } from "./features/planning/AnnualCalendar";
import { MonthlyPlansView } from "./features/planning/MonthlyPlans";
import { SalesHeadReviewsView } from "./features/planning/SalesHeadReviews";

import { UserManagement } from "./features/admin/UserManagement";
import { CreateUser } from "./features/admin/CreateUser";
import { EditUser } from "./features/admin/EditUser";
import { PasswordResetRequests } from "./features/admin/PasswordResetRequests";
import { Administration } from "./features/admin/Administration";

import { ComingSoon } from "./components/ui/ComingSoon";
import { Dashboard } from "./features/dashboard/Dashboard";

function Finance() { return <ComingSoon moduleName="Finance & SAP Hub" />; }
function Analytics() { return <ComingSoon moduleName="Analytics & Reports" />; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            
            <Route path="planning" element={<PlanningLayout />}>
              <Route index element={<PlanningDashboard />} />
              <Route path="annual" element={<AnnualCalendarView />} />
              <Route path="monthly" element={<MonthlyPlansView />} />
              <Route path="reviews" element={<SalesHeadReviewsView />} />
            </Route>
            
            <Route path="events" element={<EventsLayout />}>
              <Route path="registry" element={<EventsList />} />
              <Route path="create" element={<EventCreate />} />
            </Route>

            {/* Event Workspace */}
            <Route path="events/:eventId" element={<EventWorkspaceLayout />}>
              <Route path="summary" element={<SummaryTab />} />
              <Route path="venue" element={<VenueTab />} />
              <Route path="accommodation" element={<AccommodationTab />} />
              <Route path="rooming" element={<RoomingTab />} />
              <Route path="invoices" element={<InvoicesTab />} />
              <Route path="audit" element={<AuditTab />} />
              <Route path="sap" element={<SAPClosureTab />} />
              <Route path="timeline" element={<TimelineTab />} />
              <Route path="documents" element={<DocumentsTab />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
              <Route path="masters" element={<MastersLayout />}>
                <Route path="cities" element={<CitiesList />} />
                <Route path="hotel-categories" element={<HotelCategoriesList />} />
                <Route path="hotels" element={<HotelsList />} />
                <Route path="halls" element={<HallsList />} />
              </Route>
            </Route>

            {/* User Management - Admin and Super Admin only */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/users/create" element={<CreateUser />} />
              <Route path="admin/users/:userId/edit" element={<EditUser />} />
              <Route path="admin/password-resets" element={<PasswordResetRequests />} />
            </Route>
            
            <Route path="finance" element={<Finance />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin" element={<Administration />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
