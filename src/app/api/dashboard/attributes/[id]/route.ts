import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Attribute from "@/models/attributeModel";

// GET a single attribute by ID
export async function GET(
  req: NextRequest,
  { params: routeParams }: { params: { id: string } }
) {
  await connect();

  try {
    const attribute = await Attribute.findById(routeParams.id);

    if (!attribute) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(attribute);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch attribute" },
      { status: 500 }
    );
  }
}

// PUT: Update attribute by ID
export async function PUT(
  req: NextRequest,
  { params: routeParams }: { params: { id: string } }
) {
  await connect();

  try {
    const data = await req.json();
    const { name, metrics } = data;

    console.log("Received in PUT:", { name, metrics });

    const updated = await Attribute.findByIdAndUpdate(
      routeParams.id,
      {
        name,
        metrics,
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Attribute not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Attribute updated",
      attribute: updated,
    });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update attribute" },
      { status: 500 }
    );
  }
}
