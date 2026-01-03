import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      let url;

      if (filters.search) {
        // Use the dedicated search endpoint
        url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/products/search-products?q=${encodeURIComponent(filters.search)}`;
      } else {
        // Default categorized fetch
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.subcategory)
          params.append("subcategory", filters.subcategory.trim());
        if (filters.brand) params.append("brand", filters.brand.trim());
        if (filters.minPrice) params.append("minPrice", filters.minPrice);
        if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

        url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/products/get-categorized-products${
          params.toString() ? `?${params.toString()}` : ""
        }`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

      const data = await res.json();
      if (data.success && data.data?.products) {
        setProducts(data.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductsByIds = useCallback(async (ids = []) => {
    console.log("ids", ids);
    if (ids.length === 0) return [];
    try {
      setLoading(true);
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/products/get-products-by-ids`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);

      const data = await res.json();
      console.log("product data", data.data);
      if (data.success && data?.data) {
        setProducts(data.data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filters = {};
    if (params.get("category")) filters.category = params.get("category");
    const subCat = params.get("subcategory") || params.get("subCategory");
    if (subCat) filters.subcategory = subCat;
    if (params.get("brand")) filters.brand = params.get("brand");
    if (params.get("minPrice")) filters.minPrice = params.get("minPrice");
    if (params.get("maxPrice")) filters.maxPrice = params.get("maxPrice");
    if (params.get("search")) {
      filters.search = params.get("search").trim();
    }
    if (Object.keys(filters).length > 0) fetchProducts(filters);
  }, [location.search, fetchProducts]);

  return (
    <ProductsContext.Provider
      value={{ products, loading, fetchProducts, getProductsByIds }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
