import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function AdminRoute() {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}