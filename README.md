# Solar UI

**A functional, responsive React workspace with an orbital navigation motif — free to run and deploy on Cloudflare Workers.**

[![Cloudflare CI/CD](https://github.com/amiddlebrook/solar-system-ui-template/actions/workflows/cloudflare.yml/badge.svg)](https://github.com/amiddlebrook/solar-system-ui-template/actions/workflows/cloudflare.yml)

Solar UI is a reusable application shell, not an analytics backend. It includes six connected modules, a usable record manager, interactive visualizations, validation workflows, and customizable interface preferences. The design is self-contained: no CSS CDN, Google Fonts dependency, external assets, authentication requirement, or API key needed to run.

## What's included

| Module | Features |
| --- | --- |
| Overview | Responsive KPI cards derived from actual local records, recent records, clickable orbital navigation, progress summary |
| Analytics | Category and status charts driven by records, not invented server telemetry |
| Records | Add, edit, delete, search, filter, CSV export, and browser-local persistence |
| Workflows | Run actual client-side validation of record schemas, identifiers, and statuses |
| Controls | Persistent dark/light modes, compact layout, JSON workspace export, reset demo dataset |
| Documentation | Local setup, deployment guide, honest descriptions of features and limitations |

**Data scope:** Every record is demo data unless you edit it. Changes are saved in the current browser's `localStorage`; they are not synced across users or devices. Export JSON before clearing browser data. No live telemetry or real backend integrations are implied. CSV values are escaped to reduce spreadsheet-formula injection.

## Local development

Requirements: Node.js 22+ and npm.

```bash
git clone https://github.com/amiddlebrook/solar-system-ui-template.git
cd solar-system-ui-template
npm ci
npm run dev
```

Open http://localhost:3000.

Quality checks:

```bash
npm run check
npm run build
npm test
npm run preview
```

The `npm test` smoke suite expects an already generated `dist` directory from `npm run build`.

## Architecture

```text
React 19 + TypeScript + Vite
  ├── bundled, responsive styles.css
  ├── Recharts charts driven by local records
  ├── browser localStorage (no remote database)
  └── production dist/ assets
         │
         ▼
Cloudflare Workers Static Assets (workers.dev)
         ▲
         │
GitHub Actions: npm ci → typecheck → build → test → deploy
```

The Cloudflare deployment uses **Workers Static Assets**, not GitHub Pages. For static assets, Cloudflare documents unlimited free static-asset requests and no separate asset storage charge. No Worker code runs on requests for this template. Stay on the Cloudflare Workers Free plan and GitHub's free public-repository Actions entitlement to avoid required charges. Platform limits and policies can change.

## Enable GitHub → Cloudflare continuous deployment

1. Create a **free** Cloudflare account, and enable the `workers.dev` subdomain in its dashboard.
2. Create a Cloudflare API token with **Workers Scripts: Edit** permission, scoped to your account. Copy your Cloudflare Account ID.
3. Open this repository's **Settings → Secrets and variables → Actions**, and add these **repository secrets**:
   - `CLOUDFLARE_API_TOKEN` — the scoped Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` — your account ID
4. Push to `master` or manually run **Cloudflare Workers - CI/CD** under Actions. The workflow always typechecks, builds and tests. When both credentials exist, it deploys to the Cloudflare Worker named `solar-system-ui-template` (typically `https://solar-system-ui-template.<your-subdomain>.workers.dev`).

Pull requests run CI without deploying. When either credential is missing, the deployment job explicitly reports that publication was skipped; a green CI result by itself does **not** mean the app is live. There are no credentials in source code or client bundles.

If `CLOUDFLARE_API_TOKEN` already exists under another secret name, either add the expected name or adjust the workflow. Deploy manually with `npx wrangler deploy` after `npm run build` if preferred.

## Security and practical boundaries

- No Gemini key or any other secret is injected into the browser bundle.
- No third-party runtime CSS or JS CDNs, trackers, or external calls.
- This is a **frontend demo template** with records stored in the local browser. Use Cloudflare D1 + Worker API and authentication for multi-user, durable production data; those are intentionally not included here to avoid hidden costs or fake backend behavior.
- Exported CSV text is quoted and sanitized for common spreadsheet-formula prefixes.
- Users are responsible for ensuring that their Cloudflare account remains on the free plan.

## Stack

React 19, TypeScript, Vite 6, Recharts 3, Lucide, Cloudflare Workers Static Assets, GitHub Actions.

© 2026 Solar UI.
