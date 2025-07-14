"use client";

import React from "react";
import Sidebar from "@/components/Sidebar"; // adjust path if needed

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
