import type { NextConfig } from "next";

/** Hosts allowed to serve images through next/image (content API images),
 *  comma-separated, e.g. IMAGE_HOSTS=images.ctfassets.net,cdn.example.com */
const IMAGE_HOSTS = (process.env.IMAGE_HOSTS ?? "images.ctfassets.net").split(",").map((h) => h.trim()).filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/webp"],
    // Up to 3840: the map is zoomed up to 6× and the hi-res layer asks for more than the viewport.
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3840],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: IMAGE_HOSTS.map((hostname) => ({ protocol: "https" as const, hostname })),
  },
  async headers() {
    return [
      { source: "/sample/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
    ];
  },
};

export default nextConfig;
