import jwt from "jsonwebtoken";
import {
  X_HEADER_USER_EMAIL,
  X_HEADER_USER_ID,
  X_HEADER_USER_NAME,
  X_HEADER_USER_ROLE,
} from "./constant";

const JWT_SECRET = process.env.JWT_SECRET;

// Reads the JWT from the httpOnly "token" cookie. Falls back to an
// "Authorization: Bearer <token>" header for browsers that block
// third-party cookies (frontend and backend are on different domains).
export function verifyJWT(req) {
  try {
    let token = req.cookies.get("token")?.value;

    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}

// Frontend and backend are on different domains in production, so the
// cookie must be SameSite=None; Secure there. On localhost, Lax is enough.
const isProd = process.env.NODE_ENV === "production";
export const tokenCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24,
};

export function signJWT(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" },
  );
}

// The identity set by proxy.js after the token was verified.
// Only trust this inside routes that sit behind the proxy.
export function getUserFromHeaders(req) {
  return {
    id: req.headers.get(X_HEADER_USER_ID),
    username: req.headers.get(X_HEADER_USER_NAME),
    email: req.headers.get(X_HEADER_USER_EMAIL),
    role: req.headers.get(X_HEADER_USER_ROLE),
  };
}
