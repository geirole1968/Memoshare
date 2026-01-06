import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@memoshare/ui", "@memoshare/core"],
};

export default nextConfig;
