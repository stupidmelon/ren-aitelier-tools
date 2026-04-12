import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Next.js dev server blocks `/_next/*` and `/_next/webpack-hmr` (WebSocket)
   * unless the browser `Origin` host is allowlisted. Quick tunnels and custom
   * dev domains each need their own pattern or the dev server answers 403
   * "Unauthorized" (Caddy may log that as a malformed HTTP response on upgrade).
   *
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "*.cfargotunnel.com",
    "*.ren-aitelier-tools.com",
    "ren-aitelier-tools.com",
  ],
};

export default nextConfig;
