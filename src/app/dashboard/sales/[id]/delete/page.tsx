"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { toast } from "react-hot-toast";

export default function DeleteSalePage() {
  const { id } = useParams(); // 'id' comes from [id] in the route
  const router = useRouter();
  const [productName, setProductName] = useState("");

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const res = await axios.get(`/api/dashboard/sales/${id}`);
        if (res.data?.productName) setProductName(res.data.productName);
      } catch (err) {
        console.error("Failed to fetch sale:", err);
        toast.error("Sale not found.");
        router.push("/dashboard/sales");
      }
    };
    if (id) fetchSale();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/dashboard/sales/${id}`);
      toast.success("Sale deleted successfully");
      router.push("/dashboard/sales");
    } catch (err) {
      console.error("Failed to delete sale:", err);
      toast.error("Sale deletion failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Confirm Sale Deletion
          </h2>
          <p className="mb-6">
            Are you sure you want to delete the sale for product{" "}
            <span className="font-semibold">
              {productName || "(loading...)"}
            </span>
            ?
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => router.push("/dashboard/sales")}
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
