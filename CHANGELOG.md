# Changelog

All notable changes to CV Match AI are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] — 2026-03-12

### Fixed
- Replaced 3 decommissioned Groq fallback models (`llama-3.1-70b-versatile`, `mixtral-8x7b-32768`, `deepseek-r1-distill-llama-70b`) with verified-active models from the Groq console
- Fallback chain now uses models from completely independent rate limit pools

### Added
- New Groq fallback models (confirmed active): `meta-llama/llama-4-scout-17b-16e-instruct`, `qwen/qwen3-32b`, `moonshotai/kimi-k2-instruct`
- User-friendly, localized error messages for PDF failures and Groq errors (English & Spanish)
  - `Invalid file format (PDF signature mismatch)` → clear explanation with actionable hint
  - `Groq analysis error` → human-readable message with retry guidance
  - Covers: file too small, wrong format, parsing failure, all models rate-limited, service unavailable, network error

---

## [1.2.0] — 2026-03-11

### Added
- "Analyze CVs" button now **disabled during the 15-second cooldown** with a live countdown (`Ready in 12s`)
- Cooldown hint displayed above the button showing time remaining
- LinkedIn profile link added to the footer with hover accent color effect
- `Clock` icon replaces `Loader2` during cooldown state for clearer visual feedback

### Fixed
- Countdown ticker moved into `useAnalysis` hook — was previously in `page.tsx`, causing it to desync from `nextAllowedAnalysisAt`
- `canAnalyze` `useMemo` was using `Date.now()` without it being a dependency, causing the button to stay **permanently disabled** after cooldown unless a file was removed; now depends on `cooldownSeconds` state so it recomputes correctly the moment the timer hits 0

---

## [1.1.0] — 2026-03-10

### Added
- Multiple Groq fallback models — if the primary model is rate-limited, analysis retries automatically with the next available model
- Circuit breaker: once all models are exhausted, subsequent CVs in the same batch fail fast instead of hammering the API
- Prompt injection detection on all user-provided text inputs

### Fixed
- Filename validation was rejecting valid files with accented characters (`á`, `é`, `ñ`) or parentheses (e.g. `Hoja de vida - Diana Marcela.pdf`, `CV Carolina(1).pdf`)

### Security
- Hardened server-side PDF content checks

---

## [1.0.0] — 2026-02-01

### Added
- Initial production release
- Upload up to 10 CVs (PDF, max 2 MB each) and rank them against a job description
- Groq-powered AI analysis using `llama-3.3-70b-versatile` — returns a 0–100 match score with category breakdown
- PDF validation: magic bytes check (`%PDF`), header version check, file size limit (2 MB)
- IP-based rate limiting (burst and hourly caps per IP)
- Client-side cooldown to prevent accidental rapid re-submissions
- Internationalization (English / Spanish) with a language toggle
- Light / dark theme toggle with system preference detection
- Privacy-first: CVs processed in memory only, zero data retention, no accounts required
- Security headers on all API routes (CSP, HSTS, X-Frame-Options, etc.)
- Deployed on Vercel at [cv-match-ai-rho.vercel.app](https://cv-match-ai-rho.vercel.app)
