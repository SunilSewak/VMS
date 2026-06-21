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
    <div className="flex h-screen bg-[#F8F7FB] font-sans">
      {/* Deep Navigation Sidebar - Refined Width & Padding */}
      <aside className="w-56 bg-vms-primary-dark shadow-2xl flex flex-col z-20 relative">
        <div className="p-4 flex items-center justify-center border-b border-white/10">
          <h1 className="text-xl font-black tracking-widest text-vms-accent uppercase">AVEMS</h1>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2 text-white">
          <Link to="/" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Dashboard</Link>
          <Link to="/planning" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Planning</Link>
          <Link to="/events" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Events & Registry</Link>
          <Link to="/masters" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Master Data</Link>
          <Link to="/finance" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Finance Hub</Link>
          <Link to="/analytics" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Analytics</Link>
          <Link to="/admin" className="block px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide">Administration</Link>
        </nav>
        
        <div className="p-4 border-t border-white/10 flex flex-col bg-black/10">
          <div className="text-xs font-bold text-white mb-0.5">{user?.employee_name || "Operations User"}</div>
          <div className="text-[10px] text-vms-accent tracking-wide uppercase mb-3">{user?.role?.role_name}</div>
          <button 
            onClick={handleLogout}
            className="flex items-center text-white/60 hover:text-white transition-colors text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Operations Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Operations Header */}
        <header className="h-14 bg-white border-b border-gray-200 shadow-sm flex items-center px-8 z-10 justify-between">
          <div className="text-xs font-bold text-vms-gray-500 uppercase tracking-widest">
            Ajanta Venue & Event Management
          </div>
          <div className="flex items-center space-x-3 text-xs font-bold text-vms-gray-600">
             <span className="w-2 h-2 rounded-full bg-vms-success animate-pulse"></span>
             <span>System Online</span>
          </div>
        </header>
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-[#F8F7FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
