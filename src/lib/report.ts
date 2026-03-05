import type { CVAnalysis } from "./types";
import type { Locale } from "./i18n";
import { translateVerdict, translateRecommendedAction, translateCategoryLabel } from "./i18n";

export function formatCandidateReport(candidate: CVAnalysis, locale: Locale = "en"): string {
  const timestamp = new Date().toISOString();

  const {
    fileName,
    overallScore,
    verdict,
    recommendedAction,
    summary,
    categories,
    strengths,
    gaps,
  } = candidate;

  const lines: string[] = [];

  lines.push("═══════════════════════════════════════");
  lines.push("CV MATCH AI — Candidate Report");
  lines.push(`Generated: ${timestamp}`);
  lines.push("═══════════════════════════════════════");
  const verdictLabel = translateVerdict(locale, verdict);
  const recommendedActionLabel = translateRecommendedAction(locale, recommendedAction);
  
  lines.push(`Candidate: ${fileName}`);
  lines.push(`Overall Score: ${overallScore}/100 — ${verdictLabel}`);
  lines.push(`Recommended Action: ${recommendedActionLabel}`);
  lines.push("");
  lines.push("Summary:");
  lines.push(summary);
  lines.push("");
  lines.push("Category Breakdown:");
  lines.push(
    `- ${translateCategoryLabel(locale, categories.technicalSkills.label)}: ${categories.technicalSkills.score}/100 — ${categories.technicalSkills.findings}`
  );
  lines.push(
    `- ${translateCategoryLabel(locale, categories.experience.label)}:       ${categories.experience.score}/100 — ${categories.experience.findings}`
  );
  lines.push(
    `- ${translateCategoryLabel(locale, categories.education.label)}:        ${categories.education.score}/100 — ${categories.education.findings}`
  );
  lines.push(
    `- ${translateCategoryLabel(locale, categories.softSkills.label)}:      ${categories.softSkills.score}/100 — ${categories.softSkills.findings}`
  );
  lines.push("");
  lines.push("Strengths:");
  if (strengths.length === 0) {
    lines.push("✓ (None listed)");
  } else {
    strengths.forEach((s) => lines.push(`✓ ${s}`));
  }
  lines.push("");
  lines.push("Gaps:");
  if (gaps.length === 0) {
    lines.push("△ (None listed)");
  } else {
    gaps.forEach((g) => lines.push(`△ ${g}`));
  }
  lines.push("═══════════════════════════════════════");

  return lines.join("\n");
}

export function formatAllReports(candidates: CVAnalysis[], locale: Locale = "en"): string {
  return candidates.map((c) => formatCandidateReport(c, locale)).join("\n\n");
}

