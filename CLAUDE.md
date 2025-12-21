# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This project analyzes **INAD (inadmissible passenger)** data for Swiss aviation. It identifies airlines and routes with elevated inadmissible passenger rates through a 3-step analysis process, culminating in legal review recommendations.

### The 3-Step Analysis Process

1. **Prüfstufe 1 (Step 1)**: Identify airlines with ≥6 INADs in a semester
2. **Prüfstufe 2 (Step 2)**: From Step 1 airlines, identify routes with ≥6 INADs
3. **Prüfstufe 3 (Step 3)**: Calculate INAD density (per 1000 passengers) for Step 2 routes; flag those above average for legal review

## Commands

### Install dependencies
```bash
pip install -r requirements.txt
```

### Run the CLI analysis
```bash
python inad_analysis.py \
    --inad "INAD Tabelle .xlsm" \
    --bazl "BAZL-Daten.xlsx" \
    --start 2024-07-01 --end 2024-12-31
```

### Launch the dashboard
```bash
streamlit run dashboard.py
```

### CLI parameters
- `--inadmin N` - Minimum INAD threshold (default: 6)
- `--oe VALUE` - Fixed average threshold in ‰ (otherwise calculated)
- `--map partner.csv` - Carrier partner mapping (format: `Carrier;LastStop;Partner`)

## Architecture

### Files

| File | Purpose |
|------|---------|
| `inad_analysis.py` | Core analysis module with data loading and step calculations |
| `dashboard.py` | Streamlit interactive dashboard with multilingual support |
| `translations.py` | Translation strings for EN/DE/FR language support |
| `pruefstufe3.py` | Legacy CLI tool (original) |

### Data Flow

```
BAZL-Daten.xlsx ──┐
                  ├──► inad_analysis.py ──► Step 1, 2, 3 DataFrames
INAD Tabelle.xlsm ┘                               │
                                                  ▼
                                           dashboard.py
                                           (visualization)
                                                  │
                                                  ▼
                                          translations.py
                                          (i18n support)
```

### Key Functions in `inad_analysis.py`

- `load_bazl_data()` - Loads passenger counts, handles Excel date formats
- `load_inad_data()` - Loads INAD cases with refusal codes
- `calculate_step1()` - Airlines meeting INAD threshold
- `calculate_step2()` - Routes from Step 1 airlines meeting threshold
- `calculate_step3()` - INAD density calculation with priority classification
- `run_full_analysis()` - Orchestrates complete analysis
- `run_multi_semester_analysis()` - Analyzes multiple semesters for systemic detection
- `generate_legal_summary()` - Creates summary for legal review export
- `get_available_semesters()` - Scans data for semester selection

### Dashboard Features

- **Multilingual interface**: English, German (Deutsch), French (Français)
- **Language switcher** in sidebar with flag icons
- Semester selection dropdown
- Filters: airlines, airports (last stops)
- **6 tabs**:
  - Overview (summary metrics, charts)
  - Step 1: Airlines
  - Step 2: Routes
  - Step 3: Priority Analysis
  - Systemic Cases (multi-semester patterns)
  - Legal Summary (export-ready reports)
- **Priority classification**: HIGH_PRIORITY, WATCH_LIST, CLEAR, UNRELIABLE
- **Confidence scoring** for statistical reliability
- Interactive Plotly visualizations
- CSV export for routes by priority level

### Translation System (`translations.py`)

- `TRANSLATIONS` dict containing ~120 keys per language
- Languages: `en` (English), `de` (German), `fr` (French)
- Helper function `t(key, lang)` for translation lookups
- Language preference stored in `st.session_state`

## Key Constants

- `EXCLUDE_CODES` - Refusal codes excluded from analysis: B1n, B2n, C4n, C5n, C8, D1n, D2n, E, F1n, G, H, I
- `REFUSAL_CODE_DESCRIPTIONS` - Human-readable code descriptions
- INAD detection code is in column S (index 18) of INAD table

## Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `min_inad` | 6 | Minimum INAD threshold for Step 1 & 2 |
| `min_pax` | 5,000 | Minimum passengers for reliable data |
| `threshold_method` | median | How to calculate the density threshold |
| `min_density` | 0.10‰ | Minimum density for HIGH_PRIORITY |
| `high_priority_multiplier` | 1.5 | Must be this × threshold for HIGH_PRIORITY |
