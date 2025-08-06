import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import "@/models/categoryModel";

export async function GET(req: NextRequest) {
  await connect();

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");

  try {
    // ✅ If filtering by category
    if (categoryId) {
      const filteredProducts = await Product.find({ category: categoryId });

      const simplified = filteredProducts.map((p) => ({
        _id: p._id,
        name: p.name,
        price: p.attributes?.[0]?.price || 0,
        soldAs: p.attributes?.[0]?.soldAs || "unit",
        attributes:
          p.attributes?.map((attr: any) => ({
            name: attr.attribute || "N/A",
            value: attr.value || "",
          })) || [],
      }));

      return NextResponse.json(simplified);
    }

    // ✅ Otherwise return all products, formatted with all fields
    const products = await Product.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const formatted = products.map((product, index) => ({
      _id: product._id,
      index: index + 1,
      name: product.name,
      image: product.image,
      category: product.category?.name || "N/A",

      // ✅ top-level price and soldAs for frontend compatibility
      price: product.attributes?.[0]?.price || 0,
      soldAs: product.attributes?.[0]?.soldAs || "unit",

      attributes: (product.attributes || []).map((attr: any) => ({
        attributeName: attr.attribute || "N/A",
        value: attr.value || "",
        price: attr.price || 0,
        inventory: attr.inventory || 0,
        tax: attr.tax || 0,
        soldAs: attr.soldAs || "",
      })),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
