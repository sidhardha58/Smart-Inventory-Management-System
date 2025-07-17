"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

export default function EditCategoryPage() {
  const router = useRouter();
  const { id } = useParams(); // get category id from route params
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch category data on mount
    async function fetchCategory() {
      try {
        const res = await axios.get(`/api/dashboard/categories`);
        const category = res.data.categories.find((cat: any) => cat._id === id);
        if (!category) {
          setError("Category not found");
          setLoading(false);
          return;
        }
        setName(category.name || "");
        setLoading(false);
      } catch {
        setError("Failed to load category");
        setLoading(false);
      }
    }
    fetchCategory();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Category name cannot be empty");
      return;
    }
    try {
      await axios.put(`/api/dashboard/categories/${id}`, { name });
      router.push("/dashboard/categories");
    } catch {
      setError("Failed to update category");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 max-w-md">
        <h2 className="text-2xl font-bold text-[#0077b6] mb-4">
          Edit Category
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
          placeholder="Category Name"
        />

        <div className="flex justify-between">
          <button
            onClick={() => router.push("/dashboard/categories")}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded bg-[#0077b6] hover:bg-[#005f94] text-white cursor-pointer"
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
}
