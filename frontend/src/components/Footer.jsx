import { useNavigate } from "react-router-dom";
import { Phone, Mail, Laptop, Monitor, Cpu, Headphones } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        {/* Brand / About */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">IT World</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Trusted store for electronic products. Genuine hardware, honest
            guidance, and reliable support.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li
              className="flex items-center gap-2 hover:text-white cursor-pointer"
              onClick={() => navigate("/category/laptops")}
            >
              <Laptop size={16} /> Laptops
            </li>
            <li
              className="flex items-center gap-2 hover:text-white cursor-pointer"
              onClick={() => navigate("/category/desktops")}
            >
              <Cpu size={16} /> Desktops
            </li>
            <li
              className="flex items-center gap-2 hover:text-white cursor-pointer"
              onClick={() => navigate("/category/monitors")}
            >
              <Monitor size={16} /> Monitors
            </li>
            <li
              className="flex items-center gap-2 hover:text-white cursor-pointer"
              onClick={() => navigate("/category/accessories")}
            >
              <Headphones size={16} /> Accessories
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li
              className="hover:text-white cursor-pointer"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </li>
            <li
              className="hover:text-white cursor-pointer"
              onClick={() => navigate("/about")}
            >
              About Us
            </li>
            <li className="hover:text-white cursor-pointer">Warranty</li>
            <li className="hover:text-white cursor-pointer">
              Shipping & Returns
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Get in Touch</h3>
          <p className="text-sm text-gray-400">
            Online payments are currently unavailable. Orders are confirmed
            manually.
          </p>

          <div className="mt-3 space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <Phone size={16} />
              <a href="tel:+919665865056" className="text-blue-400">
                +91 96658 65056
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <p className="text-center text-gray-500 text-sm py-4">
          © {new Date().getFullYear()} IT World. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
