import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attribute from "@/models/attributeModel";

// GET: Fetch all attributes
export async function GET() {
  await connect();
  try {
    const attributes = await Attribute.find().sort({ _id: 1 });
    return NextResponse.json(attributes);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attributes" },
      { status: 500 }
    );
  }
}

// POST: Add new attribute
export async function POST(req: NextRequest) {
  await connect();
  try {
    const data = await req.json();

    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Split metrics string into array
    const metricsArray =
      typeof data.metrics === "string"
        ? data.metrics
            .split(",")
            .map((item: string) => item.trim())
            .filter((item: string) => item !== "")
        : [];

    const newAttribute = new Attribute({
      name: data.name.trim(),
      metrics: metricsArray,
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

// DELETE: Remove attribute by ID
export async function DELETE(req: NextRequest) {
  await connect();
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const deleted = await Attribute.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Attribute not found" },
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
