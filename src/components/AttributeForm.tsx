"use client";
import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";

type AttributeData = {
  attribute: string;
  value: string;
  soldAs: string;
  price: number;
  buyingPrice: number; // ✅ Added
  inventory: number;
  tax: string;
};

interface AttributeFormProps {
  onSave: (data: AttributeData) => void;
  onClose: () => void;
  initialData?: AttributeData | null;
}

const AttributeForm: React.FC<AttributeFormProps> = ({
  onSave,
  onClose,
  initialData,
}) => {
  const [form, setForm] = useState<AttributeData>({
    attribute: "",
    value: "",
    soldAs: "",
    price: 0,
    buyingPrice: 0, // ✅ Initial value
    inventory: 0,
    tax: "",
  });

  const [attributes, setAttributes] = useState<
    { name: string; metrics: string[] }[]
  >([]);
  const [dropdownOpen, setDropdownOpen] = useState({
    attribute: false,
    value: false,
    soldAs: false,
    tax: false,
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/dashboard/attributes")
      .then((res) => res.json())
      .then((data) => setAttributes(data))
      .catch((err) => console.error("Error fetching attributes:", err));
  }, []);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setDropdownOpen({
          attribute: false,
          value: false,
          soldAs: false,
          tax: false,
        });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]:
        name === "price" || name === "buyingPrice" || name === "inventory"
          ? parseInt(value) || 0
          : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.attribute ||
      !form.value ||
      !form.soldAs ||
      !form.tax ||
      !form.price ||
      !form.buyingPrice || // ✅ Validate buying price
      !form.inventory
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave(form);
    onClose();
  };

  const dropdownStyle = `absolute z-10 bg-white text-black rounded-md shadow-md mt-1 w-full max-h-40 overflow-y-auto`;
  const dropdownOptions = (
    field: keyof typeof dropdownOpen,
    options: string[]
  ) =>
    dropdownOpen[field] && (
      <div className={dropdownStyle}>
        <div className="h-[2px] bg-[#0077b6] mb-1" />
        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => {
              setForm({ ...form, [field]: opt });
              setDropdownOpen({ ...dropdownOpen, [field]: false });
            }}
            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 hover:text-[#0077b6] ${
              form[field] === opt ? "bg-gray-100 text-[#0077b6]" : ""
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
    );

  const selectedAttr = attributes.find((a) => a.name === form.attribute);
  const metricOptions = selectedAttr?.metrics || [];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        ref={formRef}
        className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">Add Attributes / Price</h2>
          <button
            onClick={onClose}
            className="text-gray-500 text-2xl cursor-pointer"
          >
            <X />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4 flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Attribute Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-1">Attribute *</label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white"
                onClick={() =>
                  setDropdownOpen({
                    ...dropdownOpen,
                    attribute: !dropdownOpen.attribute,
                  })
                }
              >
                <span
                  className={form.attribute ? "text-black" : "text-gray-400"}
                >
                  {form.attribute || "Select Attribute"}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    dropdownOpen.attribute ? "rotate-90" : ""
                  }`}
                />
              </div>
              {dropdownOptions(
                "attribute",
                attributes.map((a) => a.name)
              )}
            </div>

            {/* Value Dropdown */}
            <div className="relative">
              <label className="block font-medium mb-1">
                Attribute Value *
              </label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white"
                onClick={() =>
                  setDropdownOpen({
                    ...dropdownOpen,
                    value: !dropdownOpen.value,
                  })
                }
              >
                <span className={form.value ? "text-black" : "text-gray-400"}>
                  {form.value || "Select Value"}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    dropdownOpen.value ? "rotate-90" : ""
                  }`}
                />
              </div>
              {dropdownOptions("value", metricOptions)}
            </div>

            {/* Sold As */}
            <div className="relative">
              <label className="block font-medium mb-1">Sold As *</label>
              <div
                className="flex items-center justify-between border px-3 py-2 rounded-md cursor-pointer hover:bg-gray-200 bg-white"
                onClick={() =>
                  setDropdownOpen({
                    ...dropdownOpen,
                    soldAs: !dropdownOpen.soldAs,
                  })
                }
              >
                <span className={form.soldAs ? "text-black" : "text-gray-400"}>
                  {form.soldAs || "Select Type"}
                </span>
                <ChevronRight
                  className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                    dropdownOpen.soldAs ? "rotate-90" : ""
                  }`}
                />
              </div>
              {dropdownOptions("soldAs", ["Piece", "Pack", "Kg"])}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="text"
                name="price"
                inputMode="numeric"
                pattern="\d*"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter product price in ₹"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* ✅ Buying Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Buying Price (₹) *
              </label>
              <input
                type="text"
                name="buyingPrice"
                inputMode="numeric"
                pattern="\d*"
                value={form.buyingPrice}
                onChange={handleChange}
                placeholder="Enter buying price in ₹"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Inventory */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Stock Available *
              </label>
              <input
                type="text"
                name="inventory"
                inputMode="numeric"
                pattern="\d*"
                value={form.inventory}
                onChange={handleChange}
                placeholder="Enter quantity in stock"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Tax */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tax Rate (%) *
              </label>
              <input
                type="text"
                name="tax"
                inputMode="numeric"
                pattern="\d*"
                value={form.tax}
                onChange={handleChange}
                placeholder="Enter tax percentage"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-[#0077b6] hover:bg-[#005f87] text-white px-6 py-2 rounded w-full cursor-pointer"
            >
              ✅ Add
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AttributeForm;
