# CASA Reporting Dashboard - Enhanced Edition

An upgraded INAD (Inadmissible Passenger) analysis dashboard with interactive globe visualization, historical comparison, and modern UI design.

## ✨ New Features

### 🌍 Interactive Globe View
- **3D route visualization** showing flight paths from Last Stop airports to Switzerland
- **Priority-colored arcs**: Red (High Priority), Orange (Watch List), Green (Clear)
- **Animated pulsing dots** along route arcs for visual effect
- **Interactive tooltips** with route details on hover
- **Filter by priority and minimum INAD count**

### 📅 Historical Comparison
- **Compare any two semesters** side-by-side
- **Visual diff** showing new, resolved, and persistent flagged routes
- **Trend detection**: Worsening (>10% density increase) vs Improving
- **Summary statistics** for quick overview

### 🎨 Modern Orion-Inspired Design
- Clean purple/blue gradients with orange accents
- Card-based layout with smooth styling
- Improved data tables with color-coded priority rows
- Dark sidebar with light content area
- Full German and French translations

## 📁 Project Structure

```
casa_reporting/
├── app.py                      # Main dashboard (replaces dashboard.py)
├── inad_analysis.py            # Your existing analysis module
├── translations.py             # Updated with new keys
├── geography.py                # NEW: Airport database & routing
├── requirements.txt            # Updated dependencies
├── components/
│   ├── __init__.py
│   ├── globe.py                # Globe visualization
│   └── stat_cards.py           # UI components
├── styles/
│   └── main.css                # Custom theme
├── INAD Tabelle .xlsm          # Your data file
└── BAZL-Daten.xlsx             # Your data file
```

## 🚀 Installation

### Step 1: Install New Dependencies

```bash
pip install pydeck airportsdata
```

Or update your requirements.txt and run:
```bash
pip install -r requirements.txt
```

### Step 2: Add New Files

Copy these new files to your repository:
- `geography.py` → root directory
- `components/` folder → root directory  
- `styles/` folder → root directory
- `translations.py` → replace existing (adds new keys)
- `app.py` → root directory (or rename to dashboard.py)

### Step 3: Update Streamlit Cloud

If using Streamlit Cloud, ensure your `requirements.txt` includes:
```
pydeck>=0.8.0
airportsdata>=20231201
```

### Step 4: Run

```bash
streamlit run app.py
```

## 🗺️ Globe View Details

### How It Works
- Routes are drawn from **Last Stop** airports to **Switzerland** (center point at 46.82°N, 8.23°E)
- Arc colors indicate priority classification
- Arc width scales with INAD count
- Animated dots pulse along the arcs

### Airport Coverage
The `airportsdata` package provides ~8,000 IATA airports. We've added fallback coordinates for 100+ common airports in INAD data including:
- Middle East: DXB, DOH, AUH, RUH, JED, TLV, AMM, BEY, CAI
- Turkey: IST, SAW, AYT, ADB, ESB
- Africa: ADD, NBO, JNB, CMN, ALG, TUN, LOS, ACC
- Balkans: PRN, TIA, SKP, SJJ, BEG, SOF, OTP
- And many more...

### Adding Missing Airports

If you have routes from airports not in the database, add them to `geography.py`:

```python
FALLBACK_AIRPORTS = {
    'XXX': {
        'name': 'Airport Name',
        'city': 'City',
        'country': 'CC',
        'lat': 12.3456,
        'lon': 78.9012
    },
    # ... existing entries
}
```

## 📊 Historical Comparison

### How It Works
1. Select a comparison semester from the dropdown
2. The system loads both datasets and enriches with coordinates
3. Routes are categorized:
   - **New** (red): Flagged this semester, not flagged before
   - **Resolved** (green): Was flagged, no longer flagged
   - **Persistent** (orange): Still flagged in both
   - **Worsening** (pink): >10% density increase
   - **Improving** (blue): >10% density decrease

### Use Cases
- Track effectiveness of carrier interventions
- Identify emerging problem routes early
- Document systemic issues for legal proceedings

## 🌐 Translations

All UI elements are translated. New keys added:

| Key | English | German | French |
|-----|---------|--------|--------|
| tab_globe | Globe View | Globus-Ansicht | Vue Globe |
| tab_history | Historical | Historisch | Historique |
| loading_geo_data | Loading geographic data... | Geografische Daten werden geladen... | Chargement des données géographiques... |
| new_routes | New Routes | Neue Routen | Nouvelles Routes |
| resolved_routes | Resolved Routes | Gelöste Routen | Routes Résolues |

## 🎨 Customization

### Colors
Edit `styles/main.css`:
```css
:root {
    --color-primary: #6366F1;      /* Main brand color */
    --priority-high: #EF4444;       /* High priority */
    --priority-watch: #F59E0B;      /* Watch list */
    --priority-clear: #10B981;      /* Clear */
}
```

### Globe Colors
Edit `components/globe.py`:
```python
PRIORITY_COLORS = {
    'HIGH_PRIORITY': [239, 68, 68, 220],   # RGBA
    'WATCH_LIST': [245, 158, 11, 200],
    ...
}
```

## ⚡ Performance

With ~100 routes per semester:
- Globe renders smoothly
- Animations work well
- Historical comparison loads in 2-3 seconds

For larger datasets:
- Use the "Minimum INAD to Display" filter
- Disable animations if needed
- Consider pre-aggregating data

## 🐛 Troubleshooting

### Globe not rendering
```bash
pip install pydeck --upgrade
```
Also try a different browser (Chrome/Firefox recommended).

### Missing airport coordinates
Check the "⚠️ airports without coordinates" expander and add missing airports to `FALLBACK_AIRPORTS`.

### CSS not loading
The dashboard has fallback inline CSS. Check that `styles/main.css` exists and is readable.

### Historical comparison errors
Ensure both semesters have valid data and the analysis can run for both periods.

## 📝 Migration from Original Dashboard

1. **Backup** your current `dashboard.py`
2. **Keep** your `inad_analysis.py` unchanged
3. **Replace** `translations.py` with the new version
4. **Add** all new files (`geography.py`, `components/`, `styles/`)
5. **Rename** `app.py` to `dashboard.py` if needed for Streamlit Cloud
6. **Update** `requirements.txt`
7. **Test** locally before deploying

## 📄 License

MIT License - Feel free to modify and use.

---

Built for the CASA Team 🇨🇭
