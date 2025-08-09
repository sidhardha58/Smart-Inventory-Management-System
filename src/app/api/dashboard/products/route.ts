import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import "@/models/categoryModel"; // Needed for .populate("category")
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: NextRequest) {
  await connect();

  try {
    const user = await getUserFromToken(req); // ✅ Use request with await
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category");

    const filter: any = { userId: user.id };

    if (categoryId) {
      filter.category = categoryId;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const formatted = products.map((product, index) => ({
      _id: product._id,
      index: index + 1,
      name: product.name,
      image: product.image,
      category: product.category?.name || "N/A",

      // Top-level price and soldAs
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
