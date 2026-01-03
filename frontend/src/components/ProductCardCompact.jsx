// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductCard({ product, onAdd }) {
  const price = product.priceINR ?? product.price;
  const mrp = product.mrp;
  const hasDiscount = mrp && mrp > price;
  const discountPercent = hasDiscount
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;
  const navigate = useNavigate();
  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-xl"
      onClick={() => navigate(`/product/${product.product_id}`)}
    >
      <Link to={`/product/${product.product_id}`}>
        <div className="relative aspect-square bg-white overflow-hidden flex items-center justify-center p-4">
          {hasDiscount && (
            <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              {discountPercent}% OFF
            </div>
          )}
          <img
            src={product.image}
            alt={product.product_name}
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
        </div>
      </Link>

      <div className="p-5 pt-0 space-y-2">
        <div className="space-y-1.5">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
            {product.category}
          </span>

          <Link to={`/product/${product.product_id}`}>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.product_name}
            </h3>
          </Link>
        </div>
        <div className="pt-2 space-y-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatINR(price)}
              </span>
              {hasDiscount && (
                <span className="text-base text-gray-400 line-through font-medium">
                  {formatINR(mrp)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-green-600 font-medium mt-1">
                You save {formatINR(mrp - price)}
              </p>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
