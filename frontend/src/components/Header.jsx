import {useState, useRef, useEffect} from "react";
import {Link} from "react-router-dom";
import {useCart} from "../contexts/CartContext";
import {ShoppingCart, Menu, X} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {cartItems} = useCart();
  const {user} = useAuth();

  const mobileMenuRef = useRef(null);

  // Click outside to close mobile menu
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuRef]);

  return (
    <header className="relative bg-white shadow-sm h-16 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center text-lg font-bold tracking-wide"
        >
          <span className="text-blue-600">IT</span>
          <span className="text-gray-800">World</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
            Home
          </Link>
          <Link
            to="/products"
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Products
          </Link>

          {!user && (
            <Link
              to="/auth"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              SignUp
            </Link>
          )}

          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">Cart ({cartItems.length})</span>
          </Link>

          {user && (
            <Link
              to="/auth"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              <img
                src={user?.photoURL}
                alt={user?.displayName}
                className="rounded-full h-10 w-10"
              />
            </Link>
          )}
        </nav>

        {/* Mobile Buttons */}
        <div className="flex items-center space-x-4 md:hidden">
          {/* Mobile Cart */}
          <Link
            to="/cart"
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">{cartItems.length}</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="text-gray-700 hover:text-blue-600 focus:outline-none text-2xl"
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
          className="md:hidden absolute top-full left-0 w-full bg-white z-50 shadow-sm border-t border-gray-200"
        >
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              Products
            </Link>

            <Link
              to="/auth"
              className="text-gray-700 hover:text-blue-600 transition"
              onClick={() => setIsOpen(false)}
            >
              {user ? "Profile" : "SignUp"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
