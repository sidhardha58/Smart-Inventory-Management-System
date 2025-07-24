import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";

// Register Category model so `.populate("category")` works
import "@/models/categoryModel";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ GET all products with category name and raw attributes
export async function GET() {
  await connect();
  try {
    const products = await Product.find()
      .populate("category", "name") // get category name
      .sort({ createdAt: -1 });

    const formatted = products.map((product, index) => ({
      id: product._id,
      index: index + 1,
      name: product.name,
      image: product.image,
      category: product.category?.name || "N/A",
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

// ✅ POST product with embedded attributes
export async function POST(req: NextRequest) {
  await connect();
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const brand = formData.get("brand") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as string;
    const attributesRaw = formData.get("attributes") as string;

    if (!name || !category || !attributesRaw) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let attributes;
    try {
      attributes = JSON.parse(attributesRaw); // should be an array of objects
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid attributes JSON" },
        { status: 400 }
      );
    }

    const newProduct = await Product.create({
      name,
      category,
      description,
      image,
      attributes,
    });

    return NextResponse.json({
      message: "Product created",
      product: newProduct,
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
