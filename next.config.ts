import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["c2nwqimso2whfcwd.public.blob.vercel-storage.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn1.iconfinder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
