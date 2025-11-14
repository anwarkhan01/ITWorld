import React from "react";

const Highlights = () => {
  return (
    <div className="w-full bg-white py-4 px-4 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1 */}
        <div className="relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-300">
          <img
            src="https://dummyimage.com/800x400/000/fff&text=MSI+MAG+274QRFW"
            alt="MSI MAG 274QRFW"
            className="w-full h-48 md:h-64 object-cover"
          />
        </div>

        {/* Banner 2 */}
        <div className="relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-300">
          <img
            src="https://dummyimage.com/800x400/000/fff&text=ASUS+ROG+XG27ACS"
            alt="ASUS ROG XG27ACS"
            className="w-full h-48 md:h-64 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Highlights;
