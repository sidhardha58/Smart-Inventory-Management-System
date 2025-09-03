"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  Layers,
  Box,
  ShoppingBag,
  PieChart,
  CircleDollarSign,
  StoreIcon,
  FileText,
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  // Manage dropdown toggles
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggleDropdown = (key: string) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <aside className="w-64 bg-[#0077b6] text-white flex flex-col">
      <div className="text-2xl font-bold px-6 py-4 border-b border-[#005f8f]">
        Smart Zaiko
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
        {/* Dashboard */}
        <div
          className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer ${
            isActive("/dashboard") ? "bg-[#005f8f]" : "hover:bg-[#005f8f]"
          }`}
          onClick={() => router.push("/dashboard")}
        >
          <PieChart className="w-5 h-5" />
          <span>Dashboard</span>
        </div>

        {/* Category Dropdown */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => toggleDropdown("category")}
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5" />
              <span>Category</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === "category" ? "rotate-90" : ""
              }`}
            />
          </div>

          {openDropdown === "category" && (
            <div className="bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
              <div className="h-[2px] bg-[#0077b6] mb-1" />
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/categories")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/categories")}
              >
                Category List
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/categories/add")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/categories/add")}
              >
                Add Category
              </div>
            </div>
          )}
        </div>

        {/* Products Dropdown */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => toggleDropdown("products")}
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5" />
              <span>Products</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === "products" ? "rotate-90" : ""
              }`}
            />
          </div>
          {openDropdown === "products" && (
            <div className="bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
              <div className="h-[2px] bg-[#0077b6] mb-1" />
              <div
                className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer"
                onClick={() => router.push("/dashboard/products")}
              >
                Product List
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer"
                onClick={() => router.push("/dashboard/products/add")}
              >
                Add Product
              </div>
            </div>
          )}
        </div>

        {/* Attributes Dropdown */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => toggleDropdown("attributes")}
          >
            <div className="flex items-center space-x-3">
              <Box className="w-5 h-5" />
              <span>Attributes</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === "attributes" ? "rotate-90" : ""
              }`}
            />
          </div>

          {openDropdown === "attributes" && (
            <div className="bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
              <div className="h-[2px] bg-[#0077b6] mb-1" />
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/attributes")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/attributes")}
              >
                Attribute List
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/attributes/add")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/attributes/add")}
              >
                Add Attribute
              </div>
            </div>
          )}
        </div>

        {/* Sales Dropdown */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => toggleDropdown("sales")}
          >
            <div className="flex items-center space-x-3">
              <CircleDollarSign className="w-5 h-5" />
              <span>Sales</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === "sales" ? "rotate-90" : ""
              }`}
            />
          </div>

          {openDropdown === "sales" && (
            <div className="bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
              <div className="h-[2px] bg-[#0077b6] mb-1" />
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/sales")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/sales")}
              >
                Sales List
              </div>
              <div
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
                  isActive("/dashboard/sales/add")
                    ? "bg-gray-100 text-[#0077b6]"
                    : ""
                }`}
                onClick={() => router.push("/dashboard/sales/add")}
              >
                Add Sales
              </div>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => router.push("/dashboard/inventory")}
          >
            <div className="flex items-center space-x-3 ">
              <StoreIcon className="w-5 h-5" />
              <span>Inventory</span>
            </div>
          </div>
        </div>

        {/* Reports Dropdown */}
        <div>
          <div
            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer"
            onClick={() => toggleDropdown("reports")}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5" />
              <span>Reports</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${
                openDropdown === "reports" ? "rotate-90" : ""
              }`}
            />
          </div>

          {openDropdown === "reports" && (
            <div className="bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
              <div className="h-[2px] bg-[#0077b6] mb-1" />
              <div
                className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer"
                onClick={() => router.push("/dashboard/reports/sales-by-date")}
              >
                Sales by Date
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer"
                onClick={() => router.push("/dashboard/reports/monthly-sales")}
              >
                Monthly Sales
              </div>
              <div
                className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer"
                onClick={() => router.push("/dashboard/reports/today-sales")}
              >
                Today Sales
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
