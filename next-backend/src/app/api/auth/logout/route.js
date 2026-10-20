//src/app/api/auth/logout/route.js

import { tokenCookieOptions } from "@/lib/auth";
import { successResponse } from "@/lib/utils";

// POST /api/auth/logout  -> clears the auth cookie
export async function POST() {
  const res = successResponse({ message: "Logged out" }, 200);
  res.cookies.set("token", "", { ...tokenCookieOptions, maxAge: 0 });
  return res;
}
