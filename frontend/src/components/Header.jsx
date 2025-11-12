import {useState, useRef, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useCart} from "../contexts/CartContext";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {
  ShoppingCart,
  Menu,
  X,
  LogIn,
  User,
  Cpu,
  Laptop,
  Computer,
  Tv,
  Keyboard,
  Package,
  Gamepad2,
  Backpack,
  Headphones,
  ChevronDown,
  Search,
} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import {motion, AnimatePresence} from "framer-motion";

const categories = [
  {
    name: "PC",
    icon: Computer,
    subcategories: ["Prebuilt PC", "Custom PC", "Branded PC"],
  },
  {
    name: "PC Components",
    icon: Cpu,
    subcategories: [
      "Processors",
      "CPUs",
      "GPUs",
      "SSDs",
      "HDDs",
      "Motherboards",
      "RAM",
      "Graphics Cards",
      "Power Supplies",
      "Storage Drives",
      "Cooling Solutions",
      "PC Cases",
    ],
  },
  {
    name: "Laptop",
    icon: Laptop,
    subcategories: [
      "HP",
      "Acer",
      "Asus",
      "Dell",
      "Lenovo",
      "Apple MacBook",
      "MSI",
    ],
  },
  {
    name: "TV",
    icon: Tv,
    subcategories: ["Samsung", "LG", "Sony", "Panasonic", "TCL", "MI"],
  },
  {
    name: "Combos",
    icon: Package,
    subcategories: [
      "Mouse + Keyboard",
      "Mouse + Keyboard + Mouse Pad",
      "Keyboard + Mouse + Headset",
      "Gaming Combo Set",
      "Office Combo Set",
      "Wireless Combo Set",
    ],
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    subcategories: [
      "Gaming Kit",
      "Gaming Laptop",
      "Gaming PC",
      "Controllers",
      "Gaming Keyboards",
      "Gaming Mouse",
      "Gaming Headsets",
      "Gaming Chairs",
      "Gaming Monitors",
    ],
  },
  {
    name: "Peripherals",
    icon: Keyboard,
    subcategories: [
      "Keyboards",
      "Mouse",
      "Headphones",
      "Monitors",
      "Webcams",
      "Speakers",
      "USB Hubs",
      "Cables & Adapters",
      "Storage Devices",
      "Printers",
    ],
  },
  {
    name: "Accessories",
    icon: Backpack,
    subcategories: [
      "Laptop Bags",
      "Cooling Pads",
      "Docking Stations",
      "Screen Protectors",
      "Mouse Pads",
      "Laptop Stands",
      "Laptop Covers",
    ],
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [openMobileCategory, setOpenMobileCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const {cartItems} = useCart();
  const {user} = useAuth();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);
  const categoryRefs = useRef({});
  const dropdownTimerRef = useRef(null);
  const {fetchProducts} = useProducts();

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
    setIsOpen(false);
    setShowCategories(false);
    setOpenMobileCategory(null);
    setShowMobileSearch(false);
  }, [navigate]);

  const handleCategoryMouseEnter = (categoryName) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setHoveredCategory(categoryName);
  };

  const handleCategoryMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  const handleCategoryClick = (category, value = null) => {
    const params = new URLSearchParams();
    params.set("category", category);

    const brands = [
      "HP",
      "Acer",
      "Asus",
      "Dell",
      "Lenovo",
      "MSI",
      "Apple MacBook",
      "LG",
      "Samsung",
      "Sony",
      "Panasonic",
      "TCL",
      "MI",
    ];

    if (value) {
      if (brands.includes(value)) {
        params.set("brand", value);
      } else {
        params.set("subcategory", value);
      }
    }

    setIsOpen(false);
    setOpenMobileCategory(null);
    setShowCategories(false);
    setHoveredCategory(null);

    navigate("/products?" + params.toString());
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      // setSearchQuery("");
      setShowMobileSearch(false);
      setIsOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="bg-gray-900 text-gray-200 shadow-lg sticky w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center text-2xl font-extrabold tracking-tight hover:text-blue-400 transition-colors"
            onClick={() => {
              setIsOpen(false);
              setShowCategories(false);
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
              className=" px-1 py-2  flex items-center"
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

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showMobileSearch && (
            <motion.div
              initial={{height: 0, opacity: 0}}
              animate={{height: "auto", opacity: 1}}
              exit={{height: 0, opacity: 0}}
              transition={{duration: 0.2}}
              className="md:hidden overflow-hidden pb-3"
            >
              <div>
                <div className="relative">
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
                    autoFocus
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-2 p-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop Categories */}
      <div className="bg-gray-800 border-t border-gray-700 hidden md:block relative">
        <div className="max-w-5xl mx-auto px-6 py-2">
          <div className="flex items-center justify-around overflow-x-auto scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  ref={(el) => (categoryRefs.current[category.name] = el)}
                  onMouseEnter={() => handleCategoryMouseEnter(category.name)}
                  onMouseLeave={handleCategoryMouseLeave}
                  className="relative group"
                >
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-300 hover:text-blue-400 font-medium text-sm whitespace-nowrap transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${
                        hoveredCategory === category.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {hoveredCategory === category.name && (
                      <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        transition={{duration: 0.15}}
                        className="fixed mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-60"
                        style={{
                          top:
                            categoryRefs.current[
                              category.name
                            ]?.getBoundingClientRect().bottom + 8 || 0,
                          left:
                            categoryRefs.current[
                              category.name
                            ]?.getBoundingClientRect().left || 0,
                        }}
                        onMouseEnter={() =>
                          handleCategoryMouseEnter(category.name)
                        }
                        onMouseLeave={handleCategoryMouseLeave}
                      >
                        <button
                          onClick={() => handleCategoryClick(category.name)}
                          className="w-full text-left px-4 py-2 font-semibold text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          All {category.name}
                        </button>
                        <div className="border-t border-gray-100" />
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() =>
                              handleCategoryClick(category.name, sub)
                            }
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {sub}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.2}}
            className="absolute w-full md:hidden bg-gray-900 border-t border-gray-800 overflow-hidden"
          >
            <div className="max-w-full px-4 py-3 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Categories directly in menu */}
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const open = openMobileCategory === cat.name;
                  return (
                    <div
                      key={cat.name}
                      className="border-b border-gray-700 last:border-b-0"
                    >
                      <button
                        onClick={() =>
                          setOpenMobileCategory(open ? null : cat.name)
                        }
                        className="flex justify-between w-full px-4 py-2 text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.name}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {open && (
                          <motion.div
                            initial={{height: 0, opacity: 0}}
                            animate={{height: "auto", opacity: 1}}
                            exit={{height: 0, opacity: 0}}
                            transition={{duration: 0.2}}
                            className="bg-gray-900"
                          >
                            <button
                              onClick={() => handleCategoryClick(cat.name)}
                              className="w-full text-left px-6 py-2 text-sm text-blue-400 hover:bg-gray-700 transition-colors"
                            >
                              All {cat.name}
                            </button>
                            {cat.subcategories.map((sub) => (
                              <button
                                key={sub}
                                onClick={() =>
                                  handleCategoryClick(cat.name, sub)
                                }
                                className="w-full text-left px-6 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                              >
                                {sub}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
