import { useNavigate } from "react-router-dom";

const Highlights = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full bg-white py-4 px-4 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1 */}
        <div
          className="relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
          onClick={() =>
            navigate("/product/acer-i3-1305u-premium-windows-al15-53")
          }
        >
          <img
            src="./HeroImages/banner1.png"
            alt="ASPIRE LITE 13"
            className="w-full h-48 md:h-64 object-fill"
          />
        </div>

        {/* Banner 2 */}
        <div
          className="relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
          onClick={() =>
            navigate(
              "/product/acer-nitro-lite-16-intel-core-i5-13th-gen-13420h-8-gb-512-gb-ssd-windows-11-home-6-graphics-nvidia-geforce-rtx-4050-nl16-71g-gaming-laptop"
            )
          }
        >
          <img
            src="./HeroImages/banner2.png"
            alt="ACER NITRO LITE 16"
            className="w-full h-48 md:h-64 object-fill"
          />
        </div>
      </div>
    </div>
  );
};

export default Highlights;
