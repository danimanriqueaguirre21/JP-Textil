import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Evita que Turbopack use el package-lock.json del repo padre como raíz del workspace. */
const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: turbopackRoot,
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
