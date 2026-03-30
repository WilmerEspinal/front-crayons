import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: number[];
  children?: ReactNode;
}) {
  const { isAuthenticated, roleId, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Aquí puedes mostrar un spinner o un texto simple mientras carga
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleId === null || roleId === undefined) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(roleId)) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}
