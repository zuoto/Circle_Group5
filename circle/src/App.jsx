import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import Feed from "./features/feed.jsx";
import Profile from "./features/Profile";
import Groups from "./features/Groups";
import GroupDetail from "./features/GroupDetail";
import Events from "./features/Events";
import EventDetail from "./features/EventDetail.jsx";
import LogIn from "./features/LogIn";
import Register from "./features/Register";
import ProtectedRoute from "./auth/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import SearchPage from "./features/SearchPage";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Feed />} />
          <Route path="profile/:userId?" element={<Profile />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:groupId" element={<GroupDetail />} />
          <Route path="events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          <Route path="search" element={<SearchPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
