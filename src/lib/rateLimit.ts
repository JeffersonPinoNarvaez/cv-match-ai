export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
  reason?: "hourly" | "burst" | "circuit_breaker";
}

type Entry = {
  count: number;
  resetAt: number;
};

const HOURLY_WINDOW_MS = 60 * 60 * 1000; // 60 minutes
const HOURLY_LIMIT = 8; // max 8 requests per IP per hour

const BURST_WINDOW_MS = 60 * 1000; // 60 seconds
const BURST_LIMIT = 3; // max 3 requests per IP per minute

const hourlyStore = new Map<string, Entry>();
const burstStore = new Map<string, Entry>();

let circuitBreakerUntil = 0; // timestamp in ms when circuit breaker closes again

function cleanup(store: Map<string, Entry>, now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function nowMs() {
  return Date.now();
}

export function isCircuitBreakerOpen(): boolean {
  const now = nowMs();
  return circuitBreakerUntil > now;
}

export function setCircuitBreaker(durationMs: number): void {
  const now = nowMs();
  const target = now + durationMs;
  // Only ever extend the breaker, never shorten it
  circuitBreakerUntil = Math.max(circuitBreakerUntil, target);
}

export function checkRateLimit(ipHash: string): RateLimitResult {
  const now = nowMs();

  // In development, disable rate limiting
  if (process.env.NODE_ENV !== "production") {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY,
      resetAt: now + HOURLY_WINDOW_MS,
    };
  }

  // Global circuit breaker: if Groq quota is exhausted, avoid wasting calls
  if (isCircuitBreakerOpen()) {
    const retryAfter = Math.max(0, Math.ceil((circuitBreakerUntil - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetAt: circuitBreakerUntil,
      retryAfter,
      reason: "circuit_breaker",
    };
  }

  // Cleanup expired entries periodically
  cleanup(hourlyStore, now);
  cleanup(burstStore, now);

  // LAYER 1: Hourly window
  let hourly = hourlyStore.get(ipHash);
  if (!hourly || hourly.resetAt <= now) {
    hourly = { count: 1, resetAt: now + HOURLY_WINDOW_MS };
    hourlyStore.set(ipHash, hourly);
  } else if (hourly.count >= HOURLY_LIMIT) {
    const retryAfter = Math.max(0, Math.ceil((hourly.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetAt: hourly.resetAt,
      retryAfter,
      reason: "hourly",
    };
  } else {
    hourly.count += 1;
    hourlyStore.set(ipHash, hourly);
  }

  // LAYER 2: Burst window
  let burst = burstStore.get(ipHash);
  if (!burst || burst.resetAt <= now) {
    burst = { count: 1, resetAt: now + BURST_WINDOW_MS };
    burstStore.set(ipHash, burst);
  } else if (burst.count >= BURST_LIMIT) {
    const retryAfter = Math.max(0, Math.ceil((burst.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: Math.max(0, HOURLY_LIMIT - (hourly?.count ?? 0)),
      resetAt: burst.resetAt,
      retryAfter,
      reason: "burst",
    };
  } else {
    burst.count += 1;
    burstStore.set(ipHash, burst);
  }

  return {
    allowed: true,
    remaining: Math.max(0, HOURLY_LIMIT - (hourly?.count ?? 0)),
    resetAt: hourly?.resetAt ?? now + HOURLY_WINDOW_MS,
  };
}

