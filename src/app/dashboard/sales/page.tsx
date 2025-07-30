"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Sale {
  _id: string;
  saleId: number;
  productName: string;
  price: number;
  soldAs: string;
  quantity: number;
  tax: number;
  totalPrice: number;
}

export default function SalesListPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  const fetchSales = async () => {
    try {
      const res = await axios.get("/api/dashboard/sales");
      setSales(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch sales");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter((sale) =>
    sale.productName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
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
            <h3 className="text-lg font-bold text-[#0077b6]">Sales List</h3>
            <button
              onClick={() => router.push("/dashboard/sales/add")}
              className="bg-[#0077b6] hover:bg-[#005f94] text-white px-4 py-2 rounded"
            >
              + Add Sale
            </button>
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

          {/* Count (Optional) */}
          <p className="text-sm text-gray-600 mb-2">
            Showing {filteredSales.length} sale
            {filteredSales.length !== 1 && "s"} found
          </p>

          {/* Table */}
          <table className="w-full text-left border border-gray-200 rounded overflow-hidden table-fixed">
            <thead className="bg-[#0077b6] text-white">
              <tr>
                <th className="p-3 w-[60px]">#</th>
                <th className="p-3">Sale ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Price</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Total Price</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSales.map((sale, index) => (
                <tr
                  key={sale._id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-3">{sale.saleId}</td>
                  <td className="p-3">{sale.productName}</td>
                  <td className="p-3">
                    ₹{sale.price}/{sale.soldAs}
                  </td>
                  <td className="p-3">{sale.quantity}</td>
                  <td className="p-3">
                    ₹
                    {(
                      sale.totalPrice +
                      (sale.totalPrice * sale.tax) / 100
                    ).toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/sales/${sale._id}/delete`)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No sales found.
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
