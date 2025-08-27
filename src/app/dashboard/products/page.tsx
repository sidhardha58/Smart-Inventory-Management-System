"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Search } from "lucide-react";
import { toast } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import ProductDetailsModal from "@/components/ProductDetailsModal";

interface Attribute {
  attributeName: string;
  value: string;
  price: number;
  inventory: number;
  soldAs: string;
  tax: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  attributes: Attribute[];
  image?: string;
  brand?: string;
  _id: string;
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const itemsPerPage = 5;
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/dashboard/products");
      const normalized = res.data.map((p: any) => ({
        ...p,
        id: p._id, // normalize _id to id
      }));
      setProducts(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  const handleDelete = (id: string) => {
    if (!id) {
      toast.error("Invalid product ID");
      return;
    }
    router.push(`/dashboard/products/${id}/delete`);
  };

  const handleShowDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
            <h3 className="text-lg font-bold text-[#0077b6]">Product List</h3>
            <button
              onClick={() => router.push("/dashboard/products/add")}
              className="bg-[#0077b6] hover:bg-[#005f94] text-white px-4 py-2 rounded"
            >
              + Add Product
            </button>
          </div>

          {/* Search */}
          <div className="mb-4 relative w-1/3">
            <input
              type="text"
              placeholder="Search products..."
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

          {/* Table */}
          <table className="w-full text-left border border-gray-200 rounded overflow-hidden table-fixed">
            <thead className="bg-[#0077b6] text-white">
              <tr>
                <th className="p-3 w-[60px]">#</th>
                <th className="p-3 w-[80px]">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Attributes</th>
                <th className="p-3">Details</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
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
                  <td className="p-3">{product.category || "-"}</td>
                  <td className="p-3">
                    {product.attributes?.length > 0
                      ? product.attributes.map((attr, i) => (
                          <div key={`${attr.attributeName}-${attr.value}-${i}`}>
                            <strong>{attr.attributeName}</strong>: {attr.value}
                          </div>
                        ))
                      : "-"}
                  </td>
                  <td className="p-3">
                    <button
                      className="border border-blue-500 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded cursor-pointer text-sm"
                      onClick={() => handleShowDetails(product)}
                    >
                      More info
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                        onClick={() =>
                          router.push(`/dashboard/products/${product._id}/edit`)
                        }
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr key="empty">
                  <td colSpan={7} className="text-center py-4 text-gray-500">
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

      {/* Modal */}
      <ProductDetailsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct}
      />
    </div>
  );
}
