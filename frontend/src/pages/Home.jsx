import React from "react";
import Hero from "../components/Hero.jsx";
import Categories from "../components/Categories.jsx";
import FeaturedProducts from "../components/FeaturedProducts.jsx";
import featuredProductsItems from "../data/products.js";
import {useProducts} from "../contexts/ProductsContext.jsx";

const Home = () => {
  const {products, loading} = useProducts();

  // console.log("products", products);
  return (
    <div className="bg-gray-100">
      <Hero />
      <Categories />
      <FeaturedProducts
        title="Featured Products"
        subtitle="Curated picks for India"
        items={products}
      />
    </div>
  );
};

export default Home;
