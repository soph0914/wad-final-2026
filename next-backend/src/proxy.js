import { NextResponse } from "next/server";
import { verifyJWT } from "./lib/auth";
import corsHeaders from "./lib/cors";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./lib/constant";

// Operations that do not need a logged-in user.
const PUBLIC_ROUTES = [
  { path: "/api/auth/login", method: "POST" },
  { path: "/api/auth/logout", method: "POST" },
  { path: "/api/user", method: "POST" }, // register
];

export function proxy(request) {
  // CORS preflight carries no cookie, so answer it before the auth check.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const pathname = request.nextUrl.pathname.replace(/\/+$/, "");
  const isPublic = PUBLIC_ROUTES.some(
    (r) => r.path === pathname && r.method === request.method,
  );
  if (isPublic) {
    return NextResponse.next();
  }

  const user = verifyJWT(request);

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized Request",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(X_HEADER_USER_ID, user.id);
  requestHeaders.set(X_HEADER_USER_EMAIL, user.email);
  requestHeaders.set(X_HEADER_USER_NAME, user.username);
  requestHeaders.set(X_HEADER_USER_ROLE, user.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/api/:path*"],
};
