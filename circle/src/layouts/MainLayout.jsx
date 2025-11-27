import { Outlet } from "react-router-dom";
import NavBar from "../reusable-components/NavBar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-64 flex-none min-h-full">
        <NavBar />
      </aside>
      <main className="flex-1 min-w-0 p-6 page-content-bg">
        <Outlet />
      </main>
    </div>
  );
}
