import { Outlet, Link, useLocation, Navigate } from "react-router-dom";

export function MastersLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: "Cities", path: "/masters/cities" },
    { name: "Hotel Categories", path: "/masters/hotel-categories" },
    { name: "Hotels", path: "/masters/hotels" },
    { name: "Halls", path: "/masters/halls" },
  ];

  if (location.pathname === "/masters" || location.pathname === "/masters/") {
    return <Navigate to="/masters/cities" replace />;
  }

  return (
    <div className="flex h-full flex-col">
      <h1 className="text-2xl font-bold mb-6">Master Data Center</h1>
      <div className="border-b mb-6">
        <nav className="flex space-x-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`pb-2 px-1 ${
                location.pathname.startsWith(item.path) 
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 bg-white rounded shadow p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
