import { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useProducts } from "../contexts/ProductsContext.jsx";
import { useCart } from "../contexts/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductDetail() {
  const { products, loading, getProductsByIds } = useProducts();
  const { user } = useAuth();
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const product = useMemo(
    () => products.find((p) => p.product_id === id),
    [id, products]
  );
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!product && !loading) {
      getProductsByIds([id]);
    }
  }, [id, product, loading, getProductsByIds]);

  if (loading || !product) {
    return (
      <main className="flex justify-center items-center h-[60vh] text-lg font-semibold">
        {loading ? "Loading..." : "Product not found"}
      </main>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };

  const images = product.images?.length ? product.images : [product.image];

  const handleBuyNow = (productID) => {
    navigate("/checkout", { state: { buyNowItemId: productID } });
  };

  const price = product.priceINR ?? product.price;
  const mrp = product.mrp;
  const hasDiscount = mrp && mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;

  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* LEFT: Image and Buttons - Fixed on Desktop */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="relative rounded-lg overflow-hidden bg-gray-50 p-6 lg:p-8">
                {hasDiscount && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
                    {discountPercent}% OFF
                  </span>
                )}
                <img
                  src={
                    images[activeImg] ||
                    "https://placehold.co/600x400?text=Image+Not+Found"
                  }
                  alt={product.product_name}
                  className="w-full object-contain h-64 sm:h-80 lg:h-96"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400?text=Image+Not+Found";
                  }}
                />
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`shrink-0 border rounded-lg overflow-hidden w-16 h-16 sm:w-20 sm:h-20 transition ${
                        i === activeImg
                          ? "border-blue-600 border-2"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-6 py-3 font-semibold text-white transition shadow-sm hover:shadow"
                  onClick={() => handleAddToCart(product)}
                >
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-red-700 px-6 py-3 font-semibold text-white transition shadow-sm hover:shadow"
                  onClick={() => handleBuyNow(product.product_id)}
                >
                  <CreditCard className="h-5 w-5" /> Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <div>
              <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2">
                {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.product_name}
              </h1>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {formatINR(price)}
                </span>
                {hasDiscount && (
                  <span className="text-base sm:text-lg text-gray-400 line-through">
                    {formatINR(mrp)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save {formatINR(mrp - price)}
                </p>
              )}
            </div>

            {/* Description */}
            {product.intro_description && (
              <div className="pt-4 border-t">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {product.intro_description}
                </p>
              </div>
            )}

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-base sm:text-lg mb-3">
                  Key Features
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warranty */}
            {product.warranty && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-base sm:text-lg mb-2">
                  Warranty
                </h3>
                <p className="text-sm text-gray-600">{product.warranty}</p>
              </div>
            )}

            {/* Specs */}
            {product.specs && typeof product.specs === "object" && (
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-base sm:text-lg mb-3">
                  Specifications
                </h3>
                <div className="space-y-2">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm py-2 border-b last:border-b-0"
                    >
                      <span className="text-gray-600">{key}</span>
                      <span className="font-medium text-gray-900 text-right">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
