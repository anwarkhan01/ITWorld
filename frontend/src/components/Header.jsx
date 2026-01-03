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
  const avatarUrl =
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.displayName || user?.email || "User"
    )}&background=0F172BF2&color=FACC15&size=128`;

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------- Prevent body scroll when mobile menu open ---------- */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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
    setSearchQuery("");
    setIsOpen(false);
    setShowMobileSearch(false);
  };

  return (
    <>
      {/* Utility bar */}
      <div className="hidden md:block bg-slate-900/95 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-9 flex items-center justify-end gap-6 text-xs text-slate-400">
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
        className={`sticky top-0 z-50 transition-colors duration-300
    ${
      isScrolled
        ? "bg-white"
        : "bg-slate-900/95 shadow-none border-b border-slate-800"
    }
    backdrop-blur-sm
  `}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              onClick={() => {
                setIsOpen(false);
                setShowMobileSearch(false);
              }}
              className="flex items-center gap-2 md:gap-3 select-none shrink-0"
            >
              <img
                src="/IT_World_logo.png"
                alt=""
                aria-hidden="true"
                className="h-8 md:h-10 w-auto shrink-0"
              />
              <div
                className={`flex flex-col leading-tight ${
                  isScrolled ? "text-gray-800" : "text-slate-200"
                }`}
              >
                <span className="text-lg md:text-2xl font-black tracking-tight">
                  IT World
                </span>
                <span className="text-[10px] md:text-sm font-medium text-slate-400">
                  Computers
                </span>
              </div>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2 md:gap-6 shrink-0">
              {/* Desktop search */}
              <div className="hidden md:flex w-72">
                <div
                  className={`relative w-full rounded-full ${
                    isScrolled
                      ? "text-gray-800 bg-white"
                      : "text-slate-200 bg-slate-800/60"
                  }`}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    placeholder="Search products..."
                    className={`w-full px-4 py-2 pr-9 rounded-full border border-slate-700
                               focus:border-blue-500 focus:outline-none transition ${
                                 isScrolled
                                   ? "text-gray-800 bg-white"
                                   : "text-slate-200 bg-slate-800/60"
                               }`}
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-blue-400 transition"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Mobile search icon */}
              <button
                onClick={() => {
                  setShowMobileSearch((s) => !s);
                  setIsOpen(false);
                }}
                className="md:hidden p-2 text-slate-300 hover:text-blue-400 transition active:scale-95"
                aria-label="Search"
              >
                <Search
                  className={`w-5 h-5 ${
                    isScrolled ? "text-gray-800" : "text-gray-50"
                  }`}
                />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 hover:text-blue-400 transition active:scale-95"
                onClick={() => {
                  setIsOpen(false);
                  setShowMobileSearch(false);
                }}
              >
                <ShoppingCart
                  className={`w-5 h-5 md:w-6 md:h-6  ${
                    isScrolled ? "text-gray-800" : "text-white"
                  }`}
                />
                {cartItems.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1
                               flex items-center justify-center text-[10px] font-semibold
                               rounded-full bg-blue-500 text-white  "
                  >
                    {cartItems.length > 99 ? "99+" : cartItems.length}
                  </span>
                )}
              </Link>

              {/* Auth / Profile */}
              {!user ? (
                <Link
                  to="/auth/login"
                  className="p-2 hover:text-blue-400 transition active:scale-95"
                  onClick={() => {
                    setIsOpen(false);
                    setShowMobileSearch(false);
                  }}
                >
                  <User
                    className={`w-5 h-5 md:w-6 md:h-6 ${
                      isScrolled ? "text-gray-800" : "text-white"
                    }`}
                  />
                </Link>
              ) : (
                <Link
                  to="/profile"
                  title={user?.displayName || "Profile"}
                  className="transition active:scale-95"
                  onClick={() => {
                    setIsOpen(false);
                    setShowMobileSearch(false);
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt="User"
                    className="md:w-14 w-12 rounded-full object-cover p-2"
                  />
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className={`md:hidden p-2 hover:text-blue-400 transition active:scale-95 ${
                  isScrolled ? "text-gray-800" : "text-slate-300"
                }`}
                onClick={() => {
                  setIsOpen((o) => !o);
                  setShowMobileSearch(false);
                }}
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
              className="md:hidden px-4 pb-3 overflow-hidden"
            >
              <div
                className={`relative rounded-full ${
                  isScrolled
                    ? "bg-white text-gray-800"
                    : "bg-slate-800 text-slate-200 "
                }`}
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2.5 pr-10
                             rounded-full border border-slate-700 text-sm
                             focus:border-blue-500 focus:outline-none transition
                             placeholder:text-slate-500"
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:text-blue-400 transition"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {!hideCategoryBelt && (
        <div className="hidden md:block z-40 bg-slate-900 border-b border-slate-800">
          <CategoryBelt />
        </div>
      )}

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-16 right-0 bottom-0 w-[85%] max-w-sm
                         md:hidden bg-slate-900 border-l border-slate-800 
                         z-50 overflow-hidden shadow-2xl"
            >
              <div className="h-full overflow-y-auto overscroll-contain">
                <div className="px-4 space-y-6">
                  {/* Category belt in mobile menu */}
                  {!hideCategoryBelt && (
                    <div className="pt-4">
                      <CategoryBelt showDesktop={false} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
