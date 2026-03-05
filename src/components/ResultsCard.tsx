import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, CheckCircle2, AlertTriangle, Copy, Clock } from "lucide-react";
import type { CVAnalysis } from "../lib/types";
import { useCountUp } from "../hooks/useCountUp";
import { Button } from "./ui/button";
import { ProgressBar } from "./ProgressBar";
import { cn } from "../lib/utils";
import { formatCandidateReport } from "../lib/report";
import { useI18n, translateVerdict, translateRecommendedAction, translateCategoryLabel } from "../lib/i18n";

interface ResultsCardProps {
  rank: number;
  result: CVAnalysis;
}

type ScoreTier = "strong" | "good" | "partial" | "weak";

function getScoreTier(score: number): ScoreTier {
  if (score >= 80) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "partial";
  return "weak";
}

function getTierColor(tier: ScoreTier) {
  switch (tier) {
    case "strong":
      return "var(--score-strong)";
    case "good":
      return "var(--score-good)";
    case "partial":
      return "var(--score-partial)";
    case "weak":
    default:
      return "var(--score-weak)";
  }
}

function getTierBorderColor(tier: ScoreTier) {
  switch (tier) {
    case "strong":
      return "var(--score-strong-border)";
    case "good":
      return "var(--score-good-border)";
    case "partial":
      return "var(--score-partial-border)";
    case "weak":
    default:
      return "var(--score-weak-border)";
  }
}

function getTierSubtleBg(tier: ScoreTier) {
  switch (tier) {
    case "strong":
      return "var(--score-strong-subtle)";
    case "good":
      return "var(--score-good-subtle)";
    case "partial":
      return "var(--score-partial-subtle)";
    case "weak":
    default:
      return "var(--score-weak-subtle)";
  }
}

function tierBarColor(tier: ScoreTier) {
  return getTierColor(tier);
}

function getRankBadgeStyle(rank: number) {
  if (rank === 1) {
    return {
      backgroundColor: "rgba(245, 158, 11, 0.2)",
      color: "#fbbf24",
      borderColor: "rgba(245, 158, 11, 0.3)",
    };
  }
  if (rank === 2) {
    return {
      backgroundColor: "rgba(148, 163, 184, 0.2)",
      color: "#cbd5e1",
      borderColor: "rgba(148, 163, 184, 0.3)",
    };
  }
  if (rank === 3) {
    return {
      backgroundColor: "rgba(180, 83, 9, 0.2)",
      color: "#ea580c",
      borderColor: "rgba(180, 83, 9, 0.3)",
    };
  }
  return {
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    borderColor: "var(--border-subtle)",
  };
}

export function ResultsCard({ rank, result }: ResultsCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const animatedScore = useCountUp(result.overallScore);

  const tier = getScoreTier(result.overallScore);
  const { t, locale } = useI18n();

  const handleCopy = async () => {
    try {
      const text = formatCandidateReport(result, locale);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const verdictLabel = translateVerdict(locale, result.verdict);
  const recommendedActionLabel = translateRecommendedAction(locale, result.recommendedAction);
  const tierColor = getTierColor(tier);
  const tierBorderColor = getTierBorderColor(tier);
  const tierSubtleBg = getTierSubtleBg(tier);
  const rankStyle = getRankBadgeStyle(rank);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: tierBorderColor,
        borderTopWidth: "3px",
        borderTopColor: tierColor,
      }}
    >
      <header className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold font-mono border flex-shrink-0"
              style={rankStyle}
            >
              #{rank}
            </span>
            <div className="min-w-0 flex-1 max-w-full">
              <div className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
                <div
                  className="truncate text-sm font-semibold max-w-[180px]"
                  style={{ color: "var(--text-primary)" }}
                  title={result.fileName}
                >
                  {result.fileName}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: "var(--bg-elevated)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out delay-200"
                    style={{
                      width: `${result.overallScore}%`,
                      backgroundColor: tierColor,
                    }}
                  />
                </div>
                <span
                  className="ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium border"
                  style={{
                    backgroundColor: tierSubtleBg,
                    color: tierColor,
                    borderColor: tierBorderColor,
                  }}
                >
                  {verdictLabel}
                </span>
                <span
                  className="ml-auto text-xs border rounded-full px-2 py-0.5"
                  style={{
                    color: "var(--text-secondary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  {recommendedActionLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="relative flex h-12 w-12 items-center justify-center flex-shrink-0">
            <ScoreRing
              value={result.overallScore}
              tier={tier}
              ariaLabel={`Match score: ${result.overallScore} out of 100`}
            />
            <span
              className="absolute font-mono font-bold text-base"
              style={{ color: tierColor }}
            >
              {animatedScore}
            </span>
          </div>
        </div>
      </header>

      <section className="px-5 py-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="grid grid-cols-2 gap-3">
          <CategoryCell
            icon="⚙️"
            label={translateCategoryLabel(locale, result.categories.technicalSkills.label)}
            score={result.categories.technicalSkills.score}
            findings={result.categories.technicalSkills.findings}
            tier={getScoreTier(result.categories.technicalSkills.score)}
          />
          <CategoryCell
            icon="💼"
            label={translateCategoryLabel(locale, result.categories.experience.label)}
            score={result.categories.experience.score}
            findings={result.categories.experience.findings}
            tier={getScoreTier(result.categories.experience.score)}
          />
          <CategoryCell
            icon="🎓"
            label={translateCategoryLabel(locale, result.categories.education.label)}
            score={result.categories.education.score}
            findings={result.categories.education.findings}
            tier={getScoreTier(result.categories.education.score)}
          />
          <CategoryCell
            icon="🤝"
            label={translateCategoryLabel(locale, result.categories.softSkills.label)}
            score={result.categories.softSkills.score}
            findings={result.categories.softSkills.findings}
            tier={getScoreTier(result.categories.softSkills.score)}
          />
        </div>
      </section>

      <footer className="px-5 pb-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDetailsOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 text-xs font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span>{t("results.details")}</span>
            <ChevronDown
              className="h-3 w-3 transition-transform duration-200"
              style={{ transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
              <Clock className="h-3 w-3" />
              <span>
                {t("results.processingTime")}: {(result.processingTimeMs / 1000).toFixed(1)}s
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors"
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
              {copied ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  {t("results.copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  {t("results.copyReport")}
                </>
              )}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {detailsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-3">
                <p className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
                  {result.summary}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p
                      className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--score-strong)" }}
                    >
                      {t("results.strengths")}
                    </p>
                    <ul className="space-y-1.5">
                      {result.strengths.length === 0 && (
                        <li className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {t("results.noStrengths")}
                        </li>
                      )}
                      {result.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" style={{ color: "var(--score-strong)" }} />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p
                      className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--score-weak)" }}
                    >
                      {t("results.gaps")}
                    </p>
                    <ul className="space-y-1.5">
                      {result.gaps.length === 0 && (
                        <li className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                          {t("results.noGaps")}
                        </li>
                      )}
                      {result.gaps.map((g, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" style={{ color: "var(--score-weak)" }} />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.credibilityFlags && result.credibilityFlags.length > 0 && (
                    <div className="sm:col-span-2">
                      <p
                        className="mb-1.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--score-weak)" }}
                      >
                        {t("results.credibilityFlags")}
                      </p>
                      <ul className="space-y-1.5">
                        {result.credibilityFlags.map((flag, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" style={{ color: "var(--score-weak)" }} />
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </motion.article>
  );
}

interface CategoryCellProps {
  icon: string;
  label: string;
  score: number;
  findings: string;
  tier: ScoreTier;
}

function CategoryCell({ icon, label, score, findings, tier }: CategoryCellProps) {
  const tierColor = getTierColor(tier);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <span aria-hidden className="text-sm">{icon}</span>
          <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
        </div>
        <span className="font-mono text-sm font-bold" style={{ color: tierColor }}>
          {score}
        </span>
      </div>
      <div className="h-1 rounded-full mb-1.5" style={{ backgroundColor: "var(--bg-elevated)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out delay-200"
          style={{
            width: `${score}%`,
            backgroundColor: tierColor,
          }}
        />
      </div>
      <p className="line-clamp-2 text-xs" style={{ color: "var(--text-tertiary)" }} title={findings}>
        {findings}
      </p>
    </div>
  );
}

interface ScoreRingProps {
  value: number;
  tier: ScoreTier;
  ariaLabel: string;
}

function ScoreRing({ value, tier, ariaLabel }: ScoreRingProps) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const safe = Math.max(0, Math.min(100, value));
  const offset = circumference - (safe / 100) * circumference;

  const strokeColor = getTierColor(tier);

  return (
    <svg
      className="h-12 w-12"
      viewBox="0 0 48 48"
      role="img"
      aria-label={ariaLabel}
    >
      <circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke="var(--bg-elevated)"
        strokeWidth="4"
      />
      <motion.circle
        cx="24"
        cy="24"
        r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}

