"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

export default function AddAttributePage() {
  const [name, setName] = useState("");
  const [metrics, setMetrics] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim() || !metrics.trim()) {
      setError("Please enter both attribute name and metrics.");
      return;
    }

    try {
      await axios.post("/api/dashboard/attributes", {
        name: name.trim(),
        metrics: metrics.trim().replace(/,+$/, ""), // removes trailing commas
      });
      router.push("/dashboard/attributes");
    } catch (error) {
      console.error("Error adding attribute:", error);
      setError("Failed to add attribute. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <h2 className="text-2xl font-bold text-[#0077b6] mb-4">
          Add Attribute
        </h2>
        <div className="bg-white p-6 rounded shadow max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attribute Name
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
            } px-3 py-2 rounded mb-4`}
            placeholder="Eg: Size"
          />

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metrics (comma-separated)
          </label>
          <input
            type="text"
            value={metrics}
            onChange={(e) => {
              setMetrics(e.target.value);
              if (error) setError("");
            }}
            className={`w-full border ${
              error ? "border-red-500" : "border-gray-300"
            } px-3 py-2 rounded mb-1`}
            placeholder="Eg: small, medium, large"
          />

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between">
            <button
              onClick={() => router.push("/dashboard/attributes")}
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
