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

// Placeholder pages for routes
function Dashboard() { return <h1 className="text-2xl font-bold">Dashboard</h1>; }
function Planning() { return <h1 className="text-2xl font-bold">Planning</h1>; }
function Events() { return <h1 className="text-2xl font-bold">Events</h1>; }
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
            <Route path="events/*" element={<Events />} />
            
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
