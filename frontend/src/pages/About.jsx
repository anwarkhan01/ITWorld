import React from "react";
import { Phone } from "lucide-react";
const About = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <section className="bg-white ">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            About IT World
          </h1>
          <p className="mt-4 text-gray-600 max-w-3xl">
            IT World is a trusted destination for electronic products, offering
            reliable technology solutions for individuals, students,
            professionals, and businesses. We focus on genuine products,
            transparent guidance, and dependable support, so you can choose with
            confidence.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-12">
        {/* What We Do */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What We Do</h2>
          <p className="mt-3 text-gray-600 max-w-3xl">
            We specialize in the sale and consultation of electronic products,
            covering everyday computing to professional-grade setups. Our
            product range is curated to balance performance, durability, and
            long-term value.
          </p>

          <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
            <li>• Laptops & Desktops</li>
            <li>• Computer Accessories & Peripherals</li>
            <li>• Monitors, Storage & Networking Devices</li>
            <li>• Office & Business Electronics</li>
            <li>• Custom Configurations & System Builds</li>
          </ul>
        </div>

        {/* Our Approach */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Our Approach</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900">Honest Guidance</h3>
              <p className="mt-2 text-sm text-gray-600">
                We recommend products based on real needs, not upselling.
                Customers receive clear comparisons and practical advice.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900">Genuine Products</h3>
              <p className="mt-2 text-sm text-gray-600">
                All products are sourced from trusted distributors to ensure
                authenticity, warranty coverage, and peace of mind.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900">Reliable Support</h3>
              <p className="mt-2 text-sm text-gray-600">
                We assist before and after purchase—helping with setup,
                compatibility checks, and service coordination when needed.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Choose IT World
          </h2>

          <ul className="mt-4 space-y-3 text-gray-700 max-w-3xl">
            <li>• Clear, requirement-based recommendations</li>
            <li>• Focus on value, not unnecessary features</li>
            <li>• Support for students, professionals, and businesses</li>
            <li>• Transparent pricing and communication</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Get in Touch</h2>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Have questions or need help choosing the right product? Reach out to
            us—we are happy to assist.
          </p>

          <div className="mt-4 space-y-2 text-gray-700">
            <p className="flex items-center gap-2">
              <Phone size={16} />
              <a
                href="tel:+919665865056"
                className="text-blue-600 font-medium hover:underline"
              >
                +91 96658 65056
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
