"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }

    try {
      await axios.post("/api/dashboard/categories", { name });
      router.push("/dashboard/categories"); // navigate to list
    } catch (error) {
      console.error("Error adding category:", error);
      setError("Failed to add category. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-[#0077b6] mb-4">Add Category</h2>
        <div className="bg-white p-6 rounded shadow max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            className={`w-full border ${
              error ? "border-red-500" : "border-gray-300"
            } px-3 py-2 rounded mb-1`}
            placeholder="Enter category name"
          />
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          <div className="flex justify-between">
            <button
              onClick={() => router.push("/dashboard/categories")}
              className="mt-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="mt-2 px-4 py-2 rounded bg-[#0077b6] hover:bg-[#005f94] text-white cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
