"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";

export default function DeleteAttributePage() {
  const { id } = useParams();
  const router = useRouter();
  const [attributeName, setAttributeName] = useState("");

  useEffect(() => {
    const fetchAttribute = async () => {
      try {
        const res = await axios.get(`/api/dashboard/attributes`);
        const attribute = res.data.find((attr: any) => attr._id === id);
        if (attribute) setAttributeName(attribute.name || "");
      } catch (err) {
        console.error("Failed to fetch attribute:", err);
      }
    };
    fetchAttribute();
  }, [id]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/dashboard/attributes`, {
        data: { id },
        headers: { "Content-Type": "application/json" },
      });
      router.push("/dashboard/attributes");
    } catch (err) {
      console.error("Failed to delete attribute:", err);
      alert("Deletion failed.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Confirm Deletion
          </h2>
          <p className="mb-6">
            Are you sure you want to delete the attribute{" "}
            <span className="font-semibold">
              {attributeName || "(loading...)"}
            </span>
            ?
          </p>
          <div className="flex justify-between">
            <button
              onClick={() => router.push("/dashboard/attributes")}
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
