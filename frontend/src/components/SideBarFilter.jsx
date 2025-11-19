import {useState} from "react";
import {ChevronDown, X} from "lucide-react";

export default function SidebarFilter({
  selectedBrands,
  onBrandToggle,
  onClear,
  availableBrands,
  derivedCategories = [],
  priceRange,
  setPriceRange,
  maxPrice,
  onPriceChange,
  formatINR,
}) {
  const [showCategories, setShowCategories] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Selected Brand Chips */}
      {selectedBrands.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedBrands.map((brand) => (
            <span
              key={brand}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-medium"
            >
              {brand}
              <button
                onClick={() => onBrandToggle(brand)}
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Categories */}
      {derivedCategories.length > 0 && (
        <div className="border-t border-gray-200 pt-3 mt-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-1"
          >
            CATEGORIES
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showCategories ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCategories && (
            <ul className="pl-2 space-y-1 mt-1">
              {derivedCategories.map((cat) => (
                <li
                  key={cat}
                  className="text-sm text-gray-700 hover:text-blue-700 cursor-pointer"
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-3">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">BRAND</h3>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center cursor-pointer text-sm text-gray-700 hover:text-blue-700"
              >
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                  className="mr-2 accent-blue-600"
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="border-t border-gray-200 pt-4 mt-3">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">PRICE</h3>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>{formatINR(priceRange[0])}</span>
          <span>{formatINR(priceRange[1])}</span>
        </div>

        <input
          type="range"
          min="0"
          max={maxPrice}
          step="1000"
          value={priceRange[1]}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10) || 0;
            setPriceRange([0, value]);
            onPriceChange && onPriceChange(value);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
    </div>
  );
}
