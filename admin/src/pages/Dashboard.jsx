import React, {useEffect, useState} from "react";
import {BarChart3, Package, ShoppingCart, Users} from "lucide-react";
import StatCard from "../components/StatCard";
import {API_BASE, getStatusColor} from "../utils/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/dashboard/stats`);
        const data = await res.json();
        console.log(data);
        setStats(data?.data || null);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wide">
          Overview
        </p>
        <h1 className="text-3xl font-bold mt-1">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          color="bg-green-500"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toFixed(2) || 0}`}
          icon={BarChart3}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order.orderId}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-100 p-4"
              >
                <div className="truncate">
                  <p className="font-semibold truncate">{order.orderId}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {order?.useremail || "Unknown"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            ))}
            {!stats?.recentOrders?.length && (
              <p className="text-sm text-gray-500">No orders yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Orders by Status</h2>
          <div className="space-y-3">
            {stats?.ordersByStatus?.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <span className="font-medium capitalize">{item._id}</span>
                <span className="text-lg font-bold">{item.count}</span>
              </div>
            ))}
            {!stats?.ordersByStatus?.length && (
              <p className="text-sm text-gray-500">No data available.</p>
            )}
          </div>
        </div>
      </div>

      {stats?.lowStockProducts?.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-red-600">
              Low Stock Alert
            </h2>
            <p className="text-sm text-gray-500">
              Products below 10 units of inventory
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="rounded-2xl border border-red-100 bg-red-50 p-4"
              >
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-red-600">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
