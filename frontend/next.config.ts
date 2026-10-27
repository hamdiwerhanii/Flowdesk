import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// No secrets here: everything in `env` is inlined into the browser bundle.
const nextConfig: NextConfig = {
  reactCompiler: true,
  // Self-contained server for the Docker image (no node_modules needed).
  output: "standalone"
};

export default withNextIntl(nextConfig);
