/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude pdf-parse and pdfjs-dist from server-side bundling
  // These packages are not compatible with webpack bundling
  serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      const originalExternals = config.externals || [];
      config.externals = [
        ...(Array.isArray(originalExternals)
          ? originalExternals
          : [originalExternals]),
        ({ request }, callback) => {
          if (!request) return callback(null);
          if (request === "pdf-parse" || request.startsWith("pdf-parse/")) {
            return callback(null, `commonjs ${request}`);
          }
          if (request === "pdfjs-dist" || request.startsWith("pdfjs-dist/")) {
            return callback(null, `commonjs ${request}`);
          }
          if (typeof originalExternals === "function") {
            return originalExternals({ request }, callback);
          }
          callback(null);
        },
      ];
    }
    return config;
  },

  // Do not expose server source maps in production
  productionBrowserSourceMaps: false,

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
