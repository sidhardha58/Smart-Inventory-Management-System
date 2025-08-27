import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attribute from "@/models/attributeModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// GET: Fetch attributes for logged-in user
export async function GET(req: NextRequest) {
  await connect();

  try {
    const user = getUserFromToken(req); // get full user object
    const attributes = await Attribute.find({ userId: user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json(attributes);
  } catch (error: any) {
    console.error("GET error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

// POST: Add new attribute for logged-in user
export async function POST(req: NextRequest) {
  await connect();

  try {
    const user = getUserFromToken(req);
    const data = await req.json();

    const name = data.name?.trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const metricsArray = Array.isArray(data.metrics)
      ? data.metrics.map((m: string) => m.trim()).filter(Boolean)
      : typeof data.metrics === "string"
      ? data.metrics
          .split(",")
          .map((m: string) => m.trim())
          .filter(Boolean)
      : [];

    if (metricsArray.length === 0) {
      return NextResponse.json(
        { error: "At least one metric is required" },
        { status: 400 }
      );
    }

    const newAttribute = new Attribute({
      name,
      metrics: metricsArray,
      userId: user.id, // <-- use user.id here
    });

    await newAttribute.save();

    return NextResponse.json({
      message: "Attribute created",
      attribute: newAttribute,
    });
  } catch (error: any) {
    console.error("POST error:", error.message);
    return NextResponse.json(
      { error: "Failed to create attribute" },
      { status: 500 }
    );
  }
}

// DELETE: Remove attribute by ID (only if it belongs to user)
export async function DELETE(req: NextRequest) {
  await connect();

  try {
    const user = getUserFromToken(req);
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await Attribute.findOneAndDelete({
      _id: id,
      userId: user.id, // <-- use user.id here too
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Attribute not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Attribute deleted" });
  } catch (error: any) {
    console.error("DELETE error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
