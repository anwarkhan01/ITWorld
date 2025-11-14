import React from "react";
import Hero from "../components/Hero.jsx";
import Categories from "../components/Categories.jsx";
import FeaturedProducts from "../components/FeaturedProducts.jsx";
import {useProducts} from "../contexts/ProductsContext.jsx";
import CategoriesBelt from "../components/CategoriesBelt.jsx";
import Highlights from "../components/Highlights.jsx";

const Home = () => {
  const {products, loading} = useProducts();

  return (
    <div className="bg-gray-100">
      <Hero />
      {/* <Categories /> */}
      <Highlights />
      <FeaturedProducts
        title="Featured Products"
        subtitle="Curated picks for India"
        items={products}
      />
    </div>
  );
};

export default Home;
