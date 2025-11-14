import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const { currentUser, loading } = auth;

  console.log(
    "🔒 ProtectedRoute: loading=",
    loading,
    "currentUser=",
    currentUser
  );

  if (loading) {
    return <div>Loading...</div>; // maybe find a spinner or sth for here?
  }
  if (!currentUser) {
    console.log("🔄 Redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Access granted");
  return children;
}
