import crypto from "crypto";

/**
 * Validate critical environment variables at server startup.
 * This should only ever run on the server.
 */
export function validateEnvironment(): void {
  if (typeof process === "undefined") return;

  const required = ["GROQ_API_KEY"] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const apiKey = process.env.GROQ_API_KEY as string;
  if (!apiKey.startsWith("gsk_")) {
    throw new Error("GROQ_API_KEY appears malformed (expected to start with 'gsk_').");
  }
}

/**
 * Hash IP addresses before any logging or storage.
 * Uses a configurable salt so hashes are environment-specific.
 */
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "change_me_in_production";
  const hash = crypto.createHash("sha256").update(ip + salt).digest("hex");
  // First 32 chars are more than enough entropy for rate limiting keys
  return hash.slice(0, 32);
}

/**
 * Constant-time string comparison to avoid timing attacks.
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Basic IP format validation (IPv4 / IPv6).
 */
export function isValidIp(ip: string): boolean {
  if (!ip) return false;
  // IPv4
  const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
  // IPv6 (very permissive)
  const ipv6 = /^[0-9a-fA-F:]+$/;
  return ipv4.test(ip) || ipv6.test(ip);
}

/**
 * Check if an IP appears to be from a private range.
 * Only used in production to de-preference obviously spoofed headers.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip) return false;
  // IPv4 private ranges
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = Number(ip.split(".")[1] || "0");
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("127.")) return true; // loopback
  if (ip === "::1") return true; // IPv6 loopback
  return false;
}

/**
 * Extract the most trustworthy client IP from a Request.
 * Does NOT return private IPs in production.
 */
export function extractClientIp(req: Request): string {
  const headers = req.headers;
  const candidates: string[] = [];

  const cf = headers.get("cf-connecting-ip");
  if (cf) candidates.push(cf);

  const realIp = headers.get("x-real-ip");
  if (realIp) candidates.push(realIp);

  const xff = headers.get("x-forwarded-for");
  if (xff && !xff.includes(",")) {
    candidates.push(xff);
  } else if (xff) {
    // Multiple IPs in XFF can indicate spoofing; take first cautiously
    const first = xff.split(",")[0]?.trim();
    if (first) candidates.push(first);
  }

  // Fallback: remote address may not be available in serverless
  const fallback = headers.get("x-client-ip") || "";
  if (fallback) candidates.push(fallback);

  const isProd = process.env.NODE_ENV === "production";

  for (const ip of candidates) {
    if (!isValidIp(ip)) continue;
    if (isProd && isPrivateIp(ip)) continue;
    return ip;
  }

  return "unknown";
}

