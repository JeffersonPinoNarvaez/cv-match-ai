'use client';

import { useI18n } from "../lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const setEn = () => setLocale("en");
  const setEs = () => setLocale("es");

  return (
    <div
      className="inline-flex items-center rounded-full border p-0.5"
      style={{
        borderColor: "var(--border-subtle)",
        backgroundColor: "var(--bg-elevated)",
      }}
    >
      <button
        type="button"
        onClick={setEn}
        className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
        aria-pressed={locale === "en"}
        style={
          locale === "en"
            ? {
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
              }
            : {
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
              }
        }
        onMouseEnter={(e) => {
          if (locale !== "en") {
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (locale !== "en") {
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={setEs}
        className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
        aria-pressed={locale === "es"}
        style={
          locale === "es"
            ? {
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
              }
            : {
                backgroundColor: "transparent",
                color: "var(--text-secondary)",
              }
        }
        onMouseEnter={(e) => {
          if (locale !== "es") {
            e.currentTarget.style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          if (locale !== "es") {
            e.currentTarget.style.color = "var(--text-secondary)";
          }
        }}
      >
        ES
      </button>
    </div>
  );
}

