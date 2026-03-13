'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AnalysisStatus, CVAnalysis } from "../lib/types";
import { useI18n } from "../lib/i18n";

type FileStatus =
  | "queued"
  | "extracting"
  | "analyzing"
  | "done"
  | "error";

export type FileStatusMap = Record<
  string,
  {
    status: FileStatus;
    message?: string;
  }
>;

export function useAnalysis() {
  const { locale, t } = useI18n();
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rateLimitResetAt, setRateLimitResetAt] = useState<number | null>(null);
  const [fileStatuses, setFileStatuses] = useState<FileStatusMap>({});
  const [results, setResults] = useState<CVAnalysis[]>([]); // Results exist only in React state — never persisted
  const [nextAllowedAnalysisAt, setNextAllowedAnalysisAt] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // Cooldown duration between analyses per browser (in milliseconds)
  const COOLDOWN_MS = 15_000;

  // Live ticker: counts down from COOLDOWN_MS to 0 every 500ms
  useEffect(() => {
    if (!nextAllowedAnalysisAt) {
      setCooldownSeconds(0);
      return;
    }
    const tick = () => {
      const remaining = Math.ceil((nextAllowedAnalysisAt - Date.now()) / 1000);
      setCooldownSeconds(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [nextAllowedAnalysisAt]);

  const hasJobDescription = jobDescription.trim().length >= 50;

  const canAnalyze = useMemo(() => {
    if (!hasJobDescription || files.length === 0 || status === "analyzing") return false;
    if (cooldownSeconds > 0) return false;
    return true;
  }, [hasJobDescription, files.length, status, cooldownSeconds]);

  const resetAll = useCallback(() => {
    setJobDescription("");
    setFiles([]);
    setStatus("idle");
    setError(null);
    setRateLimitResetAt(null);
    setFileStatuses({});
    setResults([]);
  }, []);

  const analyze = useCallback(async () => {
    if (!canAnalyze) return;

    // Optional hook for future bot-friction / captcha verification.
    // e.g. await verifyHumanToken();

    const startedAt = Date.now();
    setNextAllowedAnalysisAt(startedAt + COOLDOWN_MS);
    setStatus("uploading");
    setError(null);

    const mapKey = (file: File, index: number) => `${file.name}-${index}`;
    const initialStatuses: FileStatusMap = {};
    files.forEach((file, index) => {
      initialStatuses[mapKey(file, index)] = { status: "queued", message: "⏳ Queued" };
    });
    setFileStatuses(initialStatuses);

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("locale", locale); // Pass the selected language to the API
    files.forEach((file) => formData.append("cvFiles", file));

    // Simulate stage transitions client-side since server is opaque
    setTimeout(() => {
      setFileStatuses((prev) => {
        const next: FileStatusMap = {};
        Object.entries(prev).forEach(([key, v]) => {
          next[key] =
            v.status === "queued"
              ? { status: "extracting", message: "📄 Extracting text..." }
              : v;
        });
        return next;
      });
    }, 250);

    setTimeout(() => {
      setFileStatuses((prev) => {
        const next: FileStatusMap = {};
        Object.entries(prev).forEach(([key, v]) => {
          next[key] =
            v.status === "extracting"
              ? { status: "analyzing", message: "🤖 Analyzing with AI..." }
              : v;
        });
        return next;
      });
    }, 900);

    setStatus("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 429 && data?.resetAt) {
          setRateLimitResetAt(data.resetAt);
          setError(t("error.rateLimit"));
        } else if (data?.error) {
          setError(String(data.error));
        } else {
          setError(t("error.analysisFailed"));
        }
        setStatus("error");
        setFileStatuses((prev) => {
          const next: FileStatusMap = {};
          Object.entries(prev).forEach(([key]) => {
            next[key] = {
              status: "error",
              message: `❌ ${t("error.analysisFailed")}`,
            };
          });
          return next;
        });
        return;
      }

      const data = await res.json();
      const apiResults: CVAnalysis[] = data.results ?? [];

      // On success clear any previous rate-limit message
      setRateLimitResetAt(null);

      setResults(apiResults);
      setStatus("done");

      setFileStatuses((prev) => {
        const next: FileStatusMap = {};
        apiResults.forEach((result, index) => {
          const matchingKey = Object.keys(prev)[index];
          const baseMessage =
            result.error && result.error.length > 0
              ? `❌ ${result.error}`
              : `✅ Done (${(result.processingTimeMs / 1000).toFixed(1)}s)`;
          next[matchingKey ?? `${result.fileName}-${index}`] = {
            status: result.error ? "error" : "done",
            message: baseMessage,
          };
        });
        return next;
      });
    } catch {
      setError(t("error.networkError"));
      setStatus("error");
      setFileStatuses((prev) => {
        const next: FileStatusMap = {};
        Object.entries(prev).forEach(([key]) => {
          next[key] = {
            status: "error",
            message: `❌ ${t("error.networkError")}`,
          };
        });
        return next;
      });
    }
  }, [canAnalyze, files, jobDescription, locale, COOLDOWN_MS]);

  return {
    jobDescription,
    setJobDescription,
    files,
    setFiles,
    status,
    error,
    rateLimitResetAt,
    nextAllowedAnalysisAt,
    cooldownSeconds,
    results,
    fileStatuses,
    analyze,
    resetAll,
  };
}

