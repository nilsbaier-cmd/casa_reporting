# INAD Analysis Dashboard

A React-based dashboard for analyzing INAD (Inadmissible Passenger) data for carrier sanctions reporting.

## Features

- **3-Step Analysis Process**
  - Step 1: Airline Screening (≥6 INADs)
  - Step 2: Route Screening (≥6 INADs per route)
  - Step 3: Density Analysis with Priority Classification

- **Client-Side Excel Processing**
  - Upload INAD and BAZL Excel files directly in the browser
  - No data sent to servers

- **Modern UI**
  - Built with Next.js, shadcn/ui, and Tailwind CSS
  - Responsive design
  - Sortable data tables
  - CSV export

- **Password Protection**
  - Simple password-based access control

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
NEXT_PUBLIC_APP_PASSWORD=your_secure_password
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

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [SheetJS](https://sheetjs.com/) - Excel parsing
