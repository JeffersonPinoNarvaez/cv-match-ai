/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js (webpack) not to bundle these packages — let Node.js load them
  // at runtime via its native module system. This is required for packages that
  // ship ESM-only builds or that use native add-ons.
  // In Next.js 14.x this lives under `experimental`. It moved to the top level
  // (`serverExternalPackages`) in Next.js 15.
  experimental: {
    serverComponentsExternalPackages: ["unpdf"],
  },

  // Do not expose server source maps in production
  productionBrowserSourceMaps: false,

  // Skip ESLint during production builds to avoid CLI option incompatibilities.
  // You can still run `npm run lint` locally.
  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/.env",
        destination: "/404",
        permanent: false,
      },
      {
        source: "/.env.local",
        destination: "/404",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
