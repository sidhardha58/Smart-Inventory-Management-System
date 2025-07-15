"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import axios from "axios";

export default function EditAttributePage() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [metrics, setMetrics] = useState<string[]>([]);
  const [newMetric, setNewMetric] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAttribute() {
      try {
        const res = await axios.get(`/api/dashboard/attributes`);
        const attribute = res.data.find((attr: any) => attr._id === id);
        if (!attribute) {
          setError("Attribute not found");
          setLoading(false);
          return;
        }
        setName(attribute.name || "");
        setMetrics(attribute.metrics || []);
        setLoading(false);
      } catch {
        setError("Failed to load attribute");
        setLoading(false);
      }
    }
    fetchAttribute();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      setError("Attribute name cannot be empty");
      return;
    }

    try {
      await axios.put(`/api/dashboard/attributes/${id}`, {
        name,
        metrics, // ✅ Corrected field name to match backend schema
      });
      router.push("/dashboard/attributes");
    } catch {
      setError("Failed to update attribute");
    }
  };

  const addMetric = () => {
    if (newMetric.trim() && !metrics.includes(newMetric.trim())) {
      setMetrics([...metrics, newMetric.trim()]);
      setNewMetric("");
    }
  };

  const removeMetric = (index: number) => {
    const newList = [...metrics];
    newList.splice(index, 1);
    setMetrics(newList);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 max-w-md">
        <h2 className="text-2xl font-bold text-[#0077b6] mb-4">
          Edit Attribute
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
          placeholder="Attribute Name"
        />

        <div className="mb-4">
          <label className="font-semibold mb-2 block">Metrics</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newMetric}
              onChange={(e) => setNewMetric(e.target.value)}
              placeholder="New metric"
              className="flex-1 border border-gray-300 px-3 py-2 rounded"
            />
            <button
              type="button"
              onClick={addMetric}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Add
            </button>
          </div>

          {metrics.length === 0 ? (
            <p className="text-gray-500">No metrics added yet.</p>
          ) : (
            <ul className="space-y-2">
              {metrics.map((metric, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-200 px-3 py-1 rounded"
                >
                  <span>{metric}</span>
                  <button
                    type="button"
                    onClick={() => removeMetric(idx)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push("/dashboard/attributes")}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 rounded bg-[#0077b6] hover:bg-[#005f94] text-white"
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
}
