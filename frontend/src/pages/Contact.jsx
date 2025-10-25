import React, {useState} from "react";
import {Mail, Phone} from "lucide-react";

const stores = [
  {
    name: "Kolkata Store",
    address: "16/1 Ganesh Chandra Avenue, Kolkata-700013, West Bengal",
    phone: "+91 9836744490",
  },
  {
    name: "Bhubaneswar Store",
    address: "123 Bhubaneswar Rd, Odisha",
    phone: "+91 9876543210",
  },
  {
    name: "Jaipur Store",
    address: "456 Jaipur Street, Rajasthan",
    phone: "+91 9123456780",
  },
  {
    name: "Raipur Store",
    address: "789 Raipur Lane, Chhattisgarh",
    phone: "+91 9988776655",
  },
];

const universalPhone = "+91 3340550550";
const email = "info@ITWorld.in";

const Contact = () => {
  const [formData, setFormData] = useState({name: "", email: "", message: ""});

  const handleChange = (e) =>
    setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Message sent successfully!");
    setFormData({name: "", email: "", message: ""});
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      {/* Header Section */}
      <div className="text-center mb-12">
        {/* <p className="text-orange-500 font-medium">Contact With Us</p> */}
        <h1 className="text-4xl font-bold mt-2">Need a Guidance?</h1>
        <p className="text-gray-600 mt-2">
          We're Here to Help! Reach out with any questions or feedback.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact Form */}
        <div className="lg:w-1/2 bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
            Contact Form
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">E-Mail Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Enquiry</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border rounded px-3 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
            >
              Submit
            </button>
          </form>
        </div>

        {/* Contact Info & Stores */}
        <div className="lg:w-1/2 flex flex-col gap-6">
          {/* Email & Universal Phone */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded shadow">
              <span className="text-red-500 text-2xl">
                {" "}
                <Mail />
              </span>
              <div>
                <p className="font-medium">Our Email Address:</p>
                <p>{email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-100 p-4 rounded shadow">
              <span className="text-green-500 text-2xl">
                <Phone />
              </span>
              <div>
                <p className="font-medium">Contact Number:</p>
                <p>{universalPhone}</p>
              </div>
            </div>
          </div>

          {/* Stores */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
              Our Stores
            </h2>
            <ul className="space-y-4">
              {stores.map((store, idx) => (
                <li
                  key={idx}
                  className="p-4 border rounded hover:shadow-md transition"
                >
                  <h3 className="text-lg font-bold">{store.name}</h3>
                  <p className="text-gray-700">{store.address}</p>
                  <p className="text-gray-700">Ph: {store.phone}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
