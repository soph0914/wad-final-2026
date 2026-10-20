//src/app/api/user/route.js

import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { ROLES } from "@/lib/constant";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// GET /api/user -> the currently logged-in user (used to restore a session)
export async function GET(req) {
  try {
    const me = getUserFromHeaders(req);
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(me.id) }, { projection: { password: 0 } });

    if (!user) {
      return errorResponse("User not found", 404);
    }
    return successResponse(
      {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      200,
    );
  } catch (error) {
    printExceptionLog("GET /api/user", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/user (public) -> register { username, email, password, role }
export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const username = String(body?.username ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = typeof body?.password === "string" ? body.password : "";
    const role = body?.role;

    if (username.length < 3) {
      return errorResponse("Username must be at least 3 characters", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("A valid email is required", 400);
    }
    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }
    if (!ROLES.includes(role)) {
      return errorResponse("Role must be student or teacher", 400);
    }

    const db = await getDb();
    const users = db.collection("users");

    const existing = await users.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return errorResponse("Email or username already in use", 409);
    }

    const result = await users.insertOne({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      createdAt: new Date(),
    });

    return successResponse(
      { message: "User created", id: result.insertedId.toString() },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse("Email or username already in use", 409);
    }
    printExceptionLog("POST /api/user", error);
    return errorResponse("Internal server error", 500);
  }
}
