import React, {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {BarChart3, Menu, Package, ShoppingCart, Users, X} from "lucide-react";
import {useSidebar} from "../contexts/SidebarContext";

const Sidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const {isExpanded, setIsExpanded, sidebarOpen, setSidebarOpen} = useSidebar();
  const location = useLocation();

  const navItems = [
    {path: "/dashboard", icon: BarChart3, label: "Dashboard"},
    {path: "/orders", icon: ShoppingCart, label: "Orders"},
    {path: "/products", icon: Package, label: "Products"},
    {path: "/users", icon: Users, label: "Users"},
  ];

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(false);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile, setSidebarOpen]);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    if (!isMobile) setIsExpanded(next);
  };

  const handleEnter = () => {
    if (!isMobile) setIsExpanded(true);
  };

  const handleLeave = () => {
    if (!isMobile && !sidebarOpen) setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-2xl border shadow-lg active:scale-95 transition"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white h-screen
          transition-all duration-300 shadow-xl
          ${
            isMobile
              ? `w-72 transform ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : `${isExpanded || sidebarOpen ? "w-64" : "w-20"}`
          }
        `}
      >
        {/* Header */}
        <div
          className={`flex items-center border-b border-white/10 h-16 px-4 transition-all
            ${
              isExpanded || sidebarOpen || isMobile
                ? "justify-between"
                : "justify-center"
            }
          `}
        >
          {(isExpanded || sidebarOpen || isMobile) && (
            <p className="text-lg font-semibold">ITWorld Admin</p>
          )}

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <Menu size={18} />
            </button>
          )}

          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-white/70 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-2 overflow-y-auto">
          {navItems.map(({path, icon: Icon, label}) => {
            const active = location.pathname.startsWith(path);

            return (
              <Link
                key={path}
                to={path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`
                  flex items-center rounded-xl transition-all duration-200 group
                  ${
                    isExpanded || sidebarOpen || isMobile
                      ? "px-4 py-3 gap-3"
                      : "px-3 py-3 justify-center"
                  }
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-white/70 hover:bg-white/10"
                  }
                `}
              >
                <Icon size={20} className="shrink-0" />
                {(isExpanded || sidebarOpen || isMobile) && (
                  <span className="whitespace-nowrap">{label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
