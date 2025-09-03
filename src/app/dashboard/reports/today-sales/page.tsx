"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Sidebar from "@/components/Sidebar";

console.log("autoTable:", autoTable);

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Sale {
  _id: string;
  productId: string;
  productName: string;
  price: number;
  soldAs: string;
  quantity: number;
  tax: number;
  totalPrice: number;
  createdAt: string;
  buyingPrice: number; // ✅ Corrected
}

const ITEMS_PER_PAGE = 10;

const TodaySales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTodaySales();
  }, []);

  const fetchTodaySales = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/dashboard/reports/today-sales");
      const fetchedSales = res.data.sales || [];

      // ✅ Sort by latest first
      const sortedSales = fetchedSales.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setSales(sortedSales);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to load sales.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const lastIndex = currentPage * ITEMS_PER_PAGE;
  const firstIndex = lastIndex - ITEMS_PER_PAGE;
  const currentSales = sales.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);

  const totalProfit = sales.reduce((acc, sale) => {
    const profitPerUnit = sale.price - sale.buyingPrice;
    return acc + profitPerUnit * sale.quantity;
  }, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const exportToExcel = () => {
    const wsData = sales.map((sale) => ({
      "Product Name": sale.productName,
      Price: sale.price,
      Quantity: sale.quantity,
      Tax: `${sale.tax}%`,
      "Total Price": sale.totalPrice,
      "Buying Price": sale.buyingPrice,
      Profit: (sale.price - sale.buyingPrice) * sale.quantity,
      "Sold As": sale.soldAs,
      "Sale Date": new Date(sale.createdAt).toLocaleString("en-GB"),
    }));

    // Add an empty row for spacing (optional)
    wsData.push({});

    // Add the total profit row
    wsData.push({
      "Product Name": "Total Profit",
      Profit: totalProfit, // assuming totalProfit is computed in your component
    });

    const worksheet = XLSX.utils.json_to_sheet(wsData, { skipHeader: false });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Today Sales");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    const now = new Date();

    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const weekday = now.toLocaleDateString("en-GB", {
      weekday: "short",
    });

    const fileName = `${formattedDate} (${weekday}) Sales Report.xlsx`;
    saveAs(data, fileName);
  };

  const exportToPDF = () => {
    const now = new Date();

    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const weekday = now.toLocaleDateString("en-GB", {
      weekday: "short",
    });

    const fileName = `${formattedDate} (${weekday}) Sales Report.pdf`;

    const doc = new jsPDF();
    doc.setFont("Times-Roman", "bold");
    doc.text(`Today Sales Report : ${formattedDate} (${weekday})`, 14, 20);

    const tableColumn = [
      "Product Name",
      "Price",
      "Quantity",
      "Tax",
      "Total Price",
      "Buying Price",
      "Profit",
      "Sold As",
      "Sales Date & Time",
    ];

    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("en-IN", {
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);

    const tableRows = sales.map((sale) => [
      sale.productName,
      formatCurrency(sale.price),
      sale.quantity,
      `${sale.tax}%`,
      formatCurrency(sale.totalPrice),
      formatCurrency(sale.buyingPrice) ?? 0,
      formatCurrency((sale.price - sale.buyingPrice) * sale.quantity),
      sale.soldAs,
      new Date(sale.createdAt).toLocaleString("en-GB"),
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      styles: {
        halign: "center", // center text horizontally
        valign: "middle", // center text vertically (default is 'top')
      },
      startY: 30,
    });

    // Add total profit text below the table
    const finalY = (doc as any).lastAutoTable.finalY || 40;

    doc.setFont("Times-Roman", "bold");
    doc.setFontSize(12);
    doc.text(
      `Total Profit: ${totalProfit.toLocaleString("en-IN", {
        maximumFractionDigits: 0,
      })}`,
      14,
      finalY + 15
    );

    doc.save(fileName);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-50">
        {/* Header + Export Buttons */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Today&rsquo;s Sales</h1>

          <div className="flex gap-2">
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
            >
              Export Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              Export PDF
            </button>
          </div>
        </div>

        {loading && <p>Loading sales...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200  text-center">
                    {[
                      "Product",
                      "Unit Price",
                      "Quantity",
                      "Tax",
                      "Selling Price",
                      "Cost",
                      "Profit",
                      "Sold As",
                      "Date & Time",
                    ].map((header) => (
                      <th
                        key={header}
                        className="border border-gray-300 px-3 py-1  text-center"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale) => {
                    const profit =
                      (sale.price - sale.buyingPrice) * sale.quantity;
                    return (
                      <tr
                        key={sale._id}
                        className="hover:bg-gray-100  text-center"
                      >
                        <td className="border border-gray-300 px-3 py-1">
                          {sale.productName}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {formatCurrency(sale.price)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {sale.quantity}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {sale.tax}%
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {formatCurrency(sale.totalPrice)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {formatCurrency(sale.buyingPrice * sale.quantity)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {formatCurrency(profit)}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {sale.soldAs}
                        </td>
                        <td className="border border-gray-300 px-3 py-1">
                          {new Date(sale.createdAt).toLocaleString("en-GB")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-end items-center gap-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={`px-3 py-1 border rounded transition ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="font-medium">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className={`px-3 py-1 border rounded transition ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>

            <div className="mt-4 font-bold text-2xl">
              Total Profit: {formatCurrency(totalProfit)}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default TodaySales;
