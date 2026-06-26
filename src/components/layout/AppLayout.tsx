import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { LogOut, LayoutDashboard, Calendar, CalendarDays, Building2, DollarSign, BarChart3, Settings, Users, MapPin, FileText, Briefcase } from "lucide-react";
import { ROLE_MENU_ITEMS } from "@/types/auth";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const MENU_ITEMS: Record<string, MenuItem> = {
  dashboard: { path: "/", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  planning: { path: "/planning", label: "Planning", icon: <Calendar className="w-4 h-4" /> },
  events: { path: "/events/registry", label: "Events & Registry", icon: <CalendarDays className="w-4 h-4" /> },
  my_events: { path: "/events/registry", label: "My Events", icon: <CalendarDays className="w-4 h-4" /> },
  master_data: { path: "/masters/cities", label: "Master Data", icon: <Building2 className="w-4 h-4" /> },
  finance: { path: "/finance", label: "Finance Hub", icon: <DollarSign className="w-4 h-4" /> },
  analytics: { path: "/analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  administration: { path: "/admin", label: "Administration", icon: <Settings className="w-4 h-4" /> },
  venue_explorer: { path: "/", label: "Venue Explorer", icon: <MapPin className="w-4 h-4" /> },
  bookings: { path: "/", label: "Bookings", icon: <FileText className="w-4 h-4" /> },
  reports: { path: "/analytics", label: "Reports", icon: <BarChart3 className="w-4 h-4" /> },
};

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout, canAccessMenuItem } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getMenuItems = () => {
    if (!user) return [];
    const allowedItems = ROLE_MENU_ITEMS[user.role] || [];
    return allowedItems
      .filter((item) => MENU_ITEMS[item])
      .map((item) => MENU_ITEMS[item]);
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-[#F8F7FB] font-sans">
      {/* Deep Navigation Sidebar - Refined Width & Padding */}
      <aside className="w-56 bg-vms-primary-dark shadow-2xl flex flex-col z-20 relative">
        <div className="p-4 flex items-center justify-center border-b border-white/10">
          <h1 className="text-xl font-black tracking-widest text-vms-accent uppercase">AVEMS</h1>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2 text-white">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-3 py-2 hover:bg-white/10 rounded-md transition-colors text-sm font-medium tracking-wide"
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10 flex flex-col bg-black/10">
          <div className="text-xs font-bold text-white mb-0.5">{user?.employee_name || "Operations User"}</div>
          <div className="text-[10px] text-vms-accent tracking-wide uppercase mb-3">{user?.role?.replace('_', ' ')}</div>
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
