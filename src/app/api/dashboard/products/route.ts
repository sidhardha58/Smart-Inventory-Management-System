import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import "@/models/categoryModel";

import path from "path";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ✅ GET all products
export async function GET() {
  await connect();
  try {
    const products = await Product.find()
      .populate("category", "name")
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

// ✅ POST product (without brand)
export async function POST(req: NextRequest) {
  await connect();
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const attributesRaw = formData.get("attributes") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !category || !attributesRaw) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse attributes JSON
    let attributes;
    try {
      attributes = JSON.parse(attributesRaw);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid attributes JSON" },
        { status: 400 }
      );
    }

    // Save image to /public/uploads and store path
    let imagePath = "";
    if (imageFile && typeof imageFile === "object") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const fileName = `${Date.now()}-${imageFile.name}`;
      const fullPath = path.join(uploadsDir, fileName);

      await fs.writeFile(fullPath, buffer);
      imagePath = `/uploads/${fileName}`;
    }

    // Create product without brand
    const newProduct = await Product.create({
      name,
      description,
      category,
      attributes,
      image: imagePath,
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
