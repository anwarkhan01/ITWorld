import React from "react";
import {Cpu, Laptop, Monitor, Mouse, Keyboard, Zap} from "lucide-react";
import RevealSection from "./revealSection";
const categories = [
  {name: "GPU", icon: <Zap size={24} />},
  {name: "Laptop", icon: <Laptop size={24} />},
  {name: "Monitor", icon: <Monitor size={24} />},
  {name: "Mouse", icon: <Mouse size={24} />},
  {name: "Keyboard", icon: <Keyboard size={24} />},
  {name: "CPU", icon: <Cpu size={24} />},
];

const Categories = () => {
  return (
    <RevealSection className="bg-muted/30">
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
          <p className="text-gray-500 mb-10">
            Browse our extensive collection of premium electronics
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 justify-center">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="group flex flex-col items-center p-6 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-600 bg-white"
              >
                {/* Icon circle */}
                <div className="p-3 mb-2 rounded-full bg-gray-100 text-blue-600 transition-colors group-hover:text-white group-hover:bg-blue-600">
                  {cat.icon}
                </div>

                {/* Label */}
                <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-600">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
};

export default Categories;
