// src/lib/getUserFromToken.ts
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const getUserFromToken = (req: NextRequest) => {
  const token = req.cookies.get("token")?.value;
  if (!token) throw new Error("Unauthorized");

  try {
    const user = jwt.verify(token, process.env.TOKEN_SECRET!);
    return user as { id: string; email: string; username: string };
  } catch (err) {
    console.error("JWT verification failed:", err);
    throw new Error("Invalid token");
  }
};
