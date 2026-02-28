# Changelog

All notable changes to the CASA Reporting Dashboard are documented in this file.

## [2.1.0] - 2025-03-01

### Changed

#### Removed minimum PAX threshold (5,000)
- All passenger volumes are now included in the density analysis, regardless of size
- The "Unzuverlässig (Unreliable)" classification category has been removed entirely
- Routes previously classified as "Unreliable" are now classified normally (Kritisch / Beobachtung / Konform)
- The median threshold is now calculated from all route densities, not just those with PAX ≥ 5,000
- Reason: Legal review determined that all passenger numbers must be considered per applicable regulations

#### Affected areas
- **Analysis logic**: `step3.ts` no longer filters by `minPax`; median uses all densities
- **Classification**: 3 categories instead of 4 (Kritisch, Beobachtung, Konform)
- **Admin UI**: Step 3 density table, classification criteria legend (3 columns instead of 4)
- **Viewer UI**: Classification criteria, route badges, dashboard metrics
- **Documentation tab**: Removed "Unzuverlässig" from classification overview
- **Translations**: Removed unreliable-related labels in DE and FR

---

## [2.0.0] - 2024-12-31

### Added - Viewer Portal Enhancements

#### Interactive Semester Comparison
- Two dropdown menus to select any published semesters for comparison
- Swap button to quickly reverse the comparison direction
- Comparison KPI cards showing:
  - Passenger count with percentage change
  - INAD cases with percentage change
  - Density with percentage change
- Color-coded trend indicators:
  - PAX: Green for increase (positive), Red for decrease
  - INAD/Density: Red for increase (negative), Green for decrease

#### Classification Criteria Display
- New `ClassificationCriteria` component showing all classification rules
- Displays classification levels with their thresholds:
  - Kritisch (Critical): Density >= 1.5x median AND >= 0.10‰ AND >= 10 INADs
  - Beobachtung (Watch List): Density >= median
  - Konform (Clear): Density < median
- Shows calculated median threshold value

#### Sortable Tables in Viewer
- Replaced static HTML tables with reusable `DataTable` component
- All columns in Step 1, 2, and 3 are now sortable
- Consistent sorting behavior with Admin portal

#### CSV Export for Viewer
- Export button in Step 3 (Density Analysis)
- Exports all routes with: Airline, Name, Last Stop, INADs, PAX, Density, Classification
- Swiss semicolon-separated format for Excel compatibility
- Proper CSV escaping for special characters

#### INAD Distribution Pie Chart
- Donut chart showing route distribution by classification
- Color-coded segments matching classification colors
- Interactive legend with percentages

### Changed

#### Code Quality Improvements
- Added `useMemo` and `useCallback` for performance optimization
- Centralized chart configuration in `lib/utils.ts`
- Improved i18n with fallback texts for missing translations
- Added CSV field escaping for semicolons, quotes, and newlines
- Added `aria-label` attributes for better accessibility

#### Documentation
- Updated README with Two-Portal Architecture section
- Added detailed feature documentation for both portals
- Updated comparison table with current features

### Technical Details

#### New Files
- `src/components/viewer/ClassificationCriteria.tsx` - Classification criteria display

#### Modified Files
- `src/components/viewer/ViewerTrends.tsx` - Interactive semester comparison
- `src/components/viewer/ViewerDashboard.tsx` - DataTable integration, CSV export
- `src/components/viewer/ViewerInadTab.tsx` - Pie chart, i18n improvements
- `src/components/shared/DataTable.tsx` - i18n for row count
- `src/lib/analysis/publishTypes.ts` - New PublishedClassificationConfig type
- `src/lib/analysis/generatePublishData.ts` - Include config in published data
- `src/lib/utils.ts` - Chart configuration constants
- `README.md` - Documentation updates

### Functional Parity: Admin vs Viewer

| Feature | Admin | Viewer | Notes |
|---------|-------|--------|-------|
| File Upload | Yes | No | By design |
| 3-Step Analysis Tables | Yes | Yes | Now identical |
| Sortable Tables | Yes | Yes | Now identical |
| CSV Export | Yes | Yes | Now identical |
| Semester Comparison | Yes | Yes | Now identical |
| Classification Criteria | Yes | Yes | Now visible |
| PAX Charts | Yes | Yes | - |
| INAD Charts | Yes | Yes | Pie chart added |
| Trends Charts | Yes | Yes | - |
| Documentation | Yes | Yes | Shared |

---

## [1.0.0] - Initial React Version

### Added
- React/Next.js implementation replacing Streamlit
- Admin portal with full functionality
- Viewer portal with basic functionality
- Client-side Excel processing
- Vercel deployment
