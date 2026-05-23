import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Evita que Turbopack use el package-lock.json del repo padre como raíz del workspace. */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";

function buildSecurityHeaders() {
  const connectSrc = isDev
    ? [
        "'self'",
        "https:",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "ws://localhost:3000",
        "ws://127.0.0.1:3000",
        "ws://localhost:3001",
        "ws://127.0.0.1:3001",
      ].join(" ")
    : "'self' https:";

  return [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(self), microphone=(), geolocation=()",
    },
    {
      key: "Content-Security-Policy",
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.unsplash.com",
        `connect-src ${connectSrc}`,
        "font-src 'self' data:",
        "frame-ancestors 'none'",
      ].join("; "),
    },
  ];
}

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
  },
  async headers() {
    // En desarrollo, sin CSP: evita bloquear HMR (WebSocket) y facilita depuración.
    if (isDev) return [];
    return [{ source: "/(.*)", headers: buildSecurityHeaders() }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
