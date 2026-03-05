/**
 * Sanitization helpers to ensure we never send unsafe or noisy text
 * to the Groq API or back to the client.
 */

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F-\u009F]/g;
const HTML_TAG_REGEX = /<[^>]{0,1000}>/g;

export function sanitizeText(input: string): string {
  if (!input) return "";

  let output = input.replace(HTML_TAG_REGEX, " ");
  output = output.replace(CONTROL_CHARS_REGEX, " ");
  output = output.replace(/\s+/g, " ").trim();

  return output;
}

export function truncateText(input: string, maxChars: number): string {
  if (input.length <= maxChars) return input;
  return input.slice(0, maxChars);
}

// ────────────────────────────────────────────────────────────────
// Enhanced sanitization for CVs and job descriptions
// ────────────────────────────────────────────────────────────────

const CONTROL_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function normalizeUnicode(input: string): string {
  try {
    return input.normalize("NFKC");
  } catch {
    return input;
  }
}

function collapseWhitespace(input: string): string {
  return input
    .replace(/\s{4,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateAtWordBoundary(input: string, maxChars: number, suffix: string): string {
  if (input.length <= maxChars) return input;
  const slice = input.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxChars * 0.7) {
    return slice.slice(0, lastSpace) + suffix;
  }
  return slice + suffix;
}

export function sanitizeCVText(rawText: string): string {
  if (!rawText) return "";

  let text = normalizeUnicode(rawText);
  text = text.replace(CONTROL_EXCEPT_WHITESPACE, " ");
  text = text.replace(HTML_TAG_REGEX, " ");
  text = collapseWhitespace(text);

  // Hard limit to prevent token explosion
  const MAX_CHARS = 4000;
  if (text.length > MAX_CHARS) {
    text = truncateAtWordBoundary(text, MAX_CHARS, " [CV text truncated for processing]");
  }

  return text;
}

export function sanitizeJobDescription(rawText: string): string {
  if (!rawText) return "";

  let text = normalizeUnicode(rawText);
  text = text.replace(CONTROL_EXCEPT_WHITESPACE, " ");
  text = text.replace(HTML_TAG_REGEX, " ");
  text = collapseWhitespace(text);

  const MAX_CHARS = 3000;
  if (text.length > MAX_CHARS) {
    text = truncateAtWordBoundary(text, MAX_CHARS, "...");
  }

  return text;
}

// ────────────────────────────────────────────────────────────────
// Prompt injection detection (CV text only)
// ────────────────────────────────────────────────────────────────

type InjectionPattern = {
  name: string;
  regex: RegExp;
};

const INJECTION_PATTERNS: InjectionPattern[] = [
  // CATEGORY A — Direct instruction override
  { name: "ignore_previous_instructions", regex: /ignore\s+(all\s+)?(previous|prior|above)\s+instructions?/i },
  { name: "forget_role", regex: /forget\s+(your|all|everything|prior)/i },
  { name: "disregard_previous", regex: /disregard\s+(the\s+)?(above|previous|prior)/i },
  { name: "you_are_now", regex: /you\s+are\s+now\s+(a\s+)?(different|new|another)/i },
  { name: "new_instructions", regex: /new\s+instructions?:/i },
  { name: "override_instructions", regex: /override\s+(previous\s+)?instructions?/i },

  // CATEGORY B — Role reassignment
  { name: "system_prefix", regex: /\[?system\]?\s*:/i },
  { name: "act_as", regex: /act\s+as\s+(a\s+)?(different|new|another|unrestricted)/i },
  { name: "pretend_role", regex: /pretend\s+(you\s+are|to\s+be)\s+/i },
  { name: "new_role", regex: /your\s+new\s+(role|persona|identity|job)\s+is/i },

  // CATEGORY C — Score manipulation
  { name: "force_score_text", regex: /rate\s+(this|the|my)\s+candidate\s+(as\s+)?\d{2,3}(\s*\/\s*100)?/i },
  { name: "give_score", regex: /give\s+(this|the|my)\s+(cv|resume|candidate)\s+(a\s+)?(score|rating)\s+of/i },
  { name: "score_must_be", regex: /score\s+must\s+be/i },
  { name: "always_score", regex: /always\s+(score|rate|rank)\s+(this|me|my)/i },
  { name: "set_overallScore", regex: /set\s+overallScore\s*[:=]/i },

  // CATEGORY D — Output manipulation
  { name: "respond_only_with_json", regex: /respond\s+(only\s+)?with\s+[\[{]/i },
  { name: "output_json", regex: /output\s+(the\s+following|this)\s+json/i },
  { name: "return_json", regex: /return\s+the\s+following\s+(json|response)/i },
  { name: "injected_json_score", regex: /\{[\s\S]{0,50}"overallScore"\s*:\s*(?:9[0-9]|100)/i },

  // CATEGORY E — Delimiter / protocol injection
  { name: "markdown_role", regex: /```[\s\S]{0,20}(system|user|assistant)/i },
  { name: "chatml_token", regex: /<\|im_start\|>/i },
  { name: "llama_inst", regex: /\[\[INST\]\]/i },
  { name: "instruction_header", regex: /###\s*(instruction|system|context)/i },
];

export function detectPromptInjection(text: string): {
  detected: boolean;
  patterns: string[];
  sanitizedText: string;
} {
  if (!text) {
    return { detected: false, patterns: [], sanitizedText: "" };
  }

  let normalized = normalizeUnicode(text);
  const patternsHit: string[] = [];

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.regex.test(normalized)) {
      patternsHit.push(pattern.name);
      normalized = normalized.replace(pattern.regex, "[REDACTED]");
    }
  }

  const cleaned = sanitizeCVText(normalized);

  return {
    detected: patternsHit.length > 0,
    patterns: patternsHit,
    sanitizedText: cleaned,
  };
}

