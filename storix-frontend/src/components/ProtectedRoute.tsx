import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import toast from "react-hot-toast";

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);

  if (!token) {
    toast.error("Please log in to continue");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}