import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attribute from "@/models/attributeModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// GET: Fetch attributes for logged-in user
export async function GET(req: NextRequest) {
  await connect();
  try {
    const user = await getUserFromToken(req);
    const attributes = await Attribute.find({ userId: user.id }).sort({
      _id: 1,
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.error("GET error:", error);
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
    const user = await getUserFromToken(req);
    const data = await req.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const metricsArray = Array.isArray(data.metrics)
      ? data.metrics
      : typeof data.metrics === "string"
      ? data.metrics
          .split(",")
          .map((m: string) => m.trim())
          .filter(Boolean)
      : [];

    const newAttribute = new Attribute({
      name: data.name.trim(),
      metrics: metricsArray,
      userId: user.id,
    });

    await newAttribute.save();

    return NextResponse.json({
      message: "Attribute created",
      attribute: newAttribute,
    });
  } catch (error) {
    console.error("POST error:", error);
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
    const user = await getUserFromToken(req);
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await Attribute.findOneAndDelete({
      _id: id,
      userId: user.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Attribute not found or not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Attribute deleted" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete attribute" },
      { status: 500 }
    );
  }
}
