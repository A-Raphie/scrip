import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/**": ["./data/**", "./public/fonts/**"],
  },
};

export default nextConfig;
