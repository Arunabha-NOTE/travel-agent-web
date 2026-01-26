Travel agent chatbot frontend: a Next.js chat interface for holiday and travel planning that talks to the AI backend.

## Project Setup

1. Clone the repo and enter the web app folder:
   ```bash
   git clone <repo-url>
   cd chatbot-web
   ```
2. Install dependencies (pnpm recommended):
   ```bash
   pnpm install
   # or: npm install
   ```
3. Configure environment (set API base URL, Sentry, etc.):
   - Copy `.env.example` to `.env` if provided, or create `.env` matching your backend endpoints and keys.

## Run in Development

Start the Next.js dev server:
```bash
pnpm dev
# or: npm run dev
```

The app runs at http://localhost:3000. Hot reload is enabled; edit pages under `app/` to see changes instantly.
