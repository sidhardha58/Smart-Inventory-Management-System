"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { ChevronRight, Layers, Pencil, Trash2 } from "lucide-react";
import AttributeForm from "@/components/AttributeForm";

export default function AddProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    brand: "",
    description: "",
    image: null as File | null,
  });

  const [categoryList, setCategoryList] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [attributes, setAttributes] = useState<any[]>([]);
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [editAttrIndex, setEditAttrIndex] = useState<number | null>(null);
  const [editAttrData, setEditAttrData] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/dashboard/categories");
        setCategoryList(res.data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddAttribute = (data: any) => {
    if (editAttrIndex !== null) {
      const updated = [...attributes];
      updated[editAttrIndex] = data;
      setAttributes(updated);
      setEditAttrIndex(null);
      setEditAttrData(null);
    } else {
      setAttributes([...attributes, data]);
    }
    setIsAttrModalOpen(false);
  };

  const handleEditAttribute = (index: number) => {
    setEditAttrIndex(index);
    setEditAttrData(attributes[index]);
    setIsAttrModalOpen(true);
  };

  const handleDeleteAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const productData = new FormData();
    productData.append("name", formData.name);
    productData.append("category", formData.category);
    productData.append("brand", formData.brand);
    productData.append("description", formData.description);
    if (formData.image) {
      productData.append("image", formData.image);
    }
    productData.append("attributes", JSON.stringify(attributes));

    try {
      await axios.post("/api/dashboard/products", productData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/dashboard/products");
    } catch {
      console.error("Error adding product");
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
          <h2 className="text-xl font-bold text-[#0077b6]">Add Product</h2>

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
                className="w-full border px-3 py-2 rounded"
                required
                placeholder="Enter product name"
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
                    {categoryList.find((c: any) => c._id === formData.category)
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
                <div className="absolute z-10 bg-white text-black rounded-md shadow-md mt-1 w-full">
                  <div className="h-[2px] bg-[#0077b6] mb-1" />
                  {categoryList.map((cat: any) => (
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

            {/* Image Upload */}
            <div>
              <label className="block font-medium mb-1">Image</label>
              <label className="inline-block bg-[#0077b6] hover:bg-[#005f94] text-white px-4 py-2 rounded cursor-pointer">
                Choose File
                <input
                  type="file"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                  accept="image/*"
                />
              </label>
              {formData.image && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {formData.image.name}
                </p>
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
                className="w-full border px-3 py-2 rounded"
                rows={3}
                placeholder="Write a short product description..."
                required
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
                className="inline-flex items-center text-sm font-medium text-white bg-[#0077b6] hover:bg-[#005f94] px-4 py-2 rounded cursor-pointer"
              >
                + Add Attribute
              </button>
            </div>

            {attributes.length > 0 ? (
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
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributes.map((attr, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-gray-50 transition duration-150"
                      >
                        <td className="p-3">{attr.attribute}</td>
                        <td className="p-3">{attr.value}</td>
                        <td className="p-3">{attr.soldAs}</td>
                        <td className="p-3">₹{attr.price}</td>
                        <td className="p-3">{attr.inventory}</td>
                        <td className="p-3">{attr.tax}%</td>
                        <td className="p-3 text-center space-x-2 ">
                          <button
                            type="button"
                            onClick={() => handleEditAttribute(index)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttribute(index)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded cursor-pointer"
                            title="Delete"
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

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-[#0077b6] hover:bg-[#005f94] text-white px-6 py-2 rounded cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>

        {/* Drawer opens from left now */}
        <div
          className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-lg transform transition-transform duration-300 ${
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
