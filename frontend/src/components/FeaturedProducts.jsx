import { Link } from "react-router-dom";
import ProductCard from "./ProductCardCompact.jsx";
import RevealSection from "./revealSection.jsx";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext.jsx";
import { useNavigate } from "react-router-dom";

function FeaturedProducts({
  title = "Featured Products",
  subtitle,
  items = [],
}) {
  const [producs, setProducts] = useState();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const handleAddToCart = (product) => {
    addToCart(product);
    navigate("/cart");
  };
  useEffect(() => {
    const getRadomProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/get-random-products`
        );
        const data = await response.json();
        console.log(data);
        setProducts(data.data.products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
    };

    getRadomProducts();
  }, []);
  return (
    <RevealSection className="bg-muted/30">
      <section className="py-16 bg-gray-100 bg-muted/30 ">
        <div className="container mx-auto px-4">
          {/* <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle ? (
                <p className="text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </div> */}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {producs &&
              producs.map((p) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  onAdd={handleAddToCart}
                />
              ))}
          </div>
        </div>
      </section>
    </RevealSection>
  );
}

export default FeaturedProducts;
