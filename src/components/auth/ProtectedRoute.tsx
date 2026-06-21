import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, user, loading, setSession, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setLoading]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("users")
      .select("*, role:roles(name)")
      .eq("id", userId)
      .single();
    
    if (data) setUser(data);
    setLoading(false);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role?.name && !allowedRoles.includes(user.role.name)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
