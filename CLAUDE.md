# CASA Reporting Dashboard

## Project Overview

React/Next.js dashboard for INAD (Inadmissible Passenger) analysis, used by the
legal team for carrier sanctions reporting. Two portals: **Admin** (SEM staff:
upload Excel files, run analysis, publish) and **Viewer** (cantonal
authorities: read published results, compare semesters, export CSV).

Live: https://casa-reporting.vercel.app (`/admin` and `/viewer`)

## Technology Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: shadcn/ui + Tailwind CSS 4
- **State Management**: Zustand
- **Charts**: Recharts 3 (shared components in `src/components/charts/`)
- **Excel Parsing**: SheetJS (xlsx), fully client-side
- **i18n**: next-intl (DE/FR)
- **Authentication**: server-side signed session cookie (HttpOnly), separate
  admin/viewer passwords, middleware-protected routes, CSRF on publish
- **Hosting**: Vercel (Git integration; PRs get preview deployments)
- **Tests**: Vitest (`npm test`), unit tests for the analysis core and CSV util

## Project Structure

```
src/
├── app/                    # Next.js pages + API routes
│   ├── admin/             # Admin portal (+ /admin/login)
│   ├── viewer/            # Viewer portal (+ /viewer/login)
│   └── api/               # auth (login/logout/session) + publish
├── components/
│   ├── ui/                # shadcn components + ChartWrapper
│   ├── charts/            # shared chart layer (TrendCharts, DensityChart)
│   ├── dashboard/         # Admin dashboard components
│   ├── tabs/              # Step 1/2/3, PAX, INAD, Trends tabs (Admin)
│   ├── viewer/            # Viewer dashboard, trends, criteria
│   └── shared/            # DataTable, PriorityBadge
├── lib/
│   ├── analysis/          # Core analysis logic (pure, unit-tested)
│   │   ├── parseExcel.ts  # Excel file parsing incl. ICAO→IATA fallback
│   │   ├── step1.ts       # Airline screening (>= 6 INADs)
│   │   ├── step2.ts       # Route screening (>= 6 INADs per route)
│   │   ├── step3.ts       # Density analysis + priority classification
│   │   └── generatePublishData.ts  # Aggregate-only publish payload
│   ├── auth/              # Session handling
│   └── csv.ts             # Injection-safe CSV building + download
└── stores/                # Zustand stores (analysisStore, viewerStore)
```

## 3-Step Analysis

1. **Step 1 (Prüfstufe 1)**: Airlines with >= 6 INADs
2. **Step 2 (Prüfstufe 2)**: Routes (airline + last stop) with >= 6 INADs
3. **Step 3 (Prüfstufe 3)**: Density (INAD/PAX, ‰) vs. median threshold:
   - **HIGH_PRIORITY**: density >= 1.5× median AND >= 0.10‰ AND >= 10 INADs
   - **WATCH_LIST**: density >= median
   - **CLEAR**: below median
   - Excluded refusal codes (see `lib/analysis/constants.ts`) never count.

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
npm test        # Run Vitest unit tests
```

Local dev needs env vars (see README for the full list):
`AUTH_SECRET`, `ADMIN_PASSWORD`, `VIEWER_PASSWORD`; `GITHUB_TOKEN` only for
actual publishing.

## Conventions

- Raw INAD/BAZL Excel files contain personal data — they stay local, are
  gitignored, and must never be committed or published. Only aggregates leave
  the browser (`generatePublishData.ts`).
- All CSV exports go through `downloadCsv`/`toSafeCsvField` in `lib/csv.ts`
  (formula-injection safe, Swiss semicolon format).
- Admin accent is red, Viewer accent is blue; shared components take an
  `accent` prop instead of duplicating markup.
- UI strings live in `messages/de.json` and `messages/fr.json` — always add
  both.
