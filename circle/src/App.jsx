import { Routes, Route } from "react-router-dom";
import NavBar from "./reusable-components/NavBar";
import Feed from "./features/feed.jsx";
import Profile from "./features/Profile";
import Groups from "./features/Groups";
import GroupDetail from "./features/GroupDetail";
import Events from "./features/Events";
import LogIn from "./features/LogIn";
import Register from "./features/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthProvider";
import "./App.css";

export default function App() {
  const { auth } = useAuth();

  // If not logged in, show login page
  if (!auth?.token) {
    return (
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<LogIn />} />
      </Routes>
    );
  }

  // If logged in, show main app with nav and routes
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-64 flex-none min-h-full">
        <NavBar />
      </aside>

      <main className="flex-1 min-w-0 p-6 page-content-bg">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <ProtectedRoute>
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
