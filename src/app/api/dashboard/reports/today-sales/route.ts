import { connect } from "@/dbConfig/dbConfig";
import { getUserFromToken } from "@/lib/getUserFromToken";
import { NextRequest, NextResponse } from "next/server";
import Sale from "@/models/salesModel";
import Product from "@/models/productModel";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  await connect();

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Define today's date range
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Get today's sales
    const sales = await Sale.find({
      userId: user.id,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    })
      .sort({ createdAt: -1 }) // ✅ Sort: Latest first
      .lean();

    // Collect all unique productIds from sales
    const productIds = [...new Set(sales.map((s) => s.productId.toString()))];

    // Fetch all related products
    const products = await Product.find({
      _id: { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).lean();

    // Map productId → attributes[]
    const productAttrMap = new Map();
    for (const product of products as Array<{
      _id: mongoose.Types.ObjectId;
      attributes: any[];
    }>) {
      productAttrMap.set(product._id.toString(), product.attributes);
    }

    // Helper to normalize string comparison
    const normalize = (val: string) => val?.toString().trim().toLowerCase();

    // Enrich sales with buyingPrice and profit
    const enhancedSales = sales.map((sale) => {
      const attributes = productAttrMap.get(sale.productId.toString()) || [];

      const matchedAttr = attributes.find(
        (a) => normalize(a.soldAs) === normalize(sale.soldAs)
      );

      const buyingPrice = matchedAttr?.buyingPrice ?? 0;
      const profit = (sale.price - buyingPrice) * sale.quantity;

      return {
        ...sale,
        buyingPrice,
        profit,
      };
    });

    // Summary metrics
    const summary = {
      totalOrders: enhancedSales.length,
      totalQty: enhancedSales.reduce((sum, s) => sum + s.quantity, 0),
      totalSales: enhancedSales.reduce((sum, s) => sum + s.totalPrice, 0),
      totalProfit: enhancedSales.reduce((sum, s) => sum + s.profit, 0),
    };

    return NextResponse.json({ sales: enhancedSales, summary });
  } catch (error) {
    console.error("Daily Sales Error:", error);
    return NextResponse.json(
      { error: "Failed to load daily sales" },
      { status: 500 }
    );
  }
}
