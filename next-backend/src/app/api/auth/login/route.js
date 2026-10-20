//src/app/api/auth/login/route.js

import bcrypt from "bcrypt";
import { getDb } from "@/lib/mongodb";
import { signJWT, tokenCookieOptions } from "@/lib/auth";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// POST /api/auth/login  { email | username | identifier, password }
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const identifier = String(
      body?.identifier ?? body?.email ?? body?.username ?? "",
    ).trim();
    const password = typeof body?.password === "string" ? body.password : "";

    if (!identifier || !password) {
      return errorResponse("Email/username and password are required", 400);
    }

    const db = await getDb();
    const user = await db.collection("users").findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
    });

    // Same message for unknown user and wrong password.
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!ok) {
      return errorResponse("Invalid email/username or password", 401);
    }

    const token = signJWT(user);
    const res = successResponse(
      {
        message: "Login successful",
        token, // fallback for browsers that block third-party cookies
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      200,
    );
    res.cookies.set("token", token, tokenCookieOptions);
    return res;
  } catch (error) {
    printExceptionLog("POST /api/auth/login", error);
    return errorResponse("Internal server error", 500);
  }
}
