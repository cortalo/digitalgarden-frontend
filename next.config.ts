import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-tikzjax reads its bundled WASM/LaTeX asset files (core.dump.gz,
  // etc.) from disk relative to its own module path at runtime. Turbopack
  // rewrites that path when it bundles the package, breaking the lookup —
  // this keeps it as a real require()'d Node module instead.
  serverExternalPackages: ["node-tikzjax"],
  images: {
    remotePatterns: [{ hostname: "lh3.googleusercontent.com" }],
  },
};

export default nextConfig;
