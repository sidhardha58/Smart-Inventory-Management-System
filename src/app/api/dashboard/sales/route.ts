import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Sale from "@/models/salesModel";
import Product from "@/models/productModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// GET: Fetch all sales for current user with product image
export async function GET(req: NextRequest) {
  try {
    await connect();
    const user = await getUserFromToken(req);

    const sales = await Sale.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .lean();

    const productIds = sales.map((sale) => sale.productId.toString());
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productImageMap: Record<string, string> = {};
    for (const product of products) {
      productImageMap[product._id.toString()] =
        product.image || "/images/image.png";
    }

    const salesWithImages = sales.map((sale) => ({
      ...sale,
      image: productImageMap[sale.productId.toString()] || "/images/image.png",
    }));

    return NextResponse.json(salesWithImages);
  } catch (error) {
    console.error("Failed to fetch sales:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

// POST: Create one or more sales and sync inventory
export async function POST(req: NextRequest) {
  try {
    await connect();
    const user = await getUserFromToken(req);
    const body = await req.json();

    // Handle single sale
    if (body.productId && body.quantity) {
      const { productId, quantity, tax = 0 } = body;

      const product = await Product.findById(productId); // NO .lean()
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      const attribute = product.attributes?.[0];
      if (!attribute || typeof attribute.inventory !== "number") {
        return NextResponse.json(
          { error: `Inventory not defined for ${product.name}` },
          { status: 400 }
        );
      }

      if (attribute.inventory < quantity) {
        return NextResponse.json(
          { error: `Only ${attribute.inventory} in stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = attribute.price || 0;
      const soldAs = attribute.soldAs || "Unit";
      const appliedTax = attribute.tax ?? tax;

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

      attribute.inventory -= quantity;
      await product.save();

      return NextResponse.json(
        { message: "Sale added", sale: newSale },
        { status: 201 }
      );
    }

    // Handle multiple sales
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

      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found for ID: ${productId}` },
          { status: 404 }
        );
      }

      const attribute = product.attributes?.[0];
      if (!attribute || typeof attribute.inventory !== "number") {
        return NextResponse.json(
          { error: `Inventory not defined for ${product.name}` },
          { status: 400 }
        );
      }

      if (attribute.inventory < quantity) {
        return NextResponse.json(
          { error: `Only ${attribute.inventory} in stock for ${product.name}` },
          { status: 400 }
        );
      }

      const price = attribute.price || 0;
      const soldAs = attribute.soldAs || "Unit";
      const appliedTax = attribute.tax ?? 0;

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

      attribute.inventory -= quantity;
      await product.save();

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
