"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2, Plus, Search } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  category?: string;
  attributes: {
    name: string;
    value: string;
    price: number;
    tax: number;
    soldAs?: string;
  }[];
}

interface SaleItem {
  productId: string;
  quantity: number;
}

export default function AddSalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productCache, setProductCache] = useState<{ [key: string]: Product }>(
    {}
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [salesList, setSalesList] = useState<SaleItem[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/dashboard/products");
        const fetched: Product[] = Array.isArray(res.data) ? res.data : [];
        setProducts(fetched);

        const cache: { [key: string]: Product } = {};
        fetched.forEach((p) => (cache[p._id] = p));
        setProductCache(cache);
      } catch (err) {
        toast.error("Failed to fetch products.");
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const addToSalesList = () => {
    if (!selectedProductId || quantity <= 0) {
      toast.error("Please select a product and enter a valid quantity.");
      return;
    }

    setSalesList((prev) => [
      ...prev,
      { productId: selectedProductId, quantity },
    ]);
    setSelectedProductId("");
    setSearch("");
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
    } catch (err) {
      toast.error("Failed to add sales.");
    }
  };

  // ✅ Correct tax-included grand total calculation
  const totalCost = salesList.reduce((sum, item) => {
    const prod = productCache[item.productId];
    if (!prod) return sum;

    const attr = prod.attributes?.[0] || {};
    const unitPrice = Number(attr.price) || 0;
    const taxPercent = Number(attr.tax) || 0;
    const unitTax = (unitPrice * taxPercent) / 100;

    return sum + (unitPrice + unitTax) * item.quantity;
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <div
          ref={formRef}
          className="bg-white shadow-md rounded p-6 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-[#0077b6] mb-6">Add Sales</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Search */}
            <div className="relative">
              <label className="block font-medium mb-1">Product</label>
              <input
                type="text"
                placeholder="Select Product"
                value={
                  selectedProductId
                    ? `${productCache[selectedProductId]?.name || ""} → ${
                        productCache[selectedProductId]?.attributes
                          ?.map((a) => a.value)
                          .join(" → ") || ""
                      } → ₹${
                        productCache[selectedProductId]?.attributes?.[0]
                          ?.price || 0
                      }/${
                        productCache[selectedProductId]?.attributes?.[0]
                          ?.soldAs || "unit"
                      }`
                    : search
                }
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedProductId("");
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="border border-gray-300 px-3 py-2 rounded w-full pr-10"
              />
              <Search
                className="absolute right-3 bottom-0 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
              {dropdownOpen && (
                <div className="absolute z-10 bg-white w-full mt-1 shadow-md rounded max-h-40 overflow-y-auto">
                  <div className="px-4 py-2 text-gray-500 italic">
                    Select Product
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((prod) => {
                      const attr = prod.attributes?.[0];
                      const attrStr = prod.attributes
                        ?.map((a) => a.value)
                        .join(" → ");
                      const priceStr =
                        attr?.price !== undefined ? `₹${attr.price}` : "₹0";
                      const soldAsStr = attr?.soldAs || "unit";

                      return (
                        <div
                          key={prod._id}
                          onClick={() => {
                            setSelectedProductId(prod._id);
                            setSearch("");
                            setDropdownOpen(false);
                          }}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {`${prod.name} → ${attrStr} → ${priceStr}/${soldAsStr}`}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

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

          {/* Sales Table */}
          {salesList.length > 0 && (
            <div className="mt-6">
              <table className="w-full text-sm border rounded">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Quantity</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-left">Tax (%)</th>
                    <th className="p-2 text-left">Price with Tax (₹)</th>
                    <th className="p-2 text-left">Total (₹)</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {salesList.map((item, index) => {
                    const prod = productCache[item.productId];
                    if (!prod) return null;

                    const attr = prod.attributes?.[0] || {};
                    const unitPrice = Number(attr.price) || 0;
                    const taxPercent = Number(attr.tax) || 0;
                    const unitTax = (unitPrice * taxPercent) / 100;
                    const total = (unitPrice + unitTax) * item.quantity;

                    return (
                      <tr
                        key={`${item.productId}-${index}`}
                        className="border-t"
                      >
                        <td className="p-2">{prod.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">{prod.category || "N/A"}</td>
                        <td className="p-2">{taxPercent}%</td>
                        <td className="p-2">
                          {(unitPrice + unitTax).toFixed(2)}
                        </td>
                        <td className="p-2">{total.toFixed(2)}</td>
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

              {/* Grand Total */}
              <div className="bg-gray-100 p-4 rounded mt-4">
                <p className="font-bold text-lg text-[#0077b6] text-right">
                  Grand Total: ₹{totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
