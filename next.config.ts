import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      // Teacher browsing was removed in favour of automatic matching, so the
      // old landing page now sends visitors to where teachers are described.
      { source: "/teachers", destination: "/about", permanent: true },
    ];
  },
  allowedDevOrigins: [
    "https://unpotent-luka-hypotonic.ngrok-free.dev/",
    "192.168.1.210",
  ],
};

export default nextConfig;
