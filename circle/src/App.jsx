import { Routes, Route } from "react-router-dom";
import NavBar from "./reusable-components/NavBar";
import Feed from "./features/Feed";
import Profile from "./features/Profile";
import Groups from "./features/Groups";
import GroupDetail from "./features/GroupDetail";
import Events from "./features/Events";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-64 flex-none min-h-full">
        <NavBar />
      </aside>

      <main className="flex-1 min-w-0 p-6 page-content-bg">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
    </div>
  );
}
