import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const heroImages = [
  "./HeroImages/Hero1.png",
  "./HeroImages/Hero2.png",
  "./HeroImages/Hero3.png",
  "./HeroImages/Hero4.png",
  "./HeroImages/Hero5.png",
];

const heroSlides = [
  {
    img: "./HeroImages/Hero1.png",
    link: "/product/acer-processor-graphics-win11home-al15g-53",
  },
  {
    img: "./HeroImages/Hero2.png",
    link: "/product/acer-aspire-lite-al15-52h-un-347si-00v-laptop",
  },
  {
    img: "./HeroImages/Hero3.png",
    link: "/product/acer-i3-1305u-premium-windows-al15-53",
  },
  {
    img: "./HeroImages/Hero4.png",
    link: "/product/acer-nitro-v-amd-ryzen-5-hexa-core-6600h-16-gb-512-gb-ssd",
  },
  {
    img: "./HeroImages/Hero5.png",
    link: "/products?category=Laptop",
  },
];
const Hero = () => {
  const [current, setCurrent] = useState(0);
  const length = heroSlides.length;
  const navigate = useNavigate();
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
    }, 4000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div className="relative w-full overflow-hidden aspect-video lg:aspect-auto lg:h-[calc(100dvh-190px)]">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <img
            key={index}
            src={slide.img}
            alt={`hero-${index}`}
            draggable={false}
            onClick={() => navigate(slide.link)}
            className={`
              absolute inset-0 w-full h-full object-fill
              transition-opacity duration-700 cursor-pointer
              ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}
            `}
          />
        ))}
      </div>

      {/* Arrows (tablet + up) */}
      <button
        onClick={prevSlide}
        className="
      absolute left-3 top-1/2 -translate-y-1/2
       md:flex
      z-20
      h-10 w-10 md:h-12 md:w-12
      items-center justify-center
      rounded-full
      text-white
      hover:bg-black/20
      transition
    "
      >
        <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
      </button>

      <button
        onClick={nextSlide}
        className="
      absolute right-3 top-1/2 -translate-y-1/2
       md:flex
      z-20
      h-10 w-10 md:h-12 md:w-12
      items-center justify-center
      rounded-full
       text-white
      hover:bg-black/20
      transition
    "
      >
        <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
      </button>

      {/* Dots */}
      <div
        className="
      absolute bottom-3 md:bottom-5
      left-1/2 -translate-x-1/2
      z-20
      flex gap-2
    "
      >
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
          h-2.5 w-2.5 md:h-3 md:w-3
          rounded-full transition
          ${index === current ? "bg-white scale-110" : "bg-white/50"}
        `}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
