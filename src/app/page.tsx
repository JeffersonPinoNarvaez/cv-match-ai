'use client';

import { useState, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { LanguageToggle } from "../components/LanguageToggle";
import { TermsModal } from "../components/TermsModal";
import { JobDescriptionInput } from "../components/JobDescriptionInput";
import { CVDropzone } from "../components/CVDropzone";
import { ResultsDashboard } from "../components/ResultsDashboard";
import { useAnalysis } from "../hooks/useAnalysis";
import { useI18n } from "../lib/i18n";

export default function HomePage() {
  const { t } = useI18n();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const {
    jobDescription,
    setJobDescription,
    files,
    setFiles,
    status,
    error,
    rateLimitResetAt,
    nextAllowedAnalysisAt,
    results,
    fileStatuses,
    analyze,
    resetAll,
  } = useAnalysis();

  const rateLimitMessage = useMemo(() => {
    if (!rateLimitResetAt) return null;
    const msRemaining = rateLimitResetAt - Date.now();
    if (msRemaining <= 0) return null;
    const minutes = Math.ceil(msRemaining / 60000);
    return `Too many requests. Try again in ~${minutes} minute${
      minutes === 1 ? "" : "s"
    }.`;
  }, [rateLimitResetAt]);

  const cooldownMessage = useMemo(() => {
    if (!nextAllowedAnalysisAt) return null;
    const msRemaining = nextAllowedAnalysisAt - Date.now();
    if (msRemaining <= 0) return null;
    const seconds = Math.ceil(msRemaining / 1000);
    return `You can run another analysis in ~${seconds}s (per-browser cooldown).`;
  }, [nextAllowedAnalysisAt]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="mx-auto flex min-h-screen max-w-screen-xl flex-col">
        <header
          className="sticky top-0 z-10 flex h-12 items-center justify-between border-b px-6 backdrop-blur-sm"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              CV Match AI
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
        </header>
        <p className="px-6 py-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {t("app.subtitle")}
        </p>

        <section className="flex flex-1 gap-6 px-6 py-6">
          <div
            className="sticky top-20 flex h-fit w-[420px] flex-col rounded-xl border p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="mb-4">
              <h2
                className="mb-3 text-xs font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-secondary)" }}
              >
                {t("job.title")}
              </h2>
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={status === "analyzing" || status === "uploading"}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <p style={{ color: "var(--text-tertiary)" }}>{t("job.lengthHint")}</p>
              <button
                type="button"
                onClick={resetAll}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                {t("job.newAnalysis")}
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div
              className="flex flex-col gap-4 rounded-xl border p-5"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="mb-3 text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t("cv.title")}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {t("cv.helper")}
                  </p>
                </div>
                {rateLimitMessage && (
                  <span className="text-xs" style={{ color: "var(--warning)" }}>
                    {rateLimitMessage}
                  </span>
                )}
                {!rateLimitMessage && cooldownMessage && (
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {cooldownMessage}
                  </span>
                )}
              </div>

              <CVDropzone
                files={files}
                setFiles={setFiles}
                disabled={status === "analyzing" || status === "uploading"}
                onAnalyze={analyze}
                status={status}
                fileStatuses={fileStatuses}
                hasJobDescription={jobDescription.trim().length >= 50}
              />

              {error && (
                <div
                  className="rounded-xl border px-4 py-3 flex items-start gap-3 text-sm"
                  style={{
                    borderColor: "var(--score-weak-border)",
                    backgroundColor: "var(--score-weak-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  <span style={{ color: "var(--score-weak)" }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {t("privacy.stateHint")}
              </p>
            </div>

            <div
              className="flex-1 overflow-hidden rounded-xl border p-4"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-default)",
              }}
            >
              <ResultsDashboard
                results={results}
                status={status}
                files={files}
                rateLimitResetAt={rateLimitResetAt}
              />
            </div>
          </div>
        </section>

        <footer
          className="flex items-center justify-between border-t px-6 py-3 text-xs"
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--text-tertiary)",
          }}
        >
          <div className="flex items-center gap-4">
            <p>{t("privacy.footer")}</p>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <button
              type="button"
              className="hover:underline"
              style={{ color: "var(--text-secondary)" }}
              onClick={() => setIsTermsModalOpen(true)}
            >
              {t("footer.terms")}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p>{t("footer.copyright")}</p>
            <span style={{ color: "var(--text-tertiary)" }}>·</span>
            <p>
              Powered by Groq
            </p>
          </div>
        </footer>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </main>
  );
}

