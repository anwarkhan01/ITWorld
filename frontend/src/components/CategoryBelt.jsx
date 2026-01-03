import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Laptop,
  Computer,
  Tv,
  Keyboard,
  Package,
  Gamepad2,
  Backpack,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const CategoryBelt = ({
  isScrolled = false,
  showDesktop = true,
  showMobile = true,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [openMobileCategory, setOpenMobileCategory] = useState(null);

  const navigate = useNavigate();
  const categoryRefs = useRef({});
  const dropdownTimerRef = useRef(null);

  const handleCategoryMouseEnter = (name) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setHoveredCategory(name);
  };

  const handleCategoryMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
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
      brands.includes(value)
        ? params.set("brand", value)
        : params.set("subcategory", value);
    }

    setHoveredCategory(null);
    setOpenMobileCategory(null);
    navigate("/products?" + params.toString());
  };

  return (
    <>
      {/* ================= DESKTOP ================= */}
      {showDesktop && (
        <div
          className={`
      hidden md:block
      bg-gray-800
      transition-[max-height,opacity,transform] duration-200 ease-out
      ${
        isScrolled
          ? "max-h-0 opacity-0 -translate-y-1 pointer-events-none"
          : "max-h-20 opacity-100 translate-y-0"
      }
    `}
        >
          {/* inner wrapper prevents dropdown clipping */}
          <div>
            <div className="max-w-5xl mx-auto px-6 py-2 border-t border-gray-700">
              <div className="flex items-center justify-around overflow-x-auto scrollbar-hide">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.name}
                      ref={(el) => (categoryRefs.current[category.name] = el)}
                      onMouseEnter={() =>
                        handleCategoryMouseEnter(category.name)
                      }
                      onMouseLeave={handleCategoryMouseLeave}
                      className="relative"
                    >
                      <button
                        onClick={() => handleCategoryClick(category.name)}
                        className="flex items-center gap-1.5 px-3 py-1.5
                                   text-gray-300 hover:text-blue-400
                                   font-medium text-sm whitespace-nowrap"
                      >
                        <Icon className="w-4 h-4" />
                        {category.name}
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${
                            hoveredCategory === category.name
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {hoveredCategory === category.name && (
                        <div
                          className="fixed w-56 bg-white rounded-lg shadow-xl
                                     border border-gray-100 z-50"
                          style={{
                            top: "52.6px",
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
                            className="w-full px-4 py-2 text-left font-semibold
                                       text-gray-900 hover:bg-blue-50 hover:text-blue-600"
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
                              className="w-full px-4 py-2 text-left text-sm
                                         text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE ================= */}
      {showMobile && (
        <div className="md:hidden">
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
                    className="flex justify-between w-full px-4 py-3 text-gray-300 hover:text-blue-400"
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
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-gray-900 overflow-hidden"
                      >
                        <button
                          onClick={() => handleCategoryClick(cat.name)}
                          className="w-full px-6 py-2 text-left text-sm text-blue-400 hover:bg-gray-700"
                        >
                          All {cat.name}
                        </button>

                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleCategoryClick(cat.name, sub)}
                            className="w-full px-6 py-2 text-left text-sm
                                       text-gray-400 hover:text-blue-400 hover:bg-gray-700"
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
      )}
    </>
  );
};

export { CategoryBelt, categories };
