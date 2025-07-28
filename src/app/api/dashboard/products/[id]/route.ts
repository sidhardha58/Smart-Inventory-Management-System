import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { NextRequest, NextResponse } from "next/server";
import "@/models/categoryModel";

// ✅ GET: Fetch a product by ID
export async function GET(req: NextRequest) {
  await connect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const product = await Product.findById(id).populate("category", "name");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formatted = {
      id: product._id,
      name: product.name,
      image: product.image,
      categoryId: product.category?._id || "",
      description: product.description || "",
      attributes: (product.attributes || []).map((attr: any) => ({
        attribute: attr.attribute || "N/A",
        value: attr.value || "",
        price: attr.price || 0,
        inventory: attr.inventory || 0,
        tax: attr.tax || 0,
        soldAs: attr.soldAs || "",
      })),
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update a product
export async function PUT(
  req: NextRequest,
  { params: routeParams }: { params: { id: string } }
) {
  await connect();

  try {
    const contentType = req.headers.get("content-type");

    if (!contentType?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const attributes = JSON.parse(formData.get("attributes") as string);
    const image = formData.get("image") as File | null;

    const product = await Product.findById(routeParams.id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    product.name = name;
    product.category = category;
    product.description = description;
    product.attributes = attributes;

    if (image && typeof image !== "string") {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64Image = `data:${image.type};base64,${buffer.toString(
        "base64"
      )}`;
      product.image = base64Image;
    }

    await product.save();

    return NextResponse.json({ message: "Product updated", product });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove product by ID
export async function DELETE(req: NextRequest) {
  await connect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
