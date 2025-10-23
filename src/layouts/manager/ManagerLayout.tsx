import { ManagerSidebar } from "./ManagerSidebar";
import { Outlet } from "react-router-dom";

export default function ManagerLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ManagerSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}
