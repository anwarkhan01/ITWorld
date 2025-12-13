import React from "react";

const CancelOrderModal = ({open, onClose, onConfirm, reason, setReason}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-1px flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Cancel Order
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Please provide a reason for cancelling this order.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (required)"
          className="w-full border rounded px-3 py-2 h-24 resize-none mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800"
          >
            Close
          </button>

          <button
            disabled={!reason.trim()}
            onClick={onConfirm}
            className={`px-4 py-2 rounded text-white ${
              reason.trim()
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
