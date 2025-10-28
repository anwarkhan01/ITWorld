import React, {useState, useRef, useEffect} from "react";
import {Menu, X, ChevronDown} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";

const categories = [
  {
    name: "Computers & Monitors",
    subcategories: [
      "Prebuilt PCs",
      "Custom PCs",
      "PC Cases",
      "Cooling Systems",
    ],
  },
  {
    name: "Laptops",
    subcategories: [
      "Gaming Laptops",
      "Business Laptops",
      "Ultrabooks",
      "MacBooks",
    ],
  },
  {
    name: "Accessories",
    subcategories: ["Keyboards", "Mouse", "Headsets", "Webcams"],
  },
  {
    name: "TV & AV",
    subcategories: ["OLED", "QLED", "Neo QLED", "LCD"],
  },
  {
    name: "Combos",
    subcategories: ["4-IN-1", "Keyboard + Mouse", "Streaming Kits"],
  },
  {
    name: "Gaming",
    subcategories: ["Consoles", "Controllers", "VR Headsets", "Accessories"],
  },
];

const CategoriesBelt = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setHoveredIndex(null);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="bg-white border-b border-gray-200 relative select-none"
    >
      {/* Desktop Menu */}
      <ul className="hidden lg:flex w-full h-12 items-center justify-center gap-6">
        {categories.map((cat, i) => (
          <li
            key={cat.name}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`relative px-2 py-2 text-sm font-medium transition-colors cursor-pointer
              ${
                hoveredIndex === i
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-blue-600"
              }`}
          >
            {cat.name}
            <AnimatePresence>
              {hoveredIndex === i && (
                <motion.div
                  initial={{opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: 8}}
                  transition={{duration: 0.15}}
                  className="absolute top-full mt-1 z-50 w-48 bg-white shadow-lg border border-gray-100 rounded-md p-2"
                >
                  <ul className="space-y-1">
                    {cat.subcategories.map((sub) => (
                      <li
                        key={sub}
                        className="px-2 py-1 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ul>

      {/* Mobile Hamburger */}
      <div className="lg:hidden flex items-center h-12 px-4 border-t border-gray-200">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{height: 0, opacity: 0}}
            animate={{height: "auto", opacity: 1}}
            exit={{height: 0, opacity: 0}}
            transition={{duration: 0.25}}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md z-40 overflow-hidden"
          >
            <ul className="flex flex-col divide-y divide-gray-100">
              {categories.map((cat, i) => (
                <details key={i} className="group">
                  <summary className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 text-gray-800 font-medium">
                    {cat.name}
                    <ChevronDown
                      size={18}
                      className="transition-transform group-open:rotate-180 text-gray-500"
                    />
                  </summary>
                  <ul className="pl-8 pb-3 space-y-1 bg-gray-50">
                    {cat.subcategories.map((sub, j) => (
                      <li
                        key={j}
                        className="px-2 py-1 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {sub}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesBelt;
