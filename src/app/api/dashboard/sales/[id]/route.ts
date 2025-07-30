import { connect } from "@/dbConfig/dbConfig";
import Sale from "@/models/salesModel";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET: Fetch a sale by ID
export async function GET(req: NextRequest) {
  await connect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const formatted = {
      id: sale._id,
      saleId: sale.saleId,
      productName: sale.productName,
      price: sale.price,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice,
      soldAs: sale.soldAs,
      tax: sale.tax,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET sale error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Remove sale by ID
export async function DELETE(req: NextRequest) {
  await connect();
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();

  try {
    const deleted = await Sale.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Sale deleted" });
  } catch (error) {
    console.error("DELETE sale error:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
