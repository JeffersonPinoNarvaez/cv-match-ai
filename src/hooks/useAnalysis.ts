'use client';

import { useCallback, useMemo, useState } from "react";
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
  const { locale } = useI18n();
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rateLimitResetAt, setRateLimitResetAt] = useState<number | null>(null);
  const [fileStatuses, setFileStatuses] = useState<FileStatusMap>({});
  const [results, setResults] = useState<CVAnalysis[]>([]); // Results exist only in React state — never persisted

  const hasJobDescription = jobDescription.trim().length >= 50;

  const canAnalyze = useMemo(
    () => hasJobDescription && files.length > 0 && status !== "analyzing",
    [hasJobDescription, files.length, status]
  );

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
          setError(
            "Too many requests. Try again in a few minutes. Rate limit is 10 analyses per hour."
          );
        } else if (data?.error) {
          setError(String(data.error));
        } else {
          setError("Analysis failed. Please try again.");
        }
        setStatus("error");
        setFileStatuses((prev) => {
          const next: FileStatusMap = {};
          Object.entries(prev).forEach(([key]) => {
            next[key] = {
              status: "error",
              message: "❌ Analysis failed",
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
      setError(
        "Analysis service temporarily unavailable. Please check your connection and try again."
      );
      setStatus("error");
      setFileStatuses((prev) => {
        const next: FileStatusMap = {};
        Object.entries(prev).forEach(([key]) => {
          next[key] = {
            status: "error",
            message: "❌ Network error",
          };
        });
        return next;
      });
    }
  }, [canAnalyze, files, jobDescription, locale]);

  return {
    jobDescription,
    setJobDescription,
    files,
    setFiles,
    status,
    error,
    rateLimitResetAt,
    results,
    fileStatuses,
    analyze,
    resetAll,
  };
}

