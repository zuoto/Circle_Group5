import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();
  const { currentUser, loading } = auth;

  if (loading) {
    return <div>Loading...</div>; // maybe find a spinner or sth for here?
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
