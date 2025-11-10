import {useMemo, useState, useEffect} from "react";
import {X, SlidersHorizontal, Frown} from "lucide-react";
import ProductCardAction from "../components/ProductCardAction";
import {useCart} from "../contexts/CartContext.jsx";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {useNavigate, useSearchParams} from "react-router-dom";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryMaxPrice, setCategoryMaxPrice] = useState(500000);

  const {addToCart} = useCart();
  const {products, loading} = useProducts();
  const navigate = useNavigate();

  const category = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const search = searchParams.get("search");

  // Sync state with URL
  useEffect(() => {
    setQuery(search || "");
    if (brandParam) {
      const brandsArray = brandParam
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      setSelectedBrands(brandsArray);
    } else {
      setSelectedBrands([]);
    }

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 500000,
      ]);
    }
  }, [search, brandParam, searchParams]);

  const selectedCategory = category || "Unknown Category";

  const [allAvailableBrands, setAllAvailableBrands] = useState([]);

  // Fetch all brands for selected category
  useEffect(() => {
    const fetchAllBrands = async () => {
      if (!category) return;

      try {
        const params = new URLSearchParams();
        params.append("category", category);

        const url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/products/get-categorized-products?${params.toString()}`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.products) {
            const brandSet = new Set(
              data.data.products.map((p) => p.brand).filter(Boolean)
            );
            setAllAvailableBrands(Array.from(brandSet).sort());

            // Calculate category max price
            const maxPrice = Math.max(
              ...data.data.products.map((p) => p.price || 0)
            );
            setCategoryMaxPrice(maxPrice);
          }
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    fetchAllBrands();
  }, [category]);

  const availableBrands = allAvailableBrands;

  const handlePriceChange = (newMaxPrice) => {
    const newPriceRange = [0, parseInt(newMaxPrice)];
    setPriceRange(newPriceRange);

    const params = new URLSearchParams(searchParams);
    params.set("minPrice", "0");
    params.set("maxPrice", newMaxPrice.toString());

    setSearchParams(params);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.product_name && p.product_name.toLowerCase().includes(q)) ||
          (p.intro_description &&
            p.intro_description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Price filter
    filtered = filtered.filter((p) => {
      const price = p.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name") {
      filtered.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    }

    return filtered;
  }, [products, priceRange, query, sortBy]);

  // --- Handle brand toggle ---
  const handleBrandToggle = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];

    const params = new URLSearchParams(searchParams);

    if (newBrands.length > 0) {
      params.set("brand", newBrands.join(","));
    } else {
      params.delete("brand");
    }

    navigate(`/products?${params.toString().replace(/%2C/g, ",")}`, {
      replace: true,
    });
  };

  // --- Clear all filters ---
  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, categoryMaxPrice]);
    setQuery("");
    setSortBy("default");

    const params = new URLSearchParams(searchParams);
    params.delete("brand");
    params.delete("search");
    params.delete("minPrice");
    params.delete("maxPrice");
    setSearchParams(params);
  };

  const handleAddToCart = (product) => {
    addToCart(product.product_id);
    navigate("/cart");
  };

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-6 pb-12">
      <section className="container mx-auto px-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {selectedCategory}
          </h1>
        </div>

        <div className="mb-6 mt-3 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 overflow-y-auto">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-72 space-y-4 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                {(selectedBrands.length > 0 ||
                  priceRange[1] < categoryMaxPrice ||
                  query) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-900 mb-3">
                    Brands ({selectedBrands.length} selected)
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {availableBrands.map((brand) => (
                      <label
                        key={brand}
                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                          className="mr-3 text-blue-600 focus:ring-blue-500 rounded w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                          {brand}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="border-t pt-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">
                  Price Range
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max={categoryMaxPrice}
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-sm font-semibold text-gray-700">
                    <span>{formatINR(priceRange[0])}</span>
                    <span>{formatINR(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedBrands.length > 0 || query) && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-sm text-gray-900 mb-3">
                  Active Filters
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedBrands.map((brand) => (
                    <span
                      key={brand}
                      className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold"
                    >
                      {brand}
                      <button
                        onClick={() => handleBrandToggle(brand)}
                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl shadow-sm p-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCardAction
                    key={product.product_id}
                    product={product}
                    onAdd={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Frown className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-500 mb-8">
                    We couldn't find any products matching your filters. Try
                    adjusting your filters or clear all.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
