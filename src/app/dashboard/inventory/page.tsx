"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

interface InventoryProduct {
  _id: string;
  image: string;
  name: string;
  attributes: { name: string; value: string }[];
  price: number;
  soldAs: string;
  tax: number;
  inventory: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("/api/dashboard/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));
  }, []);

  const handleInventoryChange = (id: string, value: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product._id === id ? { ...product, inventory: value } : product
      )
    );
  };

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold text-[#0077b6] mb-4">
            Inventory Details
          </h2>

          {/* Search Bar */}
          <div className="mb-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search product name..."
              className="border px-3 py-2 rounded w-1/3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Inventory Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-200 text-sm text-left">
              <thead className="bg-[#0077b6] text-white">
                <tr>
                  <th className="p-3">Id</th>
                  <th className="p-3">Image</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Attributes</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Tax</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr
                    key={product._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                      )}
                    </td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">
                      {product.attributes.map((attr, i) => (
                        <div key={i}>
                          {attr.name}: {attr.value}
                        </div>
                      ))}
                    </td>
                    <td className="p-3">
                      ${product.price} / {product.soldAs}
                    </td>
                    <td className="p-3">{product.tax}%</td>
                    <td className="p-3">
                      $
                      {(
                        product.price +
                        (product.price * product.tax) / 100
                      ).toFixed(2)}{" "}
                      / {product.soldAs}
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={product.inventory}
                        onChange={(e) =>
                          handleInventoryChange(
                            product._id,
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-gray-500">
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
