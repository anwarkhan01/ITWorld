import React, {useEffect, useState, useCallback} from "react";
import {Edit, Search, Trash2, Upload} from "lucide-react";
import Pagination from "../components/Pagination";
import {API_BASE} from "../utils/api";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/products?page=${currentPage}&limit=20&search=${searchTerm}`
      );
      const data = await res.json();
      setProducts(data?.data?.products || []);
      setTotalPages(data?.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, fetchProducts]);

  // const handleSearch = () => {
  //   setCurrentPage(1);
  //   fetchProducts();
  // };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadProgress({status: "uploading", message: "Uploading..."});
    try {
      const res = await fetch(`${API_BASE}/products/bulk-upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      setUploadProgress({
        status: "success",
        message: `Uploaded ${data?.data?.successCount || 0} products`,
        errors: data?.data?.errors || [],
      });
      fetchProducts();
    } catch (err) {
      setUploadProgress({status: "error", message: err.message});
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`${API_BASE}/products/${productId}`, {method: "DELETE"});
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Catalog
          </p>
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 cursor-pointer">
          <Upload size={18} />
          <span>Upload Excel</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleBulkUpload}
          />
        </label>
      </div>

      {uploadProgress && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            uploadProgress.status === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : uploadProgress.status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          <p className="font-medium">{uploadProgress.message}</p>
          {uploadProgress.errors?.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-600">
                View {uploadProgress.errors.length} errors
              </summary>
              <div className="mt-1 space-y-1">
                {uploadProgress.errors.slice(0, 5).map((err, idx) => (
                  <p key={idx}>
                    Row {err.row}: {err.error}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={handleSearch}
          className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Search
        </button>
      </div> */}

      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Price</th>
              <th className="px-6 py-3 text-left">Stock</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-8">
                  <div className="flex justify-center">
                    <div className="h-8 w-8 border-b-2 border-gray-900 rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50/70">
                  <td className="px-6 py-4 font-semibold">
                    {product.product_name}
                  </td>
                  <td className="px-6 py-4">{product.category || "—"}</td>
                  <td className="px-6 py-4 font-medium">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        product.stock < 10 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="rounded-xl border border-gray-200 px-3 py-1.5 text-gray-600 hover:border-gray-300">
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default Products;
