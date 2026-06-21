import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Login } from "./features/auth/Login";
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

// Placeholder pages for routes
function Dashboard() { return <h1 className="text-2xl font-bold">Dashboard</h1>; }
function Planning() { return <h1 className="text-2xl font-bold">Planning</h1>; }
function Finance() { return <h1 className="text-2xl font-bold">Finance</h1>; }
function Analytics() { return <h1 className="text-2xl font-bold">Analytics</h1>; }
function Admin() { return <h1 className="text-2xl font-bold">Admin</h1>; }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="planning" element={<Planning />} />
            
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
            
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'VMS_ADMIN']} />}>
              <Route path="masters" element={<MastersLayout />}>
                <Route path="cities" element={<CitiesList />} />
                <Route path="hotel-categories" element={<HotelCategoriesList />} />
                <Route path="hotels" element={<HotelsList />} />
                <Route path="halls" element={<HallsList />} />
              </Route>
            </Route>
            
            <Route path="finance" element={<Finance />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
