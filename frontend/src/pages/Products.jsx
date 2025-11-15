import {useMemo, useState, useEffect} from "react";
import {Frown, SlidersHorizontal, X, ArrowUpDown} from "lucide-react";
import ProductCardAction from "../components/ProductCardAction.jsx";
import SidebarFilter from "../components/SideBarFilter.jsx";
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
  const [showSort, setShowSort] = useState(false);
  const [categoryMaxPrice, setCategoryMaxPrice] = useState(500000);

  const {addToCart} = useCart();
  const {products, loading} = useProducts();
  const navigate = useNavigate();

  const category = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const search = searchParams.get("search");

  const isSearchMode = Boolean(search);
  const isCategoryMode = Boolean(category);

  const [allAvailableBrands, setAllAvailableBrands] = useState([]);
  const [derivedCategories, setDerivedCategories] = useState([]);

  // Sync query params
  useEffect(() => {
    setQuery(search || "");
    if (brandParam) {
      setSelectedBrands(
        brandParam
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean)
      );
    } else setSelectedBrands([]);
  }, [search, brandParam, searchParams]);

  // Compute filters
  useEffect(() => {
    const computeDynamicFilters = async () => {
      try {
        if (isCategoryMode && category) {
          const res = await fetch(
            `${
              import.meta.env.VITE_BACKEND_URL
            }/api/products/get-categorized-products?category=${category}`
          );
          const data = await res.json();
          const prods = data?.data?.products || [];
          const brands = [
            ...new Set(prods.map((p) => p.brand).filter(Boolean)),
          ];
          const maxPrice = Math.max(...prods.map((p) => p.price || 0));
          setAllAvailableBrands(brands.sort());
          setCategoryMaxPrice(maxPrice || 500000);
          setDerivedCategories([category]);
        } else if (isSearchMode && products.length > 0) {
          const categories = [...new Set(products.map((p) => p.category))];
          const brands = [
            ...new Set(products.map((p) => p.brand).filter(Boolean)),
          ];
          const maxPrice = Math.max(...products.map((p) => p.price || 0));
          setAllAvailableBrands(brands.sort());
          setCategoryMaxPrice(maxPrice || 500000);
          setDerivedCategories(categories.sort());
        }
      } catch (err) {
        console.error("Error computing filters:", err);
      }
    };
    computeDynamicFilters();
  }, [category, products, isSearchMode, isCategoryMode]);

  const handlePriceChange = (newMax) => {
    const val = parseInt(newMax);
    setPriceRange([0, val]);
    const params = new URLSearchParams(searchParams);
    params.set("maxPrice", val);
    setSearchParams(params);
  };

  const handleBrandToggle = (brand) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    const params = new URLSearchParams(searchParams);
    newBrands.length
      ? params.set("brand", newBrands.join(","))
      : params.delete("brand");
    navigate(`/products?${params.toString()}`, {replace: true});
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, categoryMaxPrice]);
    setSortBy("default");
    const params = new URLSearchParams(searchParams);
    ["brand", "minPrice", "maxPrice"].forEach((k) => params.delete(k));
    setSearchParams(params);
  };

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (selectedBrands.length)
      f = f.filter((p) => selectedBrands.includes(p.brand || ""));
    f = f.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );
    if (sortBy === "price-low") f.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") f.sort((a, b) => b.price - a.price);
    if (sortBy === "name")
      f.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    return f;
  }, [products, selectedBrands, priceRange, sortBy]);

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading products...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {isSearchMode
                ? `Search: “${decodeURIComponent(search)}”`
                : category || "Products"}
            </h1>
            {isSearchMode && derivedCategories.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {derivedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      navigate(`/products?category=${encodeURIComponent(cat)}`)
                    }
                    className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-blue-100 hover:text-blue-700"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toolbar (mobile) */}
          <div className="flex lg:hidden gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setShowSort(true)}
              className="p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-100"
            >
              <ArrowUpDown className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <SidebarFilter
              selectedBrands={selectedBrands}
              onBrandToggle={handleBrandToggle}
              onClear={clearFilters}
              availableBrands={allAvailableBrands}
              derivedCategories={derivedCategories}
              priceRange={priceRange}
              maxPrice={categoryMaxPrice}
              onPriceChange={handlePriceChange}
              formatINR={formatINR}
            />
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            <div className="mb-4 hidden lg:flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="default">Sort</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
            </div>

            {filteredProducts.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <ProductCardAction
                    key={p.product_id}
                    product={p}
                    onAdd={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-14 text-center">
                <Frown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">
                  No products found. Try adjusting filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filter Drawer (mobile) */}
      {showFilters && (
        <>
          <div
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 backdrop-blur-[1px] bg-opacity-40 z-40"
          />
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85%] bg-white shadow-xl z-50 animate-slideInLeft">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
              <SidebarFilter
                selectedBrands={selectedBrands}
                onBrandToggle={handleBrandToggle}
                onClear={clearFilters}
                availableBrands={allAvailableBrands}
                derivedCategories={derivedCategories}
                priceRange={priceRange}
                maxPrice={categoryMaxPrice}
                onPriceChange={handlePriceChange}
                formatINR={formatINR}
              />
            </div>
          </div>
        </>
      )}

      {/* Sort Drawer (mobile) */}
      {showSort && (
        <>
          <div
            onClick={() => setShowSort(false)}
            className="fixed inset-0 backdrop-blur-[1px] bg-opacity-40 z-40"
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl p-5 shadow-lg animate-slideUp">
            <h3 className="text-lg font-semibold mb-3">Sort By</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              {[
                {label: "Default", value: "default"},
                {label: "Price: Low → High", value: "price-low"},
                {label: "Price: High → Low", value: "price-high"},
                {label: "Name: A → Z", value: "name"},
              ].map(({label, value}) => (
                <li
                  key={value}
                  onClick={() => {
                    setSortBy(value);
                    setShowSort(false);
                  }}
                  className={`p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                    sortBy === value ? "bg-blue-50 text-blue-700" : ""
                  }`}
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}
