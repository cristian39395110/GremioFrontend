import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../../config/auth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
