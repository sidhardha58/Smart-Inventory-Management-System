// app/api/dashboard/products/route.ts

import { NextResponse } from "next/server";
import Product from "@/models/productModel";
import { connect } from "@/dbConfig/dbConfig";

export async function POST(req: Request) {
  try {
    await connect();
    const body = await req.json();

    const {
      title,
      description,
      price,
      costPrice,
      quantity,
      image,
      category,
      attributes,
    } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = new Product({
      title,
      description,
      price,
      costPrice,
      quantity,
      image,
      category,
      attributes,
    });

    await product.save();

    return NextResponse.json(
      { message: "Product added successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/dashboard/products error:", error);
    return NextResponse.json(
      { error: "Failed to add product" },
      { status: 500 }
    );
  }
}
