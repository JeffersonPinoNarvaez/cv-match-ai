feat: implement production-ready CV Match AI application

Implement a complete full-stack Next.js 14 recruitment tool that analyzes
multiple CVs against job descriptions using Groq AI and ranks candidates by
match percentage. This is a privacy-first, zero-data-retention application
with comprehensive security measures, internationalization, and production
optimizations.

## Core Features

### AI-Powered CV Analysis
- Integrate Groq SDK with llama-3.3-70b-versatile as primary model
- Implement automatic fallback to llama-3.1-8b-instant and llama-3.1-70b-versatile
- Handle rate limits and decommissioned models gracefully
- Score candidates across 4 categories: Technical Skills, Experience, Education, Soft Skills
- Generate detailed analysis with strengths, gaps, and credibility flags

### Privacy & Zero Data Retention
- Process all PDFs entirely in server memory
- No database, file storage, or persistent storage
- Immediate data discard after processing
- Results exist only in browser memory (cleared on refresh)
- No personal information collection or sharing

### Security Hardening
- Multi-layer rate limiting (hourly, burst, circuit breaker)
- IP hashing with configurable salt for privacy
- Comprehensive file validation (magic bytes, size, version, JavaScript detection)
- Text sanitization with Unicode normalization
- Prompt injection detection and mitigation
- Secure error responses without internal details
- Environment variable validation at startup
- Content Security Policy (CSP) with strict directives
- Security headers (X-Frame-Options, HSTS, Permissions-Policy, etc.)
- Strict CORS validation for API routes

### Internationalization (i18n)
- Full UI translation support for English (EN) and Spanish (ES)
- Language toggle component with persistent selection
- AI-generated content translation (verdicts, actions, categories)
- Locale-aware system prompts for Groq API
- Complete translation coverage for all UI elements

### User Interface
- Modern dark theme with custom color system
- DM Sans and JetBrains Mono fonts via Google Fonts
- 8pt grid system for consistent spacing
- Framer Motion animations and micro-interactions
- Responsive design (mobile, tablet, desktop)
- Accessible components with ARIA labels and focus states
- Job description input with character counter
- Drag-and-drop CV upload zone (up to 10 PDFs, 2MB each)
- Results dashboard with sorting and filtering
- Detailed candidate cards with expandable sections
- Terms and Conditions modal (ES/EN)

## Technical Implementation

### Project Structure
- Next.js 14 App Router with TypeScript (strict mode)
- Server-side API route at `/api/analyze`
- Client-side React hooks for state management
- Component-based architecture with reusable UI elements

### Dependencies
- next@14.2.35 - React framework
- groq-sdk@^0.37.0 - AI API client
- pdf-parse@^2.4.5 - PDF text extraction (server-only)
- zod@^4.3.6 - Schema validation
- framer-motion@^12.34.5 - Animations
- react-dropzone@^15.0.0 - File upload
- tailwindcss@^3.4.1 - Styling
- lucide-react@^0.577.0 - Icons

### Configuration Files
- `next.config.mjs` - Webpack config to exclude pdf-parse from bundling
- `middleware.ts` - Security headers and CORS enforcement
- `tailwind.config.ts` - Custom design tokens and animations
- `tsconfig.json` - TypeScript strict mode configuration
- `vercel.json` - Serverless function timeout configuration
- `.env.example` - Environment variables documentation

### Core Libraries

#### `src/lib/groq.ts`
- Groq SDK client initialization
- API key validation

#### `src/lib/prompt.ts`
- Dynamic system prompt generation based on locale
- Comprehensive scoring rules and evaluation criteria
- Credibility validation rules
- Experience weighting for top-tier companies

#### `src/lib/pdf.ts`
- PDF validation and text extraction
- Magic bytes verification
- Timeout protection (8 seconds)
- Page count sanity checks
- Text sanitization and truncation

#### `src/lib/validation.ts`
- File size validation (2MB limit)
- PDF header version checking (1.0-2.0)
- Filename sanitization
- JavaScript detection in PDFs
- Magic bytes verification

#### `src/lib/sanitize.ts`
- CV text sanitization (control chars, HTML, whitespace)
- Job description sanitization with length limits
- Prompt injection detection with pattern matching
- Redaction of detected injection attempts

#### `src/lib/rateLimit.ts`
- Per-IP hourly limit (8 requests/hour)
- Per-IP burst protection (3 requests/minute)
- Global circuit breaker for API quota exhaustion
- Automatic cleanup of expired entries
- Disabled in development mode

#### `src/lib/security.ts`
- Environment variable validation
- IP hashing with SHA-256
- Constant-time string comparison
- Client IP extraction from headers
- Private IP detection

#### `src/lib/logger.ts`
- Production-safe logging utility
- Conditional logging (dev only or ENABLE_LOGGING flag)
- Always log errors even in production

#### `src/lib/i18n.ts`
- Complete translation system (EN/ES)
- Context provider for language state
- Translation functions for AI-generated content
- Type-safe translation keys

#### `src/lib/types.ts`
- Zod schemas for request/response validation
- TypeScript types for CV analysis results
- Strict validation with character limits

### API Route (`app/api/analyze/route.ts`)
- POST endpoint with comprehensive security layers
- Method enforcement (POST only)
- Content-Type validation
- Request size limits (22MB max)
- Rate limiting with IP hashing
- Form data parsing with timeout
- Field extraction with type enforcement
- File validation (count, type, size)
- Parallel PDF processing with Promise.allSettled
- Error handling with secure responses
- Circuit breaker integration

### React Components

#### `src/components/CVDropzone.tsx`
- Drag-and-drop file upload
- File validation and preview
- Status indicators (queued, analyzing, done, error)
- File removal capability
- Analyze button with disabled states

#### `src/components/JobDescriptionInput.tsx`
- Textarea with character counter
- Privacy badge display
- Validation feedback

#### `src/components/ResultsDashboard.tsx`
- Results overview with statistics
- Sort controls (best match, name, time)
- Filter by verdict (Strong, Good, Partial, Weak)
- Export all results functionality
- Empty states and loading skeletons

#### `src/components/ResultsCard.tsx`
- Candidate ranking display
- Score visualization (ring chart, progress bar)
- Category breakdown with icons
- Expandable details section
- Copy report functionality
- Verdict and action badges

#### `src/components/TermsModal.tsx`
- Modal dialog with backdrop
- Keyboard navigation (Escape to close)
- Scrollable content area
- 5 sections covering usage, privacy, limits, prohibitions, disclaimers
- Locale-aware content

#### `src/components/LanguageToggle.tsx`
- Segmented control for language selection
- Visual active state indication

### React Hooks

#### `src/hooks/useAnalysis.ts`
- Centralized state management for analysis flow
- File status tracking
- API integration
- Error handling
- Rate limit state management

#### `src/hooks/useCountUp.ts`
- Animated number counting for scores
- Smooth transitions

## Production Readiness

### Security Measures
- ✅ Multi-layer rate limiting
- ✅ File validation and sanitization
- ✅ Prompt injection detection
- ✅ Secure error responses
- ✅ Environment validation
- ✅ IP hashing for privacy
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Strict CORS policy

### Performance Optimizations
- ✅ Dynamic imports for pdf-parse (reduces bundle size)
- ✅ Webpack externals configuration
- ✅ Production source maps disabled
- ✅ Conditional logging (disabled by default)
- ✅ Rate limiting disabled in development

### Code Quality
- ✅ TypeScript strict mode
- ✅ Zod schema validation
- ✅ Comprehensive error handling
- ✅ No console.logs in production
- ✅ Clean code structure
- ✅ Removed duplicate files

### Documentation
- ✅ Updated README.md with setup instructions
- ✅ .env.example with all required variables
- ✅ Inline code comments
- ✅ Type definitions

## Files Added

### Configuration
- `.env.example` - Environment variables template
- `.eslintrc.json` - ESLint configuration
- `.gitignore` - Git ignore rules
- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `vercel.json` - Vercel deployment configuration
- `middleware.ts` - Next.js middleware for security

### Application Code
- `app/api/analyze/route.ts` - API endpoint
- `app/layout.tsx` - Root layout
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles
- `src/components/*` - React components
- `src/hooks/*` - Custom React hooks
- `src/lib/*` - Core libraries and utilities
- `src/app/*` - App router pages (legacy, to be removed)

### Dependencies
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Dependency lock file

## Files Modified

- `README.md` - Updated with current tech stack and deployment instructions

## Breaking Changes

None - this is the initial implementation.

## Migration Notes

For deployment:
1. Set `GROQ_API_KEY` environment variable
2. Generate and set `IP_HASH_SALT` (openssl rand -hex 32)
3. Set `NEXT_PUBLIC_APP_URL` to production domain
4. Optionally set `ENABLE_LOGGING=true` for debugging

## Testing

- ✅ PDF parsing with various file formats
- ✅ Rate limiting behavior
- ✅ Error handling and fallbacks
- ✅ Internationalization switching
- ✅ File validation and sanitization
- ✅ Security headers verification

## Known Limitations

- Rate limiting is in-memory (resets on server restart)
- PDF extraction timeout set to 8 seconds
- Maximum 10 PDFs per analysis request
- Maximum 2MB per PDF file
- Maximum 5,000 characters for job description
