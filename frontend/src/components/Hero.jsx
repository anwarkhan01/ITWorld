import React, {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

const heroImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const length = heroImages.length;

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="relative w-full min-h-[calc(100dvh-64px)] md:min-h-[calc(100dvh-112.8px)] overflow-hidden">
      {heroImages.map((img, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={img}
            alt={`hero-${index}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Arrows */}
      <button
        className="absolute top-1/2 left-4 hidden lg:block transform -translate-y-1/2 text-gray-200 bg-opacity-30 p-2 rounded-full z-20 hover:bg-opacity-50 transition"
        onClick={prevSlide}
      >
        <ChevronLeft size={50} />
      </button>
      <button
        className="absolute top-1/2 right-4 hidden lg:block transform -translate-y-1/2 text-gray-200 bg-opacity-30 p-2 rounded-full z-20 hover:bg-opacity-50 transition"
        onClick={nextSlide}
      >
        <ChevronRight size={50} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2  hidden lg:flex  transform -translate-x-1/2 gap-3 z-20">
        {heroImages.map((_, index) => (
          <div
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Hero;
