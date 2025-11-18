import React, {useState, useEffect} from "react";
import {Outlet} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import {useSidebar} from "./contexts/SidebarContext";

const AdminRoot = () => {
  const [isMobile, setIsMobile] = useState(false);
  const {isExpanded, sidebarOpen} = useSidebar();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarExpanded = isExpanded || sidebarOpen;

  const mainClasses =
    "min-h-screen overflow-y-auto transition-all duration-300 flex-1 " +
    // desktop expanded
    (!isMobile && sidebarExpanded ? "lg:ml-[20%] lg:w-[80%] " : "") +
    // desktop collapsed
    (!isMobile && !sidebarExpanded ? "lg:ml-[5%] lg:w-[95%] " : "") +
    // mobile
    (isMobile ? "w-full " : "");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <Sidebar />

      <main className={mainClasses}>
        <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminRoot;
