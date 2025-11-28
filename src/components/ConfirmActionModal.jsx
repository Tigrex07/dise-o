import React from "react";
import { AlertCircle } from "lucide-react";

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  actionButtonText,
  onConfirm,
  onCancel,
  data
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-900/60 p-4">
      <div className="bg-white rounded-2xl shadow-3xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="text-red-500 w-6 h-6" />
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
            >
              {actionButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}