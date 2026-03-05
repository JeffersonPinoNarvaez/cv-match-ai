'use client';

import { useState, type ReactNode } from "react";
import { I18nContext, type Locale, translate } from "../lib/i18n";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocale] = useState<Locale>("en");

  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

