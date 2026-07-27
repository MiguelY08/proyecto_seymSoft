// src/layout/AdminLayout.jsx
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import Header from "./HeaderSidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateIsDesktop = () => setIsDesktop(mediaQuery.matches);

    updateIsDesktop();
    mediaQuery.addEventListener("change", updateIsDesktop);

    return () => {
      mediaQuery.removeEventListener("change", updateIsDesktop);
    };
  }, []);

  const isSidebarActuallyCollapsed = isDesktop && isSidebarCollapsed;

  const handleToggleSidebar = () => {
    if (isDesktop) {
      setIsSidebarCollapsed((current) => !current);
      return;
    }

    setIsSidebarOpen((current) => !current);
  };

  const handleExpandSidebar = () => {
    if (isDesktop) {
      setIsSidebarCollapsed(false);
    }
  };

  return (
    <div className="flex h-dvh bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isSidebarActuallyCollapsed}
        onExpandSidebar={handleExpandSidebar}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          isSidebarCollapsed={isSidebarActuallyCollapsed}
          isDesktop={isDesktop}
        />

        <main className="flex-1 overflow-y-auto bg-white p-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
