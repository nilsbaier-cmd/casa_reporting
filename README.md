# INAD Analysis Dashboard

A React-based dashboard for analyzing INAD (Inadmissible Passenger) data for carrier sanctions reporting.

## Live Dashboard

- **URL**: https://casa-reporting.vercel.app
- **Password**: `demo123`

## Features

- **3-Step Analysis Process**
  - Step 1: Airline Screening (≥6 INADs)
  - Step 2: Route Screening (≥6 INADs per route)
  - Step 3: Density Analysis with Priority Classification

- **Semester Selection**
  - Choose analysis period (e.g., 2024 H2 = July-December 2024)
  - All semesters from 2010 to present available

- **Priority Classification**
  - **High Priority**: Density ≥ threshold × 1.5, ≥ 0.10‰, ≥ 10 INADs
  - **Watch List**: Density ≥ threshold
  - **Unreliable**: PAX < 5,000
  - **Clear**: Below threshold

- **Client-Side Excel Processing**
  - Upload INAD and BAZL Excel files directly in the browser
  - No data sent to servers (all processing happens locally)

- **Modern UI**
  - Built with Next.js, shadcn/ui, and Tailwind CSS
  - Responsive design
  - Sortable data tables
  - CSV export

- **Password Protection**
  - Simple password-based access control

## Changes from Streamlit Version

This dashboard replaces the previous Python/Streamlit implementation with a modern React-based solution.

| Feature | Old (Streamlit) | New (React) |
|---------|-----------------|-------------|
| Hosting | Streamlit Cloud | Vercel |
| UI Framework | Streamlit | Next.js + shadcn/ui |
| Data Processing | Server-side (Python) | Client-side (JavaScript) |
| Tabs | 6 tabs | 3 tabs (Step 1, 2, 3) |
| Languages | EN/DE/FR | English only |
| Charts | Plotly | Tables only |
| Always Online | No (cold start) | Yes |

The old Streamlit code is preserved in the `streamlit-backup` branch.

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_APP_PASSWORD=demo123
```

## Deployment on Vercel

1. Push to GitHub repository
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variable `NEXT_PUBLIC_APP_PASSWORD`
4. Deploy

## Data Files

The dashboard requires two Excel files:

- **INAD Tabelle** (.xlsx or .xlsm)
  - Sheet: "INAD-Tabelle"
  - Columns: Fluggesellschaft, Abflugort (last stop), Jahr, Monat, Column S (Refusal Code)

- **BAZL-Daten** (.xlsx)
  - Sheet: "BAZL-Daten"
  - Columns: Airline Code (IATA), Flughafen (IATA), Passagiere / Passagers, Jahr, Monat
  - **ICAO Fallback**: If IATA columns are empty (common in older data before 2023), the parser automatically reads the "Airlines IATA-Codes" and "Airports IATA-Codes" reference sheets and converts ICAO codes to IATA codes at runtime. This ensures proper matching with INAD data.

### BAZL Reference Sheets (for ICAO→IATA conversion)

The BAZL Excel file should contain these reference sheets for automatic code conversion:

- **Airlines IATA-Codes**
  - Format: Nr | ICAO | IATA
  - Example: 1 | DLH | LH

- **Airports IATA-Codes**
  - Format: Nr | ICAO | IATA
  - Example: 1 | LSZH | ZRH

## Excluded Refusal Codes

The following codes are excluded from INAD counts:
`B1n`, `B2n`, `C4n`, `C5n`, `C8`, `D1n`, `D2n`, `E`, `F1n`, `G`, `H`, `I`

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [SheetJS](https://sheetjs.com/) - Excel parsing
- [Vercel](https://vercel.com/) - Hosting
