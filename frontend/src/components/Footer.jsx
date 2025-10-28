import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-4">
        {/* Brand / About */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">ITWorld</h2>
          <p className="text-sm leading-relaxed text-gray-400">
            Your trusted store for the latest electronics, gadgets, and
            accessories. Quality and innovation delivered to your door.
          </p>
        </div>

        {/* Shop Links */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Shop</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Laptops</li>
            <li className="hover:text-white cursor-pointer">Mobiles</li>
            <li className="hover:text-white cursor-pointer">Accessories</li>
            <li className="hover:text-white cursor-pointer">Gaming</li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Contact Us</li>
            <li className="hover:text-white cursor-pointer">FAQs</li>
            <li className="hover:text-white cursor-pointer">Warranty</li>
            <li className="hover:text-white cursor-pointer">
              Shipping & Returns
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-medium text-white mb-3">Stay Updated</h3>
          <p className="text-sm text-gray-400 mb-3">
            Subscribe to get updates on new arrivals and exclusive offers.
          </p>
          <form className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-l-md bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 rounded-r-md text-sm hover:bg-blue-700"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 mt-8">
        <p className="text-center text-gray-500 text-sm py-4">
          &copy; {new Date().getFullYear()} ITWorld. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
