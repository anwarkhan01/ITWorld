import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { CategoryBelt } from "./CategoryBelt.jsx";
import { ShoppingCart, Menu, X, User, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { cartItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  const hideCategoryBelt = ["/cart", "/checkout"].includes(location.pathname);

  /* ---------- Close mobile menu on outside click ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Toggle menu"]')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- Scroll state ---------- */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- Route change cleanup ---------- */
  useEffect(() => {
    setIsOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  /* ---------- Search ---------- */
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  return (
    <>
      {/* Utility bar */}
      <div className="bg-gray-900 border-b border-gray-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-9 flex items-center justify-end gap-6 text-xs text-gray-400">
          <Link to="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
          <Link to="/about" className="hover:text-blue-400 transition">
            About
          </Link>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300
          ${
            isScrolled
              ? "bg-gray-900/95 backdrop-blur shadow-md"
              : "bg-gray-900"
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex flex-col leading-none"
              onClick={() => {
                setIsOpen(false);
                setShowMobileSearch(false);
              }}
            >
              <div className="flex items-center gap-1 text-xl md:text-2xl font-black tracking-tight">
                <span className="text-blue-500">IT</span>
                <span className="text-white">World</span>
              </div>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Desktop search */}
              <div className="hidden md:flex w-72">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    placeholder="Search products..."
                    className="w-full bg-gray-800/60 backdrop-blur text-sm text-gray-200
                               px-4 py-2 pr-9 rounded-full border border-gray-700
                               focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Mobile search icon */}
              <button
                onClick={() => setShowMobileSearch((s) => !s)}
                className="md:hidden text-gray-300 hover:text-blue-400"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative px-1 py-2">
                <ShoppingCart className="w-6 h-6 text-white" />
                {cartItems.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-5 min-w-5
                               px-1 text-xs flex items-center justify-center
                               rounded-full bg-blue-500 text-white"
                  >
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Auth / Profile */}
              {!user ? (
                <Link to="/auth/login" className="px-1 py-2">
                  <User className="w-6 h-6 text-white" />
                </Link>
              ) : (
                <Link to="/profile" title={user?.displayName || "Profile"}>
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent hover:ring-blue-400 transition"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden text-gray-300 hover:text-blue-400"
                onClick={() => setIsOpen((o) => !o)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden px-4 pb-3"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  placeholder="Search products..."
                  className="w-full bg-gray-800 text-gray-200 px-4 py-2 pr-10
                             rounded-full border border-gray-700 focus:border-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category belt */}
        {!hideCategoryBelt && (
          <CategoryBelt isScrolled={isScrolled} showMobile={false} />
        )}
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 w-full md:hidden bg-gray-900
                       border-t border-gray-800 z-40 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <CategoryBelt showDesktop={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
