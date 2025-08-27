"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Check, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function InventoryListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuantity, setEditedQuantity] = useState<number | null>(null);
  const itemsPerPage = 5;

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/dashboard/inventory");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQuantityEdit = (productId: string, quantity: number) => {
    setEditingId(productId);
    setEditedQuantity(quantity);
  };

  const handleQuantitySave = async (productId: string) => {
    try {
      await axios.patch(`/api/dashboard/inventory`, {
        productId,
        quantity: editedQuantity,
      });
      toast.success("Quantity updated");
      setEditingId(null);
      setEditedQuantity(null);
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 px-6 pt-2 pb-6">
        <div className="bg-white p-6 rounded shadow">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#0077b6]">Inventory</h3>
          </div>

          {/* Search */}
          <div className="mb-4 relative w-1/3">
            <input
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 px-3 py-2 rounded w-full pr-10"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
              size={18}
            />
          </div>

          {/* Count */}
          <p className="text-sm text-gray-600 mb-2">
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 && "s"} found
          </p>

          {/* Table */}
          <table className="w-full text-left border border-gray-200 rounded overflow-hidden table-fixed">
            <thead className="bg-[#0077b6] text-white">
              <tr>
                <th className="p-3 w-[60px]">#</th>
                <th className="p-3 w-[80px]">Image</th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    product.quantity <= 10 ? "bg-red-50" : ""
                  }`}
                >
                  <td className="p-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-3">
                    <img
                      src={product.image || "/images/image.png"}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  </td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">₹{product.price}</td>
                  <td className="p-3 font-medium">
                    {editingId === product._id ? (
                      <div className="flex items-start gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">
                            Stock Available *
                          </label>
                          <input
                            type="text"
                            name="quantity"
                            inputMode="numeric"
                            pattern="\d*"
                            value={editedQuantity ?? product.quantity}
                            onChange={(e) =>
                              setEditedQuantity(Number(e.target.value))
                            }
                            placeholder="Enter quantity"
                            className="w-24 border rounded px-2 py-1 text-sm leading-[1.5rem] focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                            style={{ minHeight: "32px" }}
                          />
                        </div>
                        <div className="flex gap-2 mt-6">
                          {/* ❌ Cancel */}
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditedQuantity(null);
                            }}
                            className="text-red-500 hover:text-red-700"
                            title="Cancel"
                          >
                            <X size={20} />
                          </button>
                          {/* ✔ Save */}
                          <button
                            onClick={() => handleQuantitySave(product._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            <Check size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer flex items-center justify-between group border border-gray-300 hover:border-gray-400 rounded px-2 py-1 transition"
                        onClick={() =>
                          handleQuantityEdit(product._id, product.quantity)
                        }
                        title="Click to edit"
                        style={{ minHeight: "32px" }}
                      >
                        <span>
                          {product.quantity}
                          {product.quantity <= 10 && (
                            <span className="ml-2 text-red-600 text-xs font-semibold">
                              Low Stock
                            </span>
                          )}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 ml-2 text-gray-400 group-hover:text-gray-600"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-end items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 border rounded hover:bg-gray-200"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
