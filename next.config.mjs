import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the tracing root to this project so a lockfile higher in the tree
  // does not confuse Next's workspace inference on build.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
