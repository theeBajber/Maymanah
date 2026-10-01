import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  allowedDevOrigins: [
    "https://unpotent-luka-hypotonic.ngrok-free.dev/",
    "192.168.1.210",
  ],
};

export default nextConfig;
