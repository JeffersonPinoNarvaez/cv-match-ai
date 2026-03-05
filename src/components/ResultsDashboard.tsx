import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisStatus, CVAnalysis } from "../lib/types";
import { ResultsCard } from "./ResultsCard";
import { Button } from "./ui/button";
import { formatAllReports } from "../lib/report";
import { useI18n } from "../lib/i18n";

type SortBy = "best" | "name" | "time";
type VerdictFilter =
  | "all"
  | "Strong Match"
  | "Good Match"
  | "Partial Match"
  | "Weak Match";

interface ResultsDashboardProps {
  results: CVAnalysis[];
  status: AnalysisStatus;
  files: File[];
  rateLimitResetAt: number | null;
}

export function ResultsDashboard({
  results,
  status,
  files,
  rateLimitResetAt,
}: ResultsDashboardProps) {
  const [sortBy, setSortBy] = useState<SortBy>("best");
  const [filterVerdict, setFilterVerdict] = useState<VerdictFilter>("all");
  const { t, locale } = useI18n();

  const hasResults = results.length > 0;
  const isLoading = status === "uploading" || status === "analyzing";

  const { strongCount, goodCount, otherCount, best } = useMemo(() => {
    let strong = 0;
    let good = 0;
    let other = 0;
    let bestCandidate: CVAnalysis | null = null;

    for (const r of results) {
      if (!bestCandidate || r.overallScore > bestCandidate.overallScore) {
        bestCandidate = r;
      }
      if (r.verdict === "Strong Match") strong += 1;
      else if (r.verdict === "Good Match") good += 1;
      else other += 1;
    }

    return {
      strongCount: strong,
      goodCount: good,
      otherCount: other,
      best: bestCandidate,
    };
  }, [results]);

  const sortedAndFiltered = useMemo(() => {
    let next = [...results];

    if (filterVerdict !== "all") {
      next = next.filter((r) => r.verdict === filterVerdict);
    }

    next.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.fileName.localeCompare(b.fileName);
        case "time":
          return a.processingTimeMs - b.processingTimeMs;
        case "best":
        default:
          return b.overallScore - a.overallScore;
      }
    });

    return next;
  }, [results, sortBy, filterVerdict]);

  const handleExportAll = () => {
    if (!results.length) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const text = formatAllReports(results, locale);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cv-analysis-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const renderTopSummary = () => (
    <div
      className="mb-4 flex items-center justify-between rounded-xl border px-5 py-3"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
        {hasResults
          ? `${results.length} ${t("results.analyzed")}`
          : t("results.none")}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--score-strong-subtle)",
            color: "var(--score-strong)",
          }}
        >
          {t("results.strong")}: {strongCount}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--score-good-subtle)",
            color: "var(--score-good)",
          }}
        >
          {t("results.good")}: {goodCount}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--score-partial-subtle)",
            color: "var(--score-partial)",
          }}
        >
          {t("results.partialWeak")}: {otherCount}
        </span>
      </div>
      <button
        type="button"
        onClick={handleExportAll}
        disabled={!hasResults}
        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
        style={{
          borderColor: "var(--border-default)",
          color: "var(--text-secondary)",
        }}
        onMouseEnter={(e) => {
          if (hasResults) {
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (hasResults) {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        {t("results.exportAll")}
      </button>
    </div>
  );

  const renderControls = () => (
    <div className="mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {t("results.sortBy")}
        </span>
        <div className="inline-flex gap-1">
          {[
            { key: "best", label: t("results.sort.best") },
            { key: "name", label: t("results.sort.name") },
            { key: "time", label: t("results.sort.time") },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key as SortBy)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={
                sortBy === opt.key
                  ? {
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-default)",
                      border: "1px solid",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--text-secondary)",
                      borderColor: "var(--border-subtle)",
                      border: "1px solid",
                    }
              }
              onMouseEnter={(e) => {
                if (sortBy !== opt.key) {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (sortBy !== opt.key) {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {t("results.filter")}
        </span>
        <div className="inline-flex gap-1">
          {[
            { value: "all", label: t("results.filter.all") },
            { value: "Strong Match", label: t("results.filter.strong") },
            { value: "Good Match", label: t("results.filter.good") },
            { value: "Partial Match", label: t("results.filter.partial") },
            { value: "Weak Match", label: t("results.filter.weak") },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilterVerdict(value as VerdictFilter)}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={
                filterVerdict === value
                  ? {
                      backgroundColor: "var(--bg-elevated)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-default)",
                      border: "1px solid",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "var(--text-secondary)",
                      borderColor: "var(--border-subtle)",
                      border: "1px solid",
                    }
              }
              onMouseEnter={(e) => {
                if (filterVerdict !== value) {
                  e.currentTarget.style.borderColor = "var(--border-default)";
                }
              }}
              onMouseLeave={(e) => {
                if (filterVerdict !== value) {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                }
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkeletons = () => {
    const count = files.length || 1;
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border p-5"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
          >
            <div className="skeleton h-4 w-28 rounded-md mb-3" />
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="skeleton h-3 w-40 rounded-md" />
              <div className="skeleton h-12 w-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-1.5 w-full rounded-full" />
              <div className="skeleton h-1.5 w-4/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmpty = () => {
    if (files.length === 0 && !hasResults) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center"
          style={{
            borderColor: "var(--border-default)",
            backgroundColor: "var(--bg-surface)",
          }}
        >
          <div className="text-4xl" aria-hidden style={{ color: "var(--text-tertiary)" }}>
            📊
          </div>
          <p className="text-base font-semibold" style={{ color: "var(--text-secondary)" }}>
            {t("results.empty.noResults")}
          </p>
          <p className="max-w-[280px] text-sm" style={{ color: "var(--text-tertiary)" }}>
            {t("results.empty.hint")}
          </p>
        </div>
      );
    }

    return (
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
        {t("results.empty.filtered")}
      </p>
    );
  };

  return (
    <div className="flex h-full flex-col">
      {renderTopSummary()}
      {renderControls()}

      {isLoading && renderSkeletons()}

      {!isLoading && !hasResults && renderEmpty()}

      {!isLoading && hasResults && (
        <div className="mt-1 grid grid-cols-1 gap-3">
          <AnimatePresence>
            {sortedAndFiltered.map((result, index) => (
              <ResultsCard
                key={result.fileName + index}
                rank={index + 1}
                result={result}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

