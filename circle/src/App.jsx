import { Routes, Route } from "react-router-dom";
import NavBar from "./reusable-components/NavBar";
import Feed from "./features/Feed";
import Profile from "./features/Profile";
import Groups from "./features/Groups";
import Events from "./features/Events";
import "./App.css";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-64 flex-none">
        <NavBar />
      </aside>

      <main className="flex-1 min-w-0 p-6 bg-transparent">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </main>
    </div>
  );
}
