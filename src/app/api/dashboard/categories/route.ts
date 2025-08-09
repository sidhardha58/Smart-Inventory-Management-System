import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Category from "@/models/categoryModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// ✅ GET: Return categories for the logged-in user
export async function GET(req: NextRequest) {
  await connect();

  try {
    const user = getUserFromToken(req);

    const categories = await Category.find(
      { userId: user.id },
      "_id name"
    ).sort({ _id: 1 });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create a new category for the logged-in user
export async function POST(req: NextRequest) {
  await connect();

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const user = getUserFromToken(req);
    console.log("Authenticated user:", user); // ✅ Log it

    const newCategory = await Category.create({
      name: name.trim(),
      userId: user.id,
    });

    return NextResponse.json({
      message: "Category created",
      category: newCategory,
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove a category owned by the logged-in user
export async function DELETE(req: NextRequest) {
  await connect();

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const user = getUserFromToken(req);

    const deleted = await Category.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
