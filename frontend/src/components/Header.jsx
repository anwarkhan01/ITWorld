import {useState} from "react";
import {Link} from "react-router-dom";
import {useCart} from "../contexts/CartContext";
import {ShoppingCart} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {cartItems} = useCart();

  return (
    <header className="relative bg-white shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-lg font-bold tracking-wide"
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
          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold">Cart ({cartItems.length})</span>
          </Link>
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
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white z-50 shadow-sm border-t border-gray-200">
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
