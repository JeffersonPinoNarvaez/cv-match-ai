import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  const isProd = process.env.NODE_ENV === "production";

  // HSTS (only in production over HTTPS)
  if (isProd) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // Permissions policy — disable unnecessary features
  headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", ")
  );

  // Content Security Policy
  const isDev = !isProd;
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-eval'" : ""} 'unsafe-inline'`.trim(),
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.groq.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  headers.set("Content-Security-Policy", csp);

  // Remove potential framework/server fingerprinting
  headers.delete("X-Powered-By");
  headers.delete("Server");

  const pathname = request.nextUrl.pathname;

  // API specific protections
  if (pathname.startsWith("/api/")) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("X-Data-Retention", "none");
    headers.set("X-Content-Privacy", "in-memory-only");

    // Simple same-origin CORS: allow our own origin(s) and any localhost port
    const origin = request.headers.get("origin");
    const appOrigin = process.env.NEXT_PUBLIC_APP_URL;

    const isLocalhostOrigin = !!origin && /^https?:\/\/localhost(?::\d+)?$/.test(origin);
    const isAppOrigin = !!origin && !!appOrigin && origin === appOrigin;

    const isAllowedOrigin = !origin || isLocalhostOrigin || isAppOrigin;

    if (!isAllowedOrigin) {
      if (request.method === "OPTIONS") {
        return new NextResponse(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": origin || "",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }
      return new NextResponse(null, { status: 403 });
    }

    if (origin && isAllowedOrigin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

