"use client";

import React from "react";
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
        <div className="group">
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5" />
              <span>Category</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>

          <div className="hidden group-hover:block bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
            <div className="h-[2px] bg-[#0077b6] mb-1" />
            <div
              className={`px-4 py-2 cursor-pointer rounded-t-md hover:bg-gray-100 hover:text-[#0077b6] ${
                isActive("/dashboard/categories")
                  ? "bg-gray-100 text-[#0077b6]"
                  : ""
              }`}
              onClick={() => router.push("/dashboard/categories")}
            >
              Category List
            </div>
            <div
              className={`px-4 py-2 cursor-pointer rounded-b-md hover:bg-gray-100 hover:text-[#0077b6] ${
                isActive("/dashboard/categories/add")
                  ? "bg-gray-100 text-[#0077b6]"
                  : ""
              }`}
              onClick={() => router.push("/dashboard/categories/add")}
            >
              Add Category
            </div>
          </div>
        </div>

        {/* Products Dropdown */}
        <div className="group">
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-5 h-5" />
              <span>Products</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>
          <div className="hidden group-hover:block bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
            <div className="h-[2px] bg-[#0077b6] mb-1" />
            <div
              className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer rounded-t-md"
              onClick={() => router.push("/dashboard/products")}
            >
              Product List
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer rounded-b-md"
              onClick={() => router.push("/dashboard/products/add")}
            >
              Add Product
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div className="group">
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
            <div className="flex items-center space-x-3">
              <Box className="w-5 h-5" />
              <span>Attributes</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>

          <div className="hidden group-hover:block bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
            <div className="h-[2px] bg-[#0077b6] mb-1" />

            <div
              className={`px-4 py-2 cursor-pointer rounded-t-md hover:bg-gray-100 hover:text-[#0077b6] ${
                isActive("/dashboard/attributes")
                  ? "bg-gray-100 text-[#0077b6]"
                  : ""
              }`}
              onClick={() => router.push("/dashboard/attributes")}
            >
              Attribute List
            </div>

            <div
              className={`px-4 py-2 cursor-pointer rounded-b-md hover:bg-gray-100 hover:text-[#0077b6] ${
                isActive("/dashboard/attributes/add")
                  ? "bg-gray-100 text-[#0077b6]"
                  : ""
              }`}
              onClick={() => router.push("/dashboard/attributes/add")}
            >
              Add Attribute
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="group">
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
            <div className="flex items-center space-x-3">
              <CircleDollarSign className="w-5 h-5" />
              <span>Sales</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>
          <div className="hidden group-hover:block bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
            <div className="h-[2px] bg-[#0077b6] mb-1" />
            <a
              href="/dashboard/sales"
              className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer rounded-md"
            >
              Sales List
            </a>
            <a
              href="/dashboard/sales/add"
              className="block px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer rounded-md"
            >
              Add Sale
            </a>
          </div>
        </div>

        {/* Inventory */}
        <div className="group">
          <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
            <div className="flex items-center space-x-3">
              <StoreIcon className="w-5 h-5" />
              <span>Inventory</span>
            </div>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </div>
          <div className="hidden group-hover:block bg-white text-black rounded-md shadow-md mt-1 ml-6 w-48">
            <div className="h-[2px] bg-[#0077b6] mb-1" />
            <div className="px-4 py-2 hover:bg-gray-100 hover:text-[#0077b6] cursor-pointer rounded-md">
              View Inventory
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-[#005f8f] cursor-pointer">
          <FileText className="w-5 h-5 " />
          <span>Reports</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
