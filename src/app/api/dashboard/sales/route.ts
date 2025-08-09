import { NextResponse, NextRequest } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Sale from "@/models/salesModel";
import Product from "@/models/productModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// ✅ GET: Fetch all sales for current user
export async function GET(req: NextRequest) {
  try {
    await connect();
    const user = await getUserFromToken(req); // ✅ Await and pass req
    const sales = await Sale.find({ userId: user.id }).sort({ createdAt: -1 });
    return NextResponse.json(sales);
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create one or more sales
export async function POST(req: NextRequest) {
  try {
    await connect();
    const user = await getUserFromToken(req); // ✅ Await and pass req
    const body = await req.json();

    // Single sale
    if (body.productId && body.quantity) {
      const { productId, quantity, tax = 0 } = body;

      const product = await Product.findById(productId).lean();
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const attribute = product.attributes?.[0];
      const price = attribute?.price || 0;
      const soldAs = attribute?.soldAs || "Unit";
      const appliedTax = attribute?.tax ?? tax;

      const lastSale = await Sale.findOne({ userId: user.id }).sort({
        saleId: -1,
      });
      const newSaleId = lastSale ? lastSale.saleId + 1 : 1;

      const totalPrice = price * quantity * (1 + appliedTax / 100);

      const newSale = await Sale.create({
        saleId: newSaleId,
        productId: product._id,
        productName: product.name,
        price,
        soldAs,
        quantity,
        tax: appliedTax,
        totalPrice,
        userId: user.id,
      });

      return NextResponse.json(
        { message: "Sale added", sale: newSale },
        { status: 201 }
      );
    }

    // Multiple sales
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty sales list" },
        { status: 400 }
      );
    }

    const lastSale = await Sale.findOne({ userId: user.id }).sort({
      saleId: -1,
    });
    let currentSaleId = lastSale ? lastSale.saleId + 1 : 1;

    const saleRecords = [];

    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity) continue;

      const product = await Product.findById(productId).lean();
      if (!product) continue;

      const attribute = product.attributes?.[0];
      const price = attribute?.price || 0;
      const soldAs = attribute?.soldAs || "Unit";
      const appliedTax = attribute?.tax ?? 0;

      const totalPrice = price * quantity * (1 + appliedTax / 100);

      const sale = await Sale.create({
        saleId: currentSaleId++,
        productId: product._id,
        productName: product.name,
        price,
        soldAs,
        quantity,
        tax: appliedTax,
        totalPrice,
        userId: user.id,
      });

      saleRecords.push(sale);
    }

    return NextResponse.json(
      { message: "Sales added", sales: saleRecords },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sale creation failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
