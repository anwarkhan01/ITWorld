import React, { useState } from "react";
import { ChevronDown, Phone, Mail, MapPin } from "lucide-react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const stores = [
    {
      name: "Vasai Store 1",
      address:
        "Shop No. 21, Golden Park, Behind Parvati Theater, Station Road, Vasai (West), Palghar - 401 202",
      phone: "+91 7558459949 / +91 9665865056",
      email: "itworldvasai@gmail.com",
    },
    {
      name: "Bhayandar Store",
      address:
        "Shop No. 16, Ground Floor, Rasesh CHSL, 150 Feet Road, Opp. Maxus Mall, Bhayandar (W), Thane, Maharashtra - 401 101",
      phone: "+91 8928029259 / +91 8655125741",
      email: "acermallbhayandar@gmail.com",
    },
    {
      name: "Borivali Store",
      address:
        "Shop No. 3, Shantiniath CHS Ltd., CTS Road, Swami Vivekanand Road, Nr. Shimpoli, Borivali (W) - 400 092",
      phone: "+91 8007636786 / +91 8655125741",
      email: "itworldborivali@gmail.com",
    },
    {
      name: "Malad Store",
      address:
        "Shop No. 3, Ground Floor, Bhoomi Classic CHS Ltd., New Link Road, Opp. Jain Sub Kuch Restaurant, Malad, Sunder Nagar, Malad (W), Mumbai - 400064",
      phone: "+91 8010868456",
      email: "acermallmalad@gmail.com",
    },
    {
      name: "Santacruz Store 1",
      address:
        "Shop No. 18, Rizvi Building, Milan Subway Road, Rizvi Nagar, Khira Nagar, Santacruz (W), Mumbai, Maharashtra - 400054",
      phone: "+91 9967644867 / +91 7066318222",
      email: "acermallsantacruz@gmail.com",
    },
    {
      name: "Santacruz Store 2",
      address:
        "Shop No. 2, Rizvi Park, Swami Vivekananda Road, Rizvi Nagar, Khira Nagar, Santacruz (W), Mumbai - 400054",
      phone: "+91 9082610922",
      email: "asus.santacruz@gmail.com",
    },
    {
      name: "Virar Store",
      address:
        "Shop No. 8, Vinay Kutir Bldg., Bldg. No. 1, Tirupati Nagar, Phase 2, Nr. Vijay Sales, Virar (W) - 401303",
      phone: "+91 7378698969 / +91 8655125741",
      email: "acermallvirar@gmail.com",
    },
    {
      name: "Vasai Store 2",
      address:
        "Shop No. 2, Near KT Classess, Sai Baba Mandir, Sai Nagar, Vasai (W) - 401202",
      phone: "+91 7378698969 / +91 8655125741",
      email: "acermallvasai@gmail.com",
    },
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    emailjs
      .send(
        `${import.meta.env.VITE_EMAIL_SERVICE_ID}`,
        `${import.meta.env.VITE_EMAIL_TEMPLATE_ID}`,
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }`${import.meta.env.VITE_EMAIL_PUBLIC_KEY}`
      )
      .then(() => {
        alert("Message sent successfully!");
        setFormData({ name: "", email: "", message: "" });
      })
      .catch(() => {
        alert("Failed to send message");
      });
  };

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900">Need Guidance?</h1>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            We're here to help. Reach out with any questions or enquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm border p-8 self-start">
            <h2 className="text-2xl font-semibold mb-6">Contact Form</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Enquiry
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Right Side */}
          <div className="space-y-6">
            {/* Email & Phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-white border rounded-xl p-5 shadow-sm">
                <Mail className="text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">contact@ITWorld.in</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white border rounded-xl p-5 shadow-sm">
                <Phone className="text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">+91 3340550550</p>
                </div>
              </div>
            </div>

            {/* Stores */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-2xl font-semibold mb-5">Our Stores</h2>

              <div className="divide-y">
                {stores.map((store, idx) => (
                  <details key={idx} className="group py-3">
                    <summary className="flex justify-between items-center cursor-pointer list-none">
                      <h3 className="font-semibold text-lg">{store.name}</h3>

                      <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                    </summary>

                    <div className="mt-3 text-sm text-gray-700 space-y-2">
                      <p className="flex items-start gap-3">
                        <span className="w-5 h-5 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </span>
                        <span>{store.address}</span>
                      </p>

                      <p className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-500" />
                        </span>
                        <span>{store.phone}</span>
                      </p>

                      <p className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-gray-500" />
                        </span>
                        <span>{store.email}</span>
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
