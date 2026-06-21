import { Outlet, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { LogOut } from "lucide-react";

export function AppLayout() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 font-bold text-xl border-b">VMS Lite</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block p-2 hover:bg-gray-50 rounded">Dashboard</Link>
          <Link to="/planning" className="block p-2 hover:bg-gray-50 rounded">Planning</Link>
          <Link to="/events" className="block p-2 hover:bg-gray-50 rounded">Events</Link>
          <Link to="/masters" className="block p-2 hover:bg-gray-50 rounded">Masters</Link>
          <Link to="/finance" className="block p-2 hover:bg-gray-50 rounded">Finance</Link>
          <Link to="/analytics" className="block p-2 hover:bg-gray-50 rounded">Analytics</Link>
          <Link to="/admin" className="block p-2 hover:bg-gray-50 rounded">Admin</Link>
        </nav>
        <div className="p-4 border-t flex flex-col">
          <div className="text-sm font-medium">{user?.employee_name || "User"}</div>
          <div className="text-xs text-gray-500 mb-2">{user?.role?.name}</div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800 text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
