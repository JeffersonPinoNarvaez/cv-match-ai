'use client';

import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../lib/i18n";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sections = [
    { title: "terms.section1.title", content: "terms.section1.content" },
    { title: "terms.section2.title", content: "terms.section2.content" },
    { title: "terms.section3.title", content: "terms.section3.content" },
    { title: "terms.section4.title", content: "terms.section4.content" },
    { title: "terms.section5.title", content: "terms.section5.content" },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 mx-auto flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-default)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {t("terms.title")}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 transition-colors"
                style={{
                  color: "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                aria-label={t("terms.close")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={index}>
                    <h3
                      className="mb-3 text-base font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {t(section.title)}
                    </h3>
                    <div
                      className="whitespace-pre-line text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {t(section.content)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="border-t px-6 py-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--text-inverse)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--accent)";
                }}
              >
                {t("terms.close")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

