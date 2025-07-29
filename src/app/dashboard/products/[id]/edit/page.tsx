"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight, Layers, Pencil, Trash2 } from "lucide-react";
import AttributeForm from "@/components/AttributeForm";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: null as File | null,
    imagePreview: "",
  });

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [attributes, setAttributes] = useState<any[]>([]);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState<number | null>(null);
  const [editAttrData, setEditAttrData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(`/api/dashboard/products/${id}`),
          axios.get("/api/dashboard/categories"),
        ]);

        const prod = prodRes.data;

        setFormData({
          name: prod.name,
          category: prod.categoryId || "",
          description: prod.description || "",
          image: null,
          imagePreview: prod.image || "",
        });

        setAttributes(prod.attributes || []);
        setCategoryList(catRes.data.categories);
      } catch (e) {
        console.error("Error loading data:", e);
      }
    }

    load();
  }, [id]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleAddAttribute = (data: any) => {
    if (editAttrIndex !== null) {
      const updated = [...attributes];
      updated[editAttrIndex] = data;
      setAttributes(updated);
    } else {
      setAttributes([...attributes, data]);
    }
    setEditAttrIndex(null);
    setEditAttrData(null);
    setIsAttrModalOpen(false);
  };

  const handleEditAttribute = (idx: number) => {
    setEditAttrIndex(idx);
    setEditAttrData(attributes[idx]);
    setIsAttrModalOpen(true);
  };

  const handleDeleteAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("category", formData.category);
    fd.append("description", formData.description);
    if (formData.image) {
      fd.append("image", formData.image);
    }
    fd.append("attributes", JSON.stringify(attributes));

    try {
      await axios.put(`/api/dashboard/products/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard/products");
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 relative overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-6"
        >
          <h2 className="text-xl font-bold text-[#0077b6]">Edit Product</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block font-medium mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            {/* Category */}
            <div className="relative" ref={dropdownRef}>
              <label className="block font-medium mb-1">Category</label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white"
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                <div className="flex items-center space-x-3">
                  <Layers className="w-5 h-5 text-gray-700" />
                  <span
                    className={
                      formData.category ? "text-black" : "text-gray-400"
                    }
                  >
                    {categoryList.find((c) => c._id === formData.category)
                      ?.name || "Select Category"}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    categoryOpen ? "rotate-90" : ""
                  }`}
                />
              </div>
              {categoryOpen && (
                <div className="absolute z-10 bg-white text-black rounded-md shadow-md mt-1 w-full max-h-60 overflow-y-auto">
                  <div className="h-[2px] bg-[#0077b6] mb-1" />
                  {categoryList.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => {
                        setFormData({ ...formData, category: cat._id });
                        setCategoryOpen(false);
                      }}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                        formData.category === cat._id
                          ? "bg-gray-100 text-[#0077b6]"
                          : ""
                      }`}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block font-medium mb-1">Image</label>
              <label className="inline-block bg-[#0077b6] hover:bg-[#005f94] text-white px-4 py-2 rounded cursor-pointer">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                      imagePreview: e.target.files?.[0]
                        ? URL.createObjectURL(e.target.files[0])
                        : formData.imagePreview,
                    })
                  }
                />
              </label>
              {formData.imagePreview && (
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="mt-2 w-24 h-24 object-cover"
                />
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Product Attributes</h3>
              <button
                type="button"
                onClick={() => {
                  setEditAttrIndex(null);
                  setEditAttrData(null);
                  setIsAttrModalOpen(true);
                }}
                className="inline-flex items-center text-sm font-medium text-white bg-[#0077b6] hover:bg-[#005f94] px-4 py-2 rounded"
              >
                + Add Attribute
              </button>
            </div>

            {attributes.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 rounded">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Sold As</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Inventory</th>
                      <th className="p-3">Tax</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.map((attr, idx) => (
                      <tr key={idx} className="border-t hover:bg-gray-50">
                        <td className="p-3">{attr.attribute}</td>
                        <td className="p-3">{attr.value}</td>
                        <td className="p-3">{attr.soldAs}</td>
                        <td className="p-3">₹{attr.price}</td>
                        <td className="p-3">{attr.inventory}</td>
                        <td className="p-3">{attr.tax}%</td>
                        <td className="p-3 text-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEditAttribute(idx)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttribute(idx)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No attributes added yet.</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#0077b6] hover:bg-[#005f94] text-white px-6 py-2 rounded"
            >
              Update Product
            </button>
          </div>
        </form>

        {/* Attribute Modal Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white z-50 transform transition-transform duration-300 ${
            isAttrModalOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {isAttrModalOpen && (
            <AttributeForm
              onClose={() => {
                setIsAttrModalOpen(false);
                setEditAttrIndex(null);
                setEditAttrData(null);
              }}
              onSave={handleAddAttribute}
              initialData={editAttrData}
            />
          )}
        </div>
      </main>
    </div>
  );
}
