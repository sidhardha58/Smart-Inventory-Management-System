import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body = await req.json();
    console.log("Received body:", body);
    const { _id, username, email, profileImageURL } = body;
    const password = _id;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username,
        email,
        profileImageURL,
        password,
        isVerified: true,
      });
    }
    console.log("User saved:", user);

    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(tokenData, process.env.TOKEN_SECRET!, {
      expiresIn: "1d",
    });

    const response = NextResponse.json({
      user,
      message: "Login successful",
      success: true,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
