import {Link} from "react-router-dom";
import ProductCard from "./ProductCardCompact.jsx";
import RevealSection from "./revealSection.jsx";

function FeaturedProducts({title = "Featured Products", subtitle, items = []}) {
  return (
    <RevealSection className="bg-muted/30">
      <section className="py-16 bg-gray-100 bg-muted/30 ">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {subtitle ? (
                <p className="text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>

            <Link to="/products">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                View All
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </RevealSection>
  );
}

export default FeaturedProducts;
