import {useState, useRef, useEffect} from "react";
import {Link, NavLink} from "react-router-dom";
import {useCart} from "../contexts/CartContext";
import {
  ShoppingCart,
  Menu,
  X,
  LogIn,
  User,
  Cpu,
  Home,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {cartItems} = useCart();
  const {user} = useAuth();
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative bg-gray-900 text-gray-200 shadow-md h-16 z-50">
      <div className="max-w-7xl mx-auto px-3 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-2xl font-extrabold tracking-tight hover:text-blue-400 transition-colors"
        >
          <span>
            <span className="text-blue-400">IT</span>
            <span className="text-gray-100">World</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <NavLink
            to="/"
            className={({isActive}) =>
              `group relative flex items-center gap-1 transition-colors ${
                isActive
                  ? "text-blue-400"
                  : "text-white-700 hover:text-blue-400"
              }`
            }
          >
            {({isActive}) => (
              <>
                <Home className="w-4 h-4" /> Home
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-blue-400 transition-all ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/products"
            className={({isActive}) =>
              `group relative flex items-center gap-1 transition-colors ${
                isActive
                  ? "text-blue-400"
                  : "text-white-700 hover:text-blue-400"
              }`
            }
          >
            {({isActive}) => (
              <>
                <ShoppingBag className="w-4 h-4" /> Products
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-blue-400 transition-all ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </>
            )}
          </NavLink>

          {/* <NavLink
            to="/contact"
            className={({isActive}) =>
              `group relative flex items-center gap-1 transition-colors ${
                isActive
                  ? "text-blue-400"
                  : "text-white-700 hover:text-blue-400"
              }`
            }
          >
            {({isActive}) => (
              <>
                <MessageSquare className="w-4 h-4" /> Contact
                <span
                  className={`absolute left-0 -bottom-1 h-0.5 bg-blue-400 transition-all ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </>
            )}
          </NavLink> */}
          <span className="flex items-center gap-4">
            <Link
              to="/cart"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold
            shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{cartItems.length}</span>
            </Link>

            {!user && (
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold 
            text-blue-400 border border-blue-400 rounded-full
            hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 transition-all"
              >
                <LogIn size={16} strokeWidth={2} />
                <span>Login</span>
              </Link>
            )}
          </span>

          {user && (
            <Link
              to="/profile"
              className="flex items-center justify-center"
              title={user?.displayName}
            >
              <img
                src={user?.photoURL}
                alt={user?.displayName}
                className="rounded-full h-10 w-10 ring-2 ring-transparent hover:ring-blue-400 transition-all"
              />
            </Link>
          )}
        </nav>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            to="/cart"
            className="flex items-center px-2.5 py-1.5 text-white"
          >
            <ShoppingCart className="h-6 w-6" />
          </Link>

          <Link
            to="/profile"
            className="flex items-center px-2.5 py-1.5 rounded-lg text-white hover:bg-blue-700 transition"
          >
            <User className="h-6 w-6" />
          </Link>

          <button
            className="text-gray-300 hover:text-blue-400 focus:outline-none text-2xl p-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden absolute top-full left-0 w-full bg-gray-900 z-50 border-t border-gray-800 shadow-md"
        >
          <div className="flex flex-col px-4 py-3 space-y-3 text-gray-200">
            <Link
              to="/"
              className="flex items-center gap-2 hover:text-blue-400 transition"
              onClick={() => setIsOpen(false)}
            >
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link
              to="/products"
              className="flex items-center gap-2 hover:text-blue-400 transition"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" /> Products
            </Link>
            {/* <Link
              to="/contact"
              className="flex items-center gap-2 hover:text-blue-400 transition"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="w-4 h-4" /> Contact
            </Link> */}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
