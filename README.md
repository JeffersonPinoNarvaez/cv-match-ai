## CV Match AI

CV Match AI is a production-ready, privacy-first recruitment tool that analyzes multiple CVs against a single job description and ranks candidates by match percentage using Groq-powered AI.

### Live Demo

[https://cv-match-ai-rho.vercel.app](https://cv-match-ai-rho.vercel.app)

### Tech Stack

- **Next.js 14 (App Router) · TypeScript**
- **Groq (`llama-3.3-70b-versatile`) via `groq-sdk`**
- **Tailwind CSS + custom shadcn-style components**
- **Framer Motion for micro-interactions**
- **`unpdf` for serverless-safe PDF text extraction**
- **Internationalization (ES/EN)**

### How it works

1. **📋 Paste the job description** — include required skills, experience level, and responsibilities.
2. **📂 Upload up to 10 CVs (PDF, max 2 MB each)** — PDFs are validated and parsed in memory only.
3. **🤖 Get instant AI-powered rankings** — candidates are scored 0–100 with a detailed category breakdown.

### Privacy

- **CVs are never stored** — processed in memory and immediately discarded.
- **Zero data retention** — no database, no file storage, no analytics on CV content.
- **No accounts required** — everything happens in a single browser session.

### Security

- IP-based rate limiting (burst + hourly caps) to prevent API abuse.
- Client-side cooldown to avoid accidental rapid re-submissions.
- Strong `IP_HASH_SALT` required in production — never falls back to a weak default.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) set on all API routes.

### Cost

- **Powered by Groq** — `llama-3.3-70b-versatile`.
- Operational cost depends on Groq API usage. A monthly spend cap and alerts are configured in the Groq dashboard.

### Local development

```bash
git clone <your-repo-url>
cd cv-match-ai

cp .env.example .env.local
# Add your GROQ_API_KEY and IP_HASH_SALT to .env.local

yarn install
yarn dev
```

Then open `http://localhost:3000` in your browser.

> **Note:** This project uses Yarn Berry (`yarn@3`) with `node-modules` linker. Run `yarn install` (not `npm install`) after cloning.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | Your Groq API key |
| `IP_HASH_SALT` | ✅ (prod) | Random string ≥ 32 chars used to hash IPs for rate limiting |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of the deployed app (e.g. `https://cv-match-ai-rho.vercel.app`) |

### Deployment

Deploy with Vercel:

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Create a new Vercel project and link the repo.
3. Add the environment variables listed above in Vercel project settings.
4. Deploy — Vercel will run `yarn install && yarn build` automatically.
