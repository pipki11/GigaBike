import type { NextConfig } from "next";

// Baseline security headers applied to every response. CSP is intentionally
// omitted here (the Google Maps embed + Next inline styles need a tuned policy);
// these are the safe, high-value headers with no breakage risk.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile the workspace packages (they ship raw TS/TSX).
  transpilePackages: ["@gigabike/ui", "@gigabike/supabase"],
  images: {
    remotePatterns: [
      // Supabase Storage public bucket (bike images, added next pass)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
