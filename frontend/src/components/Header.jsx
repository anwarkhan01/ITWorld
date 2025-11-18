import {useState, useRef, useEffect} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useCart} from "../contexts/CartContext";
import {useAuth} from "../contexts/AuthContext";
import {CategoryBelt} from "./CategoryBelt.jsx";
import {ShoppingCart, Menu, X, User, Search} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const {cartItems} = useCart();
  const {user} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  // Check if we're on cart or checkout page
  const hideCategoryBelt = ["/cart", "/checkout"].includes(location.pathname);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, {passive: true});
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowMobileSearch(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setIsOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header className="bg-gray-900 text-gray-200 shadow-lg sticky w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center text-2xl font-extrabold tracking-tight hover:text-blue-400 transition-colors"
              onClick={() => {
                setIsOpen(false);
                setShowMobileSearch(false);
              }}
            >
              <span className="text-blue-400">IT</span>
              <span className="text-gray-100">World</span>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch(e);
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full bg-gray-800 text-gray-200 placeholder-gray-400 px-4 py-2 pr-10 rounded-full border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 p-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center md:gap-8 gap-3">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden text-gray-300 hover:text-blue-400 transition-colors"
                aria-label="Search"
              >
                <Search className="w-6 h-6" />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="px-1 py-2 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart className="w-6 h-6" />
              </Link>

              {/* Auth/Profile */}
              {!user ? (
                <Link
                  to="/auth/login"
                  className="flex items-center px-1 py-2"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <Link
                  to="/profile"
                  title={user?.displayName || "Profile"}
                  onClick={() => setIsOpen(false)}
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user?.displayName || "User"}
                      className="h-7 w-7 md:h-9 md:w-9 rounded-full ring-2 ring-transparent hover:ring-blue-400 transition-all object-cover"
                    />
                  ) : (
                    <div className="flex items-center px-3 py-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-gray-300 hover:text-blue-400 focus:outline-none transition-colors"
                onClick={toggleMobileMenu}
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

        {/* Category Belt - Hidden on cart and checkout pages */}
        {!hideCategoryBelt && (
          <CategoryBelt isScrolled={isScrolled} showMobile={false} />
        )}
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}
            className="fixed top-16 w-full md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden z-40"
          >
            <div className="max-w-full px-4 py-3 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <CategoryBelt showDesktop={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
