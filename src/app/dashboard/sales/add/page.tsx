"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ChevronRight, Trash2, Plus } from "lucide-react";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  attributes: { name: string; value: string }[];
  soldAs: string;
  price: number;
}

interface SaleItem {
  productId: string;
  quantity: number;
}

export default function AddSalePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCache, setProductCache] = useState<{ [key: string]: Product }>(
    {}
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [salesList, setSalesList] = useState<SaleItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState({
    category: false,
    product: false,
  });

  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    axios.get("/api/dashboard/categories").then((res) => {
      const cats = Array.isArray(res.data) ? res.data : res.data.categories;
      setCategories(Array.isArray(cats) ? cats : []);
    });
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }
    axios
      .get(`/api/dashboard/products?category=${selectedCategory}`)
      .then((res) => {
        const fetched = Array.isArray(res.data) ? res.data : [];
        setProducts(fetched);

        const newCache: { [key: string]: Product } = {};
        for (const prod of fetched) {
          newCache[prod._id] = prod;
        }
        setProductCache((prev) => ({ ...prev, ...newCache }));
      });
  }, [selectedCategory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setDropdownOpen({ category: false, product: false });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToSalesList = () => {
    if (!selectedProductId || !quantity) {
      toast.error("Please select product and quantity.");
      return;
    }
    setSalesList((prev) => [
      ...prev,
      { productId: selectedProductId, quantity },
    ]);
    setSelectedProductId("");
    setQuantity(1);
  };

  const removeFromSalesList = (index: number) => {
    setSalesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (salesList.length === 0) {
      toast.error("Add at least one product.");
      return;
    }

    try {
      await axios.post("/api/dashboard/sales", {
        items: salesList,
      });
      toast.success("Sales added successfully.");
      router.push("/dashboard/sales");
    } catch (error) {
      toast.error("Failed to add sales.");
    }
  };

  const dropdownStyle = `absolute z-10 bg-white text-black rounded-md shadow-md mt-1 w-full max-h-40 overflow-y-auto`;

  const renderDropdown = (
    field: "category" | "product",
    options: { value: string; label: string }[],
    onSelect: (val: string) => void,
    selected: string
  ) =>
    dropdownOpen[field] && (
      <div className={dropdownStyle}>
        <div className="h-[2px] bg-[#0077b6] mb-1" />
        {options.map((opt) => (
          <div
            key={opt.value + opt.label}
            onClick={() => {
              onSelect(opt.value);
              setDropdownOpen({ ...dropdownOpen, [field]: false });
            }}
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
              selected === opt.value ? "bg-gray-100 text-[#0077b6]" : ""
            }`}
          >
            {opt.label}
          </div>
        ))}
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div
          ref={formRef}
          className="bg-white shadow-md rounded p-6 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[#0077b6] mb-6">Add Sales</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Category Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-1">Category</label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white"
                onClick={() =>
                  setDropdownOpen({
                    ...dropdownOpen,
                    category: !dropdownOpen.category,
                    product: false,
                  })
                }
              >
                <span
                  className={selectedCategory ? "text-black" : "text-gray-400"}
                >
                  {categories.find((c) => c._id === selectedCategory)?.name ||
                    "Select Category"}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    dropdownOpen.category ? "rotate-90" : ""
                  }`}
                />
              </div>
              {renderDropdown(
                "category",
                categories.map((cat) => ({
                  value: cat._id,
                  label: cat.name,
                })),
                (val) => {
                  setSelectedCategory(val);
                  setSelectedProductId("");
                },
                selectedCategory
              )}
            </div>

            {/* Product Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-1">Product</label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white w-80"
                onClick={() =>
                  setDropdownOpen({
                    ...dropdownOpen,
                    product: !dropdownOpen.product,
                    category: false,
                  })
                }
              >
                <span
                  className={selectedProductId ? "text-black" : "text-gray-400"}
                >
                  {selectedProductId
                    ? products.find((p) => p._id === selectedProductId)?.name
                    : !selectedCategory
                    ? "Please select a category first"
                    : products.length === 0
                    ? "No products in this category"
                    : "Select Product"}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    dropdownOpen.product ? "rotate-90" : ""
                  }`}
                />
              </div>
              {renderDropdown(
                "product",
                !selectedCategory
                  ? [{ value: "", label: "Please select a category first" }]
                  : products.length === 0
                  ? [{ value: "", label: "No products in this category" }]
                  : products.map((prod) => ({
                      value: prod._id,
                      label: `${prod.name} → ${prod.attributes
                        .map((a) => a.value)
                        .join(" ")} → ₹${prod.price}/${prod.soldAs}`,
                    })),
                (val) => setSelectedProductId(val),
                selectedProductId
              )}
            </div>
            <br />

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity *
              </label>
              <input
                type="text"
                name="quantity"
                inputMode="numeric"
                pattern="\d*"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Add Button */}
          <div className="mt-4">
            <button
              onClick={addToSalesList}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={18} /> Add Product
            </button>
          </div>

          {/* Preview Table */}
          {salesList.length > 0 && (
            <div className="mt-6">
              <table className="w-full text-sm border rounded">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Quantity</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesList.map((item, index) => {
                    const product = productCache[item.productId];
                    return (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          {product?.name || "Unknown Product"}
                        </td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">
                          <button
                            onClick={() => removeFromSalesList(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit + Back Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push("/dashboard/sales")}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              ← Back
            </button>
            <button
              onClick={handleFinalSubmit}
              className="bg-[#0077b6] text-white px-6 py-2 rounded hover:bg-[#005f94]"
            >
              ✓ Add
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
