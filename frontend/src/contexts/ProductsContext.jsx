import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {useLocation} from "react-router-dom";

const ProductsContext = createContext();

export const ProductsProvider = ({children}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // 🔹 Centralized data fetcher
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.category) params.append("category", filters.category);

      if (filters.subcategory) {
        params.append("subcategory", filters.subcategory.trim());
      }

      if (filters.brand) params.append("brand", filters.brand.trim());
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

      const queryString = params.toString();

      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/products/get-categorized-products${
        queryString ? `?${queryString}` : ""
      }`;

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

  // 🔹 Auto-fetch when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filters = {};
    if (params.get("category")) filters.category = params.get("category");
    const subCat = params.get("subcategory") || params.get("subCategory");
    if (subCat) filters.subcategory = subCat;
    if (params.get("brand")) filters.brand = params.get("brand");
    if (params.get("minPrice")) filters.minPrice = params.get("minPrice");
    if (params.get("maxPrice")) filters.maxPrice = params.get("maxPrice");

    if (Object.keys(filters).length > 0) fetchProducts(filters);
  }, [location.search, fetchProducts]);

  return (
    <ProductsContext.Provider value={{products, loading, fetchProducts}}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
