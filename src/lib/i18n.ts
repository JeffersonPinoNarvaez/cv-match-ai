import { createContext, useContext } from "react";

export type Locale = "en" | "es";

type I18nKey =
  | "app.tagline"
  | "app.subtitle"
  | "theme.dark"
  | "job.title"
  | "job.helper"
  | "job.lengthHint"
  | "job.newAnalysis"
  | "privacy.badge"
  | "privacy.cardBadge"
  | "privacy.footer"
  | "privacy.stateHint"
  | "cv.title"
  | "cv.helper"
  | "cv.emptyTitle"
  | "cv.emptySubtitle"
  | "cv.dropHere"
  | "cv.dropOrClick"
  | "cv.clientValidation"
  | "cv.analyzing"
  | "cv.analyze"
  | "cv.cooldownButton"
  | "cv.cooldownHint"
  | "cv.uploadLabel"
  | "error.rateLimit"
  | "error.groqFailed"
  | "error.invalidPdfSignature"
  | "error.pdfTooLarge"
  | "error.pdfTooSmall"
  | "error.pdfVersion"
  | "error.pdfParse"
  | "error.pdfExtract"
  | "error.analysisFailed"
  | "error.networkError"
  | "results.overview"
  | "results.analyzed"
  | "results.none"
  | "results.strong"
  | "results.good"
  | "results.partialWeak"
  | "results.bestMatch"
  | "results.exportAll"
  | "results.sortBy"
  | "results.sort.best"
  | "results.sort.name"
  | "results.sort.time"
  | "results.filter"
  | "results.filter.all"
  | "results.filter.strong"
  | "results.filter.good"
  | "results.filter.partial"
  | "results.filter.weak"
  | "results.empty.noResults"
  | "results.empty.hint"
  | "results.empty.filtered"
  | "results.overallScore"
  | "results.details"
  | "results.processingTime"
  | "results.copied"
  | "results.copyReport"
  | "results.strengths"
  | "results.gaps"
  | "results.noStrengths"
  | "results.noGaps"
  | "results.credibilityFlags"
  | "footer.terms"
  | "footer.copyright"
  | "terms.title"
  | "terms.close"
  | "terms.section1.title"
  | "terms.section1.content"
  | "terms.section2.title"
  | "terms.section2.content"
  | "terms.section3.title"
  | "terms.section3.content"
  | "terms.section4.title"
  | "terms.section4.content"
  | "terms.section5.title"
  | "terms.section5.content";

const translations: Record<Locale, Record<I18nKey, string>> = {
  en: {
    "app.tagline": "Recruitment Intelligence",
    "app.subtitle":
      "Paste a job description, upload multiple CVs, and instantly see ranked AI match scores.",
    "theme.dark": "Dark mode",
    "job.title": "Job Description",
    "job.helper":
      "Include required skills, experience level, and responsibilities for best results.",
    "job.lengthHint":
      "Min 50 characters · Max 5000 characters. The more specific, the better the ranking.",
    "job.newAnalysis": "New Analysis",
    "privacy.badge": "CVs are never stored — processed in memory only",
    "privacy.cardBadge": "Privacy-first: zero data retention",
    "privacy.footer": "Privacy-first: zero data retention. No accounts required.",
    "privacy.stateHint":
      "Results exist only in this browser tab's memory — page refresh clears everything.",
    "cv.title": "Candidate CVs",
    "cv.helper":
      "Up to 10 PDF files · Max 2MB each · Drag & drop or click to browse.",
    "cv.emptyTitle": "Drop CVs here",
    "cv.emptySubtitle":
      "Up to 10 PDF files · Max 2MB each · Drag & drop or click to browse.",
    "cv.dropHere": "Drop the CV PDFs here...",
    "cv.dropOrClick":
      "Drag & drop additional CVs here, or click to browse.",
    "cv.clientValidation":
      "Client-side validation rejects non-PDFs, large files, and more than 10 CVs.",
    "cv.analyzing": "Analyzing…",
    "cv.analyze": "Analyze CVs",
    "cv.cooldownButton": "Ready in",
    "cv.cooldownHint": "Next analysis in",
    "cv.uploadLabel": "Upload CV PDFs",
    "error.rateLimit":
      "Too many requests. Try again in a few minutes. Rate limit is 10 analyses per hour.",
    "error.groqFailed":
      "The AI model is temporarily unavailable. Please wait a moment and try again.",
    "error.invalidPdfSignature":
      "This file is not a valid PDF. Check the file and re-upload it.",
    "error.pdfTooLarge":
      "File exceeds the 2 MB limit. Please compress or reduce the PDF size.",
    "error.pdfTooSmall":
      "This file appears to be empty. Please upload a valid PDF.",
    "error.pdfVersion":
      "This PDF version is not supported. Try re-saving or exporting the file as a standard PDF.",
    "error.pdfParse":
      "Could not read this PDF. It may be corrupted or password-protected.",
    "error.pdfExtract":
      "Could not extract text from this PDF. Make sure the file contains readable text (not just scanned images).",
    "error.analysisFailed":
      "Analysis failed. Please try again.",
    "error.networkError":
      "Network error — check your connection and try again.",
    "results.overview": "Analysis Overview",
    "results.analyzed": "CVs analyzed",
    "results.none": "No analyses yet",
    "results.strong": "Strong",
    "results.good": "Good",
    "results.partialWeak": "Partial/Weak",
    "results.bestMatch": "Best match",
    "results.exportAll": "Export All Results",
    "results.sortBy": "Sort by:",
    "results.sort.best": "Best Match",
    "results.sort.name": "Name A–Z",
    "results.sort.time": "Processing Time",
    "results.filter": "Filter:",
    "results.filter.all": "All",
    "results.filter.strong": "Strong Match",
    "results.filter.good": "Good Match",
    "results.filter.partial": "Partial Match",
    "results.filter.weak": "Weak Match",
    "results.empty.noResults": "No results yet",
    "results.empty.hint":
      "Paste a job description on the left and upload up to 10 CVs to see ranked AI match scores here.",
    "results.empty.filtered":
      "No candidates match the current filters. Try adjusting the verdict filter or sorting options.",
    "results.overallScore": "Overall match score",
    "results.details": "Details",
    "results.processingTime": "Processing time",
    "results.copied": "✅ Copied!",
    "results.copyReport": "📋 Copy Report",
    "results.strengths": "Strengths",
    "results.gaps": "Gaps",
    "results.noStrengths": "No specific strengths listed.",
    "results.noGaps": "No explicit gaps detected.",
    "results.credibilityFlags": "Credibility flags",
    "footer.terms": "Terms and Conditions",
    "footer.copyright": "© 2025 CV Match AI. All rights reserved.",
    "terms.title": "Terms and Conditions",
    "terms.close": "Close",
    "terms.section1.title": "1. Acceptable Use",
    "terms.section1.content": "CV Match AI is designed for legitimate recruitment and candidate evaluation purposes. You may use this service to analyze CVs against job descriptions for hiring decisions. You must not use this service to:\n\n• Process CVs without the candidate's explicit consent\n• Discriminate against candidates based on protected characteristics\n• Automate bulk processing for commercial resale\n• Attempt to reverse-engineer or extract the AI model's training data\n• Upload malicious files, viruses, or content designed to exploit the system",
    "terms.section2.title": "2. Data Privacy & Retention",
    "terms.section2.content": "CV Match AI operates on a strict zero-data-retention policy:\n\n• All uploaded PDFs are processed entirely in server memory\n• No CVs, job descriptions, or analysis results are stored on disk\n• No database or persistent storage is used\n• All data is discarded immediately after processing\n• Results exist only in your browser's memory and are cleared on page refresh\n\nWe do not collect, store, or share any personal information from uploaded CVs.",
    "terms.section3.title": "3. Rate Limits & Usage Restrictions",
    "terms.section3.content": "To ensure fair access and prevent abuse, the following limits apply:\n\n• Maximum 8 analyses per hour per IP address\n• Maximum 3 analyses per minute (burst protection)\n• Maximum 10 PDF files per analysis request\n• Maximum 2MB per PDF file\n• Maximum 5,000 characters per job description\n\nThese limits may be adjusted without notice. Attempts to circumvent rate limits (e.g., using multiple IPs, automated scripts) may result in temporary or permanent access restrictions.",
    "terms.section4.title": "4. Prohibited Activities",
    "terms.section4.content": "The following activities are strictly prohibited:\n\n• Uploading non-PDF files disguised as PDFs\n• Uploading PDFs containing embedded JavaScript or malicious code\n• Attempting prompt injection attacks to manipulate AI responses\n• Sending automated requests via scripts, bots, or scrapers\n• Attempting to exhaust the service's API quota through coordinated attacks\n• Using the service to process sensitive data (e.g., medical records, financial information) without proper authorization\n• Violating any applicable data protection laws (GDPR, CCPA, etc.)",
    "terms.section5.title": "5. Service Availability & Disclaimer",
    "terms.section5.content": "CV Match AI is provided 'as-is' without warranties:\n\n• Analysis results are AI-generated and should be used as one factor in hiring decisions, not the sole criterion\n• We do not guarantee accuracy, completeness, or suitability of analysis results\n• The service may be temporarily unavailable due to maintenance, rate limits, or technical issues\n• We reserve the right to modify, suspend, or discontinue the service at any time\n• Users are responsible for ensuring their use complies with local employment and data protection laws",
  },
  es: {
    "app.tagline": "Inteligencia para Reclutamiento",
    "app.subtitle":
      "Pega una oferta, sube varios CVs y obtén al instante un ranking de encaje generado por IA.",
    "theme.dark": "Modo oscuro",
    "job.title": "Descripción del puesto",
    "job.helper":
      "Incluye habilidades requeridas, nivel de experiencia y responsabilidades para mejores resultados.",
    "job.lengthHint":
      "Mínimo 50 caracteres · Máximo 5000. Cuanto más específica sea la oferta, mejor será el ranking.",
    "job.newAnalysis": "Nuevo análisis",
    "privacy.badge":
      "Los CVs nunca se almacenan — se procesan solo en memoria",
    "privacy.cardBadge": "Privacidad primero: cero retención de datos",
    "privacy.footer":
      "Privacidad primero: cero retención de datos. No se requieren cuentas.",
    "privacy.stateHint":
      "Los resultados solo viven en la memoria de esta pestaña — al refrescar se borra todo.",
    "cv.title": "CVs de candidatos",
    "cv.helper":
      "Hasta 10 archivos PDF · Máx 2MB cada uno · Arrastra y suelta o haz clic para seleccionar.",
    "cv.emptyTitle": "Suelta aquí los CVs",
    "cv.emptySubtitle":
      "Hasta 10 archivos PDF · Máx 2MB cada uno · Arrastra y suelta o haz clic para seleccionar.",
    "cv.dropHere": "Suelta los PDFs de CV aquí…",
    "cv.dropOrClick":
      "Arrastra y suelta más CVs aquí, o haz clic para seleccionar.",
    "cv.clientValidation":
      "La validación en el cliente rechaza no-PDFs, archivos grandes y más de 10 CVs.",
    "cv.analyzing": "Analizando…",
    "cv.analyze": "Analizar CVs",
    "cv.cooldownButton": "Disponible en",
    "cv.cooldownHint": "Próximo análisis en",
    "cv.uploadLabel": "Subir CVs en PDF",
    "error.rateLimit":
      "Demasiadas solicitudes. Vuelve a intentarlo en unos minutos. El límite es 10 análisis por hora.",
    "error.groqFailed":
      "El modelo de IA no está disponible temporalmente. Espera un momento e inténtalo de nuevo.",
    "error.invalidPdfSignature":
      "Este archivo no es un PDF válido. Verifica el archivo y vuelve a subirlo.",
    "error.pdfTooLarge":
      "El archivo supera el límite de 2 MB. Comprime o reduce el tamaño del PDF.",
    "error.pdfTooSmall":
      "Este archivo parece estar vacío. Sube un PDF válido.",
    "error.pdfVersion":
      "La versión de este PDF no es compatible. Intenta guardarlo o exportarlo como PDF estándar.",
    "error.pdfParse":
      "No se pudo leer este PDF. Puede estar dañado o protegido con contraseña.",
    "error.pdfExtract":
      "No se pudo extraer texto de este PDF. Asegúrate de que el archivo tiene texto legible (no solo imágenes escaneadas).",
    "error.analysisFailed":
      "El análisis falló. Por favor, inténtalo de nuevo.",
    "error.networkError":
      "Error de red — verifica tu conexión e inténtalo de nuevo.",
    "results.overview": "Resumen del análisis",
    "results.analyzed": "CVs analizados",
    "results.none": "Sin análisis todavía",
    "results.strong": "Fuerte",
    "results.good": "Bueno",
    "results.partialWeak": "Parcial/Débil",
    "results.bestMatch": "Mejor encaje",
    "results.exportAll": "Exportar todos los resultados",
    "results.sortBy": "Ordenar por:",
    "results.sort.best": "Mejor encaje",
    "results.sort.name": "Nombre A–Z",
    "results.sort.time": "Tiempo de proceso",
    "results.filter": "Filtrar:",
    "results.filter.all": "Todos",
    "results.filter.strong": "Strong Match",
    "results.filter.good": "Good Match",
    "results.filter.partial": "Partial Match",
    "results.filter.weak": "Weak Match",
    "results.empty.noResults": "Aún no hay resultados",
    "results.empty.hint":
      "Pega una descripción de puesto a la izquierda y sube hasta 10 CVs para ver el ranking aquí.",
    "results.empty.filtered":
      "Ningún candidato coincide con los filtros actuales. Ajusta el filtro por veredicto u orden.",
    "results.overallScore": "Puntuación global de encaje",
    "results.details": "Detalles",
    "results.processingTime": "Tiempo de proceso",
    "results.copied": "✅ ¡Copiado!",
    "results.copyReport": "📋 Copiar informe",
    "results.strengths": "Fortalezas",
    "results.gaps": "Brechas",
    "results.noStrengths": "No se han listado fortalezas específicas.",
    "results.noGaps": "No se han detectado brechas explícitas.",
    "results.credibilityFlags": "Alertas de credibilidad",
    "footer.terms": "Términos y Condiciones",
    "footer.copyright": "© 2025 CV Match AI. Todos los derechos reservados.",
    "terms.title": "Términos y Condiciones",
    "terms.close": "Cerrar",
    "terms.section1.title": "1. Uso Aceptable",
    "terms.section1.content": "CV Match AI está diseñado para propósitos legítimos de reclutamiento y evaluación de candidatos. Puedes usar este servicio para analizar CVs contra descripciones de puestos para decisiones de contratación. No debes usar este servicio para:\n\n• Procesar CVs sin el consentimiento explícito del candidato\n• Discriminar contra candidatos basándose en características protegidas\n• Automatizar procesamiento masivo para reventa comercial\n• Intentar ingeniería inversa o extraer datos de entrenamiento del modelo de IA\n• Subir archivos maliciosos, virus o contenido diseñado para explotar el sistema",
    "terms.section2.title": "2. Privacidad de Datos y Retención",
    "terms.section2.content": "CV Match AI opera bajo una política estricta de cero retención de datos:\n\n• Todos los PDFs subidos se procesan completamente en la memoria del servidor\n• No se almacenan CVs, descripciones de puestos o resultados de análisis en disco\n• No se usa base de datos ni almacenamiento persistente\n• Todos los datos se descartan inmediatamente después del procesamiento\n• Los resultados existen solo en la memoria de tu navegador y se borran al refrescar la página\n\nNo recopilamos, almacenamos ni compartimos ninguna información personal de los CVs subidos.",
    "terms.section3.title": "3. Límites de Velocidad y Restricciones de Uso",
    "terms.section3.content": "Para garantizar acceso justo y prevenir abusos, se aplican los siguientes límites:\n\n• Máximo 8 análisis por hora por dirección IP\n• Máximo 3 análisis por minuto (protección contra ráfagas)\n• Máximo 10 archivos PDF por solicitud de análisis\n• Máximo 2MB por archivo PDF\n• Máximo 5,000 caracteres por descripción de puesto\n\nEstos límites pueden ajustarse sin previo aviso. Los intentos de eludir los límites de velocidad (p. ej., usando múltiples IPs, scripts automatizados) pueden resultar en restricciones de acceso temporales o permanentes.",
    "terms.section4.title": "4. Actividades Prohibidas",
    "terms.section4.content": "Las siguientes actividades están estrictamente prohibidas:\n\n• Subir archivos no-PDF disfrazados como PDFs\n• Subir PDFs que contengan JavaScript embebido o código malicioso\n• Intentar ataques de inyección de prompts para manipular respuestas de IA\n• Enviar solicitudes automatizadas mediante scripts, bots o scrapers\n• Intentar agotar la cuota de API del servicio mediante ataques coordinados\n• Usar el servicio para procesar datos sensibles (p. ej., registros médicos, información financiera) sin autorización adecuada\n• Violar cualquier ley de protección de datos aplicable (GDPR, CCPA, etc.)",
    "terms.section5.title": "5. Disponibilidad del Servicio y Descargo de Responsabilidad",
    "terms.section5.content": "CV Match AI se proporciona 'tal cual' sin garantías:\n\n• Los resultados del análisis son generados por IA y deben usarse como un factor en las decisiones de contratación, no como el único criterio\n• No garantizamos precisión, completitud o idoneidad de los resultados del análisis\n• El servicio puede estar temporalmente no disponible debido a mantenimiento, límites de velocidad o problemas técnicos\n• Nos reservamos el derecho de modificar, suspender o discontinuar el servicio en cualquier momento\n• Los usuarios son responsables de asegurar que su uso cumpla con las leyes locales de empleo y protección de datos",
  },
};

type I18nContextValue = {
  locale: Locale;
  t: (key: I18nKey) => string;
  setLocale: (locale: Locale) => void;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}

export function translate(locale: Locale, key: I18nKey): string {
  return translations[locale][key] ?? translations.en[key];
}

// Translation functions for Groq API response values
export type Verdict = "Strong Match" | "Good Match" | "Partial Match" | "Weak Match";
export type RecommendedAction = "Invite to Interview" | "Consider" | "Keep on File" | "Pass";

const verdictTranslations: Record<Locale, Record<Verdict, string>> = {
  en: {
    "Strong Match": "Strong Match",
    "Good Match": "Good Match",
    "Partial Match": "Partial Match",
    "Weak Match": "Weak Match",
  },
  es: {
    "Strong Match": "Encaje Fuerte",
    "Good Match": "Buen Encaje",
    "Partial Match": "Encaje Parcial",
    "Weak Match": "Encaje Débil",
  },
};

const recommendedActionTranslations: Record<Locale, Record<RecommendedAction, string>> = {
  en: {
    "Invite to Interview": "Invite to Interview",
    "Consider": "Consider",
    "Keep on File": "Keep on File",
    "Pass": "Pass",
  },
  es: {
    "Invite to Interview": "Invitar a Entrevista",
    "Consider": "Considerar",
    "Keep on File": "Mantener en Archivo",
    "Pass": "Rechazar",
  },
};

const categoryLabelTranslations: Record<Locale, Record<string, string>> = {
  en: {
    "Technical Skills": "Technical Skills",
    "Experience": "Experience",
    "Education": "Education",
    "Soft Skills & Culture Fit": "Soft Skills & Culture Fit",
  },
  es: {
    "Technical Skills": "Habilidades Técnicas",
    "Experience": "Experiencia",
    "Education": "Educación",
    "Soft Skills & Culture Fit": "Habilidades Blandas y Cultura",
  },
};

export function translateVerdict(locale: Locale, verdict: Verdict): string {
  return verdictTranslations[locale][verdict] ?? verdict;
}

export function translateRecommendedAction(locale: Locale, action: RecommendedAction): string {
  return recommendedActionTranslations[locale][action] ?? action;
}

export function translateCategoryLabel(locale: Locale, label: string): string {
  return categoryLabelTranslations[locale][label] ?? label;
}

