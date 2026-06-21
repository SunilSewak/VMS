import { Outlet, Link, useLocation, Navigate } from "react-router-dom";

export function EventsLayout() {
  const location = useLocation();

  if (location.pathname === "/events" || location.pathname === "/events/") {
    return <Navigate to="/events/registry" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-2xl font-bold mb-6">Event Management</h1>
      <div className="border-b mb-6">
        <nav className="flex space-x-4">
          <Link
            to="/events/registry"
            className={`pb-2 px-1 ${
              location.pathname === "/events/registry"
                ? "border-b-2 border-blue-600 text-blue-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Registry
          </Link>
          <Link
            to="/events/create"
            className={`pb-2 px-1 ${
              location.pathname === "/events/create"
                ? "border-b-2 border-blue-600 text-blue-600 font-medium" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Create Event
          </Link>
        </nav>
      </div>
      <div className="flex-1 bg-white rounded shadow p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
