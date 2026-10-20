//src/app/api/user/[user_id]/route.js

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getUserFromHeaders } from "@/lib/auth";
import { isValidId } from "@/lib/course";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";

// GET /api/user/:user_id -> a user can only read their own profile
export async function GET(req, { params }) {
  try {
    const { user_id } = await params;
    const me = getUserFromHeaders(req);

    if (!isValidId(user_id)) {
      return errorResponse("Invalid user id", 400);
    }
    if (user_id !== me.id) {
      return errorResponse("Forbidden", 403);
    }

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user_id) }, { projection: { password: 0 } });

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
    printExceptionLog("GET /api/user/[user_id]", error);
    return errorResponse("Internal server error", 500);
  }
}
