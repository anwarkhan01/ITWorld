import React from "react";
import {X} from "lucide-react";
import {getStatusColor} from "../utils/api";

const OrderModal = ({selectedOrder, setSelectedOrder, updateOrderStatus}) => {
  if (!selectedOrder) return null;

  const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">Order Details</h3>
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium">{selectedOrder.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{selectedOrder?.useremail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-medium">
                ${selectedOrder.productData?.totalPrice?.toFixed(2) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <span
                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {ORDER_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    updateOrderStatus(selectedOrder.orderId, status)
                  }
                  className={`px-4 py-2 rounded-lg capitalize ${
                    selectedOrder.status === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
