import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Users, Key, Settings, Shield, Database, Lock } from "lucide-react";

export function Administration() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const adminModules = [
    {
      title: "User Management",
      description: "Create, edit, and manage system users",
      icon: Users,
      path: "/admin/users",
      allowed: true,
    },
    {
      title: "Password Reset Requests",
      description: "Review and approve password reset requests",
      icon: Key,
      path: "/admin/password-resets",
      allowed: true,
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and preferences",
      icon: Settings,
      path: "#",
      allowed: isSuperAdmin,
      comingSoon: true,
    },
    {
      title: "Role Management",
      description: "Manage roles and permissions",
      icon: Shield,
      path: "#",
      allowed: isSuperAdmin,
      comingSoon: true,
    },
    {
      title: "Audit Logs",
      description: "View system activity and audit trails",
      icon: Database,
      path: "#",
      allowed: true,
      comingSoon: true,
    },
    {
      title: "Security Settings",
      description: "Configure security policies and access controls",
      icon: Lock,
      path: "#",
      allowed: isSuperAdmin,
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-600 mt-1">Manage system users, settings, and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules
          .filter((module) => module.allowed)
          .map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.title}
                onClick={() => !module.comingSoon && navigate(module.path)}
                disabled={module.comingSoon}
                className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all text-left ${
                  module.comingSoon ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  {module.comingSoon && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </button>
            );
          })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Security Notice</h4>
            <p className="text-sm text-blue-800">
              All administrative actions are logged. Please ensure you have proper authorization before making changes.
              {isSuperAdmin && " As Super Admin, you have full access to all system settings."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
