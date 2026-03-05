/**
 * Production-safe logging utility.
 * Only logs in development or when explicitly enabled.
 */

const isDev = process.env.NODE_ENV !== "production";
const ENABLE_LOGGING = process.env.ENABLE_LOGGING === "true";

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev || ENABLE_LOGGING) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev || ENABLE_LOGGING) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
};
