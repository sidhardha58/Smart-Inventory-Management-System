"use client";

import React from "react";

interface Attribute {
  attributeName: string;
  value: string;
  price: number;
  inventory: number;
  tax: number;
  soldAs: string;
}

interface ProductDetailsModalProps {
  show: boolean;
  onClose: () => void;
  product: {
    name: string;
    image?: string | null;
    attributes: Attribute[];
  };
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  show,
  onClose,
  product,
}) => {
  if (!show) return null;

  const attr = product.attributes[0]; // assuming one variant for now

  const sellingPrice =
    attr?.price && attr.tax
      ? (attr.price * (1 + attr.tax / 100)).toFixed(2)
      : attr?.price?.toFixed(2);

  return (
    <div className="absolute right-50 top-20 z-50 bg-white border border-gray-300 rounded-lg shadow-lg w-[400px]">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-[#0077b6]">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-lg cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Product Info */}
        <div className="flex gap-4 items-center mb-3">
          <img
            src={product.image || "/images/image.png"}
            alt="Product"
            className="w-24 h-24 object-cover border rounded"
          />
          <div className="text-sm space-y-1">
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Sold As:</strong> {attr?.soldAs || "-"}
            </p>
            <p>
              <strong>{attr?.attributeName}:</strong> {attr?.value || "-"}
            </p>
            <p>
              <strong>Price:</strong> ₹{attr?.price}
            </p>
            <p>
              <strong>Tax:</strong> {attr?.tax}%
            </p>
            <p>
              <strong>Selling Price:</strong> ₹{sellingPrice}
            </p>
            <p>
              <strong>Inventory:</strong> {attr?.inventory}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-right">
          <button
            onClick={onClose}
            className="mt-2 bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
