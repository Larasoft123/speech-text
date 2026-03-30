import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @huggingface/transformers and onnxruntime-node are in the default
  // opt-out list, but we list them explicitly for clarity.
  // Using --webpack flag in dev (not Turbopack) so webpack handles bundling.
  serverExternalPackages: ["onnxruntime-node", "@huggingface/transformers"],
  reactCompiler: true,
  experimental: {
    viewTransition: true,
  },
  output: "standalone",
};

export default nextConfig;
