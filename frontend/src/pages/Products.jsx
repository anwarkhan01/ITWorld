import {useMemo, useState} from "react";
import ProductCardAction from "../components/ProductCardAction";
import {useCart} from "../contexts/CartContext.jsx";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {useNavigate} from "react-router-dom";
const categories = [
  "All",
  "GPU",
  "CPU",
  "Laptop",
  "Keyboard",
  "Mouse",
  "Monitor",
];

export default function Products() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const {addToCart} = useCart();
  const {products, loading} = useProducts();
  const navigate = useNavigate();

  const productss = products;

  const list = useMemo(() => {
    let arr = productss;

    if (category !== "All") {
      arr = arr.filter((p) => p.category === category);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.intro && p.intro.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    return arr;
  }, [productss, category, query]);

  const handleAdd = (product) => {
    addToCart(product.product_id);
    navigate("/cart");
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              Curated selection for India.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full sm:w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            /> */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCardAction
              key={p.product_id}
              product={p}
              detailsTo={`/product/${p.product_id}`}
              onAdd={handleAdd}
            />
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-10 rounded-xl bg-card p-8 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">
              No results. Try changing filters or search.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
