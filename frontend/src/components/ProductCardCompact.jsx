// src/components/ProductCard.jsx
import { Link } from "react-router-dom";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductCard({ product }) {
  return (
    <div className="group bg-card bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg">
      <Link to={`/product/${product.product_id}`}>
        <div className="aspect-square bg-linear-to-br from-muted to-muted/50 overflow-hidden">
          <img
            src={product.image}
            alt={product.product_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />
        </div>
      </Link>

      <div className="p-4 space-y-2">
        <div className="space-y-1">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {product.category}
          </span>

          <Link to={`/product/${product.product_id}`}>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {product.product_name}
            </h3>
          </Link>
        </div>

        {/* 1–2 line intro */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.intro_description}
        </p>

        <div className="pt-2">
          <span className="text-xl font-bold text-foreground">
            {formatINR(product.priceINR ?? product.price)}
          </span>
        </div>
      </div>
    </div>
  );
}
