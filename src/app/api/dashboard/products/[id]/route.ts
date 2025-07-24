// app/api/dashboard/products/[id]/route.ts

import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";

// Register models for .populate() to work
import "@/models/categoryModel";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connect();

  try {
    const product = await Product.findById(params.id).populate(
      "category",
      "name"
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      id: product._id,
      name: product.name,
      image: product.image,
      category: product.category?.name || "N/A",
      brand: product.brand || "N/A",
      attributes: (product.attributes || []).map((attr: any) => ({
        attributeName: attr.attribute || "N/A",
        value: attr.value || "",
        price: attr.price || 0,
        inventory: attr.inventory || 0,
        tax: attr.tax || 0,
        soldAs: attr.soldAs || "",
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /products/:id error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
