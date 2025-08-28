import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import Product from "@/models/productModel";
import { getUserFromToken } from "@/lib/getUserFromToken";

// ✅ GET: Fetch inventory for the current user
export async function GET(req: NextRequest) {
  try {
    await connect();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await Product.find({ userId: user.id })
      .populate("category", "name")
      .lean();

    const inventory = products.map((product) => {
      return {
        _id: product._id,
        name: product.name,
        category:
          typeof product.category === "object"
            ? product.category?.name || "-"
            : product.category || "-",
        price: product.attributes?.[0]?.price || 0,
        inventory: product.attributes?.[0]?.inventory ?? 0,
        image: product.image || null,
      };
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// ✅ PATCH: Update inventory for a product
export async function PATCH(req: NextRequest) {
  try {
    await connect();

    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, inventory } = await req.json();
    const parsedInventory = Number(inventory);

    if (!productId || isNaN(parsedInventory) || parsedInventory < 0) {
      return NextResponse.json(
        { error: "Invalid product ID or inventory" },
        { status: 400 }
      );
    }

    const product = await Product.findOne({
      _id: productId,
      userId: user.id,
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    product.attributes[0].inventory = parsedInventory;
    await product.save();

    return NextResponse.json({
      message: "Inventory updated successfully",
      product: { _id: product._id, inventory: product.inventory },
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}
