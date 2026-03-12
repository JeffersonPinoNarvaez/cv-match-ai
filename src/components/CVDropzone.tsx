'use client';

import { useCallback, useRef, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle2, XCircle, Loader2, Clock, X } from "lucide-react";
import { Button } from "./ui/button";
import type { AnalysisStatus } from "../lib/types";
import type { FileStatusMap } from "../hooks/useAnalysis";
import { useI18n } from "../lib/i18n";

interface CVDropzoneProps {
  files: File[];
  setFiles: (files: File[]) => void;
  disabled?: boolean;
  onAnalyze: () => void;
  status: AnalysisStatus;
  fileStatuses: FileStatusMap;
  hasJobDescription: boolean;
  cooldownSeconds?: number;
}

const MAX_FILES = 10;
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

/** Maps raw server/validation error strings to friendly i18n keys. */
function getFriendlyError(raw: string, t: (key: string) => string): string {
  const r = raw.toLowerCase();
  if (r.includes("groq") || r.includes("ai model") || r.includes("all groq"))
    return t("error.groqFailed");
  if (r.includes("pdf signature mismatch") || r.includes("not a valid pdf"))
    return t("error.invalidPdfSignature");
  if (r.includes("larger than 2mb") || r.includes("2 mb limit") || r.includes("2mb limit"))
    return t("error.pdfTooLarge");
  if (r.includes("too small to be a pdf") || r.includes("too small"))
    return t("error.pdfTooSmall");
  if (r.includes("pdf version") || r.includes("pdf header") || r.includes("unsupported pdf"))
    return t("error.pdfVersion");
  if (r.includes("parsing error") || r.includes("pdf parsing") || r.includes("corrupted"))
    return t("error.pdfParse");
  if (r.includes("extract text") || r.includes("extract sufficient") || r.includes("insufficient readable"))
    return t("error.pdfExtract");
  if (r.includes("network error") || r.includes("check your connection"))
    return t("error.networkError");
  if (r.includes("analysis failed") || r.includes("analysis error"))
    return t("error.analysisFailed");
  return raw; // unknown error — show as-is
}

export function CVDropzone({
  files,
  setFiles,
  disabled,
  onAnalyze,
  status,
  fileStatuses,
  hasJobDescription,
  cooldownSeconds = 0,
}: CVDropzoneProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useI18n();

  const onDrop = useCallback(
    (accepted: File[], fileRejections: FileRejection[]) => {
      if (disabled) return;
      setLocalError(null);

      const currentCount = files.length;
      if (currentCount + accepted.length > MAX_FILES) {
        setLocalError("You can upload a maximum of 10 PDF files.");
        return;
      }

      const next: File[] = [...files];

      for (const file of accepted) {
        if (file.type !== "application/pdf") {
          setLocalError("Only PDF files are allowed.");
          continue;
        }

        if (file.size > MAX_SIZE_BYTES) {
          setLocalError("Each file must be 2MB or smaller.");
          continue;
        }

        next.push(file);
      }

      if (fileRejections.length > 0 && !localError) {
        setLocalError("Some files were rejected. Ensure they are PDFs under 2MB.");
      }

      setFiles(next);
    },
    [disabled, files, setFiles, localError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_SIZE_BYTES,
  });

  const removeFile = (index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    setFiles(next);
  };

  const formatSize = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

  const truncateName = (name: string, max = 30) =>
    name.length > max ? `${name.slice(0, max - 3)}...` : name;

  const isAnalyzing = status === "analyzing" || status === "uploading";
  const isCoolingDown = cooldownSeconds > 0 && !isAnalyzing;

  const showEmptyState = files.length === 0 && !isAnalyzing;

  const getStatusIcon = (status?: string) => {
    if (!status) return null;
    if (status.includes("Done") || status.includes("✅")) {
      return <CheckCircle2 className="h-3 w-3" style={{ color: "var(--score-strong)" }} />;
    }
    if (status.includes("Error") || status.includes("❌")) {
      return <XCircle className="h-3 w-3" style={{ color: "var(--score-weak)" }} />;
    }
    if (status.includes("Analyzing") || status.includes("🤖")) {
      return <Loader2 className="h-3 w-3 animate-spin" style={{ color: "var(--accent)" }} />;
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        {...getRootProps()}
        className={`group relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors duration-200 ${
          isDragActive
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-elevated)]"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <input
          {...getInputProps()}
          ref={inputRef}
          aria-label={t("cv.uploadLabel")}
        />
        {showEmptyState ? (
          <div className="flex flex-col items-center gap-2">
            <UploadCloud className="h-8 w-8" style={{ color: "var(--text-tertiary)" }} />
            <div className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {t("cv.emptyTitle")}
            </div>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {t("cv.emptySubtitle")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {isDragActive ? t("cv.dropHere") : t("cv.dropOrClick")}
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {files.length} file{files.length === 1 ? "" : "s"} selected
            </p>
          </div>
        )}
      </div>

      {localError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm flex items-start gap-3"
          style={{
            borderColor: "var(--score-weak-border)",
            backgroundColor: "var(--score-weak-subtle)",
            color: "var(--text-primary)",
          }}
        >
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--score-weak)" }} />
          <span>{localError}</span>
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {files.map((file, index) => {
            const key = `${file.name}-${index}`;
            const statusInfo = fileStatuses[key];
            const statusText = statusInfo?.message || "";
            // Strip emoji prefix, then map raw error text to a friendly localized string
            const rawLabel = statusText.replace(/[✅❌🤖📄⏳]/g, "").trim();
            const isError = statusText.includes("❌") || statusInfo?.status === "error";
            const displayLabel = isError ? getFriendlyError(rawLabel, t) : rawLabel;
            return (
              <div
                key={key}
                className="group flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:border-[var(--border-default)]"
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                }}
                title={file.name}
              >
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                <span
                  className="truncate text-sm font-medium max-w-[160px]"
                  style={{ color: "var(--text-primary)" }}
                >
                  {truncateName(file.name)}
                </span>
                <span className="shrink-0 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {formatSize(file.size)}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {statusInfo && (
                    <div className="flex items-center gap-1.5 text-xs">
                      {getStatusIcon(statusText)}
                      <span
                        style={{
                          color: statusText.includes("Done") || statusText.includes("✅")
                            ? "var(--score-strong)"
                            : statusText.includes("Error") || statusText.includes("❌")
                            ? "var(--score-weak)"
                            : statusText.includes("Analyzing") || statusText.includes("🤖")
                            ? "var(--accent)"
                            : "var(--text-tertiary)",
                        }}
                      >
                        {displayLabel}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isAnalyzing}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-[var(--bg-overlay)]"
                    style={{ color: "var(--text-tertiary)" }}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        disabled={!hasJobDescription || files.length === 0 || isAnalyzing || isCoolingDown}
        onClick={onAnalyze}
        className="w-full h-11 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isAnalyzing || isCoolingDown || !hasJobDescription || files.length === 0
            ? "var(--bg-elevated)"
            : "var(--accent)",
          color: isAnalyzing || isCoolingDown || !hasJobDescription || files.length === 0
            ? "var(--text-tertiary)"
            : "var(--text-inverse)",
          borderColor: isAnalyzing || isCoolingDown || !hasJobDescription || files.length === 0
            ? "var(--border-subtle)"
            : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isAnalyzing && !isCoolingDown && hasJobDescription && files.length > 0) {
            e.currentTarget.style.backgroundColor = "var(--accent-hover)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isAnalyzing && !isCoolingDown && hasJobDescription && files.length > 0) {
            e.currentTarget.style.backgroundColor = "var(--accent)";
          }
        }}
      >
        {isAnalyzing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("cv.analyzing")} {files.length} CV{files.length === 1 ? "" : "s"}...
          </span>
        ) : isCoolingDown ? (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("cv.cooldownButton")} {cooldownSeconds}s
          </span>
        ) : (
          t("cv.analyze")
        )}
      </Button>
    </div>
  );
}

