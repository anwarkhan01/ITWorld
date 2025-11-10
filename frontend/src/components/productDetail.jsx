import {useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {ShoppingCart, CreditCard} from "lucide-react";
import {useProducts} from "../contexts/ProductsContext.jsx";
import {useCart} from "../contexts/CartContext.jsx";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext.jsx";

export default function ProductDetail() {
  const {products} = useProducts();
  const {user} = useAuth();
  const {id} = useParams();
  const {addToCart} = useCart();
  const navigate = useNavigate();
  const product = useMemo(
    () => products.find((p) => p.product_id === id),
    [id, products]
  );
  const [activeImg, setActiveImg] = useState(0);

  if (!product)
    return (
      <main className="flex justify-center items-center h-[60vh] text-lg font-semibold">
        Product not found
      </main>
    );

  const handleAddToCart = (productID) => {
    addToCart(productID);
    navigate("/cart");
  };
  const images = product.images?.length ? product.images : [product.image];

  const handleBuyNow = (productID) => {
    navigate("/checkout", {state: {buyNowItemId: productID}});
  };

  return (
    <main className="bg-background py-10">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT: Product Images */}
        <div className="flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm">
            <img
              src={
                images[activeImg] ||
                "https://placehold.co/600x400?text=Image+Not+Found"
              }
              alt={product.product_name}
              className="w-full object-contain max-h-[480px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />
            {product.category && (
              <span className="absolute top-4 left-4 bg-primary px-3 py-1 text-xs font-semibold text-black rounded-full bg-white shadow-md uppercase">
                {product.category}
              </span>
            )}
          </div>

          {/* Buttons below image */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#f0c14b] px-5 py-3 font-semibold text-black shadow hover:bg-[#e2b23a] transition cursor-pointer"
              onClick={() => handleAddToCart(product.product_id)}
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#fa8900] px-5 py-3 font-semibold text-white shadow hover:bg-[#e67e00] transition cursor-pointer"
              onClick={() => handleBuyNow(product.product_id)}
            >
              <CreditCard className="h-5 w-5" /> Buy Now
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 border rounded-lg overflow-hidden w-20 h-20 ${
                    i === activeImg ? "border-[#fa8900]" : "border-gray-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Product Details */}
        <div className="flex flex-col gap-6">
          {/* Name + Price */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {product.product_name}
            </h1>
            <div className="text-3xl font-bold text-green-700 mt-2">
              ₹{product.price}
            </div>
          </div>

          {/* Intro / Description */}
          {product.intro_description && (
            <p className="text-base text-muted-foreground leading-relaxed border-t border-gray-200 pt-4">
              {product.intro_description}
            </p>
          )}

          {/* Features */}
          {product.features?.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Key Features</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {product.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Warranty */}
          {product.warranty && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Warranty</h3>
              <p className="text-sm text-muted-foreground">
                {product.warranty}
              </p>
            </div>
          )}

          {/* Specs */}
          {product.specs && typeof product.specs === "object" && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Specifications</h3>
              <ul className="text-sm border border-gray-200 rounded-xl divide-y">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key} className="flex justify-between px-4 py-2">
                    <span className="font-medium text-muted-foreground">
                      {key}
                    </span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
