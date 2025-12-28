# INAD Analysis Dashboard - React Version

## Project Overview

This is a React/Next.js dashboard for INAD (Inadmissible Passenger) analysis, replacing the previous Streamlit implementation. The tool helps the legal team analyze carrier sanctions data.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: Zustand
- **Excel Parsing**: SheetJS (xlsx)
- **Authentication**: Simple password-based (cookie)
- **Hosting**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Main dashboard
│   └── login/page.tsx     # Login page
├── components/
│   ├── ui/                # shadcn components
│   ├── dashboard/         # Dashboard-specific components
│   ├── tabs/              # Step 1, 2, 3 tab components
│   └── shared/            # Reusable components
├── lib/
│   ├── analysis/          # Core analysis logic
│   │   ├── types.ts       # TypeScript interfaces
│   │   ├── constants.ts   # Configuration
│   │   ├── parseExcel.ts  # Excel file parsing
│   │   ├── step1.ts       # Airline screening
│   │   ├── step2.ts       # Route screening
│   │   └── step3.ts       # Density analysis
│   └── auth/              # Authentication
└── stores/                # Zustand state management
```

## 3-Step Analysis

1. **Step 1 (Prüfstufe 1)**: Airlines with >= 6 INADs
2. **Step 2 (Prüfstufe 2)**: Routes with >= 6 INADs
3. **Step 3 (Prüfstufe 3)**: Density analysis (INAD/PAX) with priority classification

## Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## Environment Variables

- `NEXT_PUBLIC_APP_PASSWORD`: Password for dashboard access

## Data Files

Test data in `data/` folder:
- `INAD Tabelle .xlsm` - INAD records
- `BAZL-Daten.xlsx` - Passenger data
