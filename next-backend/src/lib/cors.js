// Origin of the deployed frontend, e.g. https://my-frontend.vercel.app (no trailing slash)
const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");

let corsHeaders = {
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Origin":
    process.env.NODE_ENV == "development"
      ? "http://localhost:5173"
      : frontendUrl,
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default corsHeaders;
