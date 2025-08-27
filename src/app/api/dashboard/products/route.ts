import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import "@/models/categoryModel";
import fs from "fs/promises";
import path from "path";
import { getUserFromToken } from "@/lib/getUserFromToken";

export async function GET(req: NextRequest) {
  await connect();
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("category");

  try {
    const user = await getUserFromToken(req);

    // If user is not authenticated
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query with userId and optional category
    const query: any = { userId: user.id };
    if (categoryId) {
      query.category = categoryId;
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    const formatted = products.map((product, index) => ({
      _id: product._id,
      index: index + 1,
      name: product.name,
      image: product.image,
      category: product.category?.name || "N/A",
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

export async function POST(req: NextRequest) {
  await connect();

  try {
    const user = getUserFromToken(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const brand = formData.get("brand") as string;
    const description = formData.get("description") as string;
    const attributesRaw = formData.get("attributes") as string;
    const imageFile = formData.get("image") as File;

    if (!name || !category || !attributesRaw) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let attributes;
    try {
      attributes = JSON.parse(attributesRaw);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid attributes format" },
        { status: 400 }
      );
    }

    // Save image to /public/uploads
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

    const newProduct = await Product.create({
      name,
      category,
      brand,
      description,
      attributes,
      image: imagePath,
      userId: user.id, // ✅ Correct field for schema
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
