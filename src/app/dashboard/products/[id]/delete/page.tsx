"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-hot-toast";

export default function DeleteProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [productName, setProductName] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/dashboard/products/${id}`);
        if (res.data?.name) setProductName(res.data.name);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/dashboard/products/${id}`, {
        data: { id },
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Product deleted successfully");
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Product deletion failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Confirm Product Deletion
          </h2>
          <p className="mb-6">
            Are you sure you want to delete the product{" "}
            <span className="font-semibold">
              {productName || "(loading...)"}
            </span>
            ?
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => router.push("/dashboard/products")}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
