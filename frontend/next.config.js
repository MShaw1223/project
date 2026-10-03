/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

// sent on every page: no framing (clickjacking of the confirm/delete buttons), no MIME sniffing, and
// only the origin in cross-site referrers
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

// HSTS pins the site to https, only meaningful (and only safe) when production is served over https
if (process.env.NODE_ENV === "production") {
  securityHeaders.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
}

const nextConfig = {
  reactStrictMode: true,
  // self-contained server.js + minimal node_modules for the container image (see Dockerfile)
  output: "standalone",
  // proxies /backend/* to the Go server so the browser stays same-origin (the Go server has no CORS middleware)
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
