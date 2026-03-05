import * as React from "react";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionInput({
  value,
  onChange,
  disabled,
}: JobDescriptionInputProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-3">
      <textarea
        className="min-h-[220px] w-full resize-none rounded-lg border bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-colors duration-150 focus:border-[var(--accent-border)] focus:ring-1 focus:ring-[var(--accent)]"
        style={{ borderColor: "var(--border-subtle)" }}
        placeholder="Paste the full vacancy text here, including must-have skills, tech stack, seniority level, and responsibilities..."
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        disabled={disabled}
      />
      <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-tertiary)" }}>
        <ShieldCheck className="h-3 w-3" />
        <span>{t("privacy.badge")}</span>
      </div>
    </div>
  );
}

