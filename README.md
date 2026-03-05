## CV Match AI

CV Match AI is a production-ready, privacy-first recruitment tool that analyzes multiple CVs against a single job description and ranks candidates by match percentage using Groq-powered AI.

### Live Demo

Add your deployed URL here after the first deploy, for example: `[Live Demo](https://your-vercel-app-url)`.

### Tech Stack

- **Next.js 14 (App Router) · TypeScript**
- **Groq (llama-3.3-70b-versatile) via `groq-sdk`**
- **Tailwind CSS + custom shadcn-style components**
- **Framer Motion for micro-interactions**
- **Internationalization (ES/EN)**

### How it works

1. **📋 Paste the job description** — include required skills, experience level, and responsibilities.
2. **📂 Upload up to 10 CVs (PDF)** — PDFs are validated and parsed in memory only.
3. **🤖 Get instant AI-powered rankings** — candidates are scored 0–100 with a detailed category breakdown.

### Privacy

- **CVs are never stored** — processed in memory and immediately discarded.
- **Zero data retention** — no database, no file storage, no analytics on CV content.
- **No accounts required** — everything happens in a single browser session.

### Cost

- **Powered by Groq free tier** — `llama-3.3-70b-versatile` on the free plan.
- **Operational cost** depends on Groq API usage within their free tier limits.

### Local development

```bash
git clone <your-repo-url>
cd cv-match-ai

cp .env.example .env.local
# Add GROQ_API_KEY to .env.local

npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

### Deployment

Deploy with Vercel:

- Push this repo to GitHub/GitLab/Bitbucket.
- Create a new Vercel project and link the repo.
- Add `GROQ_API_KEY` in Vercel project settings as an environment variable.

You can also add a one-click deploy badge here, for example:

`[Deploy with Vercel](https://vercel.com/new)`

