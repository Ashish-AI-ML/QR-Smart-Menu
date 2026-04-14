import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudinary images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
