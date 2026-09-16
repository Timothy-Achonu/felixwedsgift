import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Cloudflare quick tunnels (`*.trycloudflare.com`) change hostname each run.
  allowedDevOrigins: ["*.trycloudflare.com"],
  images: {
    qualities: [75, 85],
    formats: ["image/webp"],
    deviceSizes: [640, 960, 1440, 1920, 2880, 3840],
    imageSizes: [320],
    // Replacements receive new URLs; tags invalidate metadata, not image bytes.
    minimumCacheTTL: 31 * 24 * 60 * 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-*",
      },
      ...(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        ? [
            {
              protocol: "https" as const,
              hostname: "res.cloudinary.com",
              pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/**`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
