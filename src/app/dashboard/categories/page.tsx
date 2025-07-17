"use client";

import { useState, useEffect } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import axios from "axios";
import { useRouter } from "next/navigation";

type Category = {
  _id: string;
  name?: string;
};

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/dashboard/categories");
      setCategories(res.data.categories); // 👈 only extract the array
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search + Pagination
  const filteredCategories = categories.filter((cat) =>
    (cat.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 px-6 pt-2 pb-6">
        {/* Breadcrumb
        <div className="mb-2">
          <h2 className="text-sm text-gray-500">
            Dashboard /{" "}
            <span className="text-black font-semibold">Category List</span>
          </h2>
        </div> */}

        <div className="bg-white p-6 rounded shadow">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#0077b6]">Category List</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/dashboard/categories/add")}
                className="bg-[#0077b6] hover:bg-[#005f94] text-white px-4 py-2 rounded cursor-pointer"
              >
                + Add Category
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4 relative w-1/3">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
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
                <th className="p-3 border-r border-white w-1/6">#</th>
                <th className="p-3 border-r border-white w-3/6">Name</th>
                <th className="p-3 text-right w-2/6">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map((cat, index) => (
                <tr
                  key={cat._id ?? `cat-${index}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3 border-r border-gray-200">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-3 border-r border-gray-200">
                    {cat.name || "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded cursor-pointer"
                        onClick={() =>
                          router.push(`/dashboard/categories/${cat._id}/edit`)
                        }
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/dashboard/categories/${cat._id}/delete`)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="mt-4 flex justify-end items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded hover:bg-gray-200 cursor-pointer"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 border rounded hover:bg-gray-200 cursor-pointer"
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
