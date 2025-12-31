# CASA Reporting Dashboard

A React-based dashboard for analyzing INAD (Inadmissible Passenger) data for carrier sanctions reporting. The dashboard provides two separate portals for different user groups.

## Live Dashboard

- **Admin Portal (SEM)**: https://casa-reporting.vercel.app/admin
- **Viewer Portal (Behörden)**: https://casa-reporting.vercel.app/viewer
- **Password**: `demo123`

## Two-Portal Architecture

### Admin Portal (SEM)
The admin portal is designed for SEM staff who manage the data:
- Upload INAD and BAZL Excel files
- Run 3-step analysis
- Publish results for authorities
- Full access to all features

### Viewer Portal (Behörden)
The viewer portal is designed for cantonal authorities:
- View published analysis results (no file upload)
- Interactive semester comparison
- CSV export for own analyses
- Classification criteria transparency

## Features

### Core Analysis (Both Portals)

- **3-Step Analysis Process**
  - Step 1: Airline Screening (≥6 INADs)
  - Step 2: Route Screening (≥6 INADs per route)
  - Step 3: Density Analysis with Priority Classification

- **Priority Classification**
  - **Kritisch (High Priority)**: Density ≥ threshold × 1.5, ≥ 0.10‰, ≥ 10 INADs
  - **Beobachtung (Watch List)**: Density ≥ threshold
  - **Unzuverlässig (Unreliable)**: PAX < 5,000
  - **Konform (Clear)**: Below threshold

- **Sortable Data Tables**
  - All tables are fully sortable
  - Click headers to sort ascending/descending

### Admin-Only Features

- **Client-Side Excel Processing**
  - Upload INAD and BAZL Excel files directly in the browser
  - No data sent to servers (all processing happens locally)

- **Semester Selection**
  - Choose analysis period (e.g., 2024 H2 = July-December 2024)
  - All semesters from 2010 to present available

- **Publish to Viewer**
  - Make analysis results available to authorities

### Viewer-Only Features (New)

- **Interactive Semester Comparison**
  - Compare any two published semesters
  - Swap button to quickly reverse comparison
  - Trend indicators with color coding:
    - PAX: Green = increase (good)
    - INAD/Density: Red = increase (bad)

- **Classification Criteria Display**
  - Transparent view of all classification thresholds
  - Shows median value and calculated limits
  - Explains each classification level

- **CSV Export**
  - Export route analysis to CSV (semicolon-separated)
  - Swiss format for Excel compatibility

- **INAD Distribution Pie Chart**
  - Visual breakdown of routes by classification
  - Color-coded donut chart with legend

### UI/UX Features

- **Modern UI**
  - Built with Next.js, shadcn/ui, and Tailwind CSS
  - Responsive design
  - Distinct color schemes (Red = Admin, Blue = Viewer)

- **Internationalization**
  - German (DE) and French (FR) support
  - Automatic locale detection

- **Password Protection**
  - Separate passwords for Admin and Viewer portals

## Changes from Streamlit Version

This dashboard replaces the previous Python/Streamlit implementation with a modern React-based solution.

| Feature | Old (Streamlit) | New (React) |
|---------|-----------------|-------------|
| Hosting | Streamlit Cloud | Vercel |
| UI Framework | Streamlit | Next.js + shadcn/ui |
| Data Processing | Server-side (Python) | Client-side (JavaScript) |
| Tabs | 6 tabs | Multiple tabs (Steps, PAX, INAD, Trends, Docs) |
| Languages | EN/DE/FR | DE/FR |
| Charts | Plotly | Recharts (Area, Line, Pie) |
| Portals | Single | Admin + Viewer |
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
