// src/layout/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./Header";

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar /> 

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-8 overflow-y-auto bg-white ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
