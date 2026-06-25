// src/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./HeaderSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-dvh bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto bg-white p-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
