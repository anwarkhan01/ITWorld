import {ShoppingCart} from "lucide-react";
import {Link} from "react-router-dom";
import {useState} from "react";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductCard({product, onAdd}) {
  return (
    <article className="group relative rounded-2xl bg-card shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col">
      {/* Image */}
      <Link
        to={`/product/${product.product_id}`}
        className="block relative w-full"
      >
        <div className="w-full overflow-hidden">
          <img
            src={product.image || "/placeholder.png"}
            alt={product.product_name}
            className={`w-full h-48 md:h-56 lg:h-64  object-contain transition-transform duration-500 group-hover:scale-110`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400?text=Image+Not+Found";
            }}
            loading="lazy"
          />
          {/* Category Tag */}
          {product.category && (
            <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-black bg-white uppercase shadow-md">
              {product.category}
            </span>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="text-[15px] font-bold text-foreground hover:text-blue-600 line-clamp-2">
            {product.product_name || "Unnamed Product"}
          </h3>
        </Link>

        {product.intro_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.intro_description}
          </p>
        )}

        {/* Price + Add to Cart */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">
            {formatINR(product.price)}
          </span>

          <button
            onClick={() => onAdd && onAdd(product)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors shadow-md cursor-pointer bg-yellow-500"
          >
            <ShoppingCart className="h-4 w-4 text-white" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
