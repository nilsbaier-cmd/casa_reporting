#!/usr/bin/env python3
"""
Generate INAD Analysis User Documentation
Using Legal-Tech Professional PDF Generator
"""

import sys
sys.path.append('/Users/Nils_1')

from legal_tech_pdf_generator import LegalTechPDF, COLOR_ACCENT_RED, COLOR_PRIMARY_GOLD
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors

def make_table_paragraph(text, font_size=10, bold=False):
    """Create a Paragraph object for use in table cells with proper wrapping."""
    font_name = 'Helvetica-Bold' if bold else 'Helvetica'
    style = ParagraphStyle(
        'TableCell',
        fontName=font_name,
        fontSize=font_size,
        leading=font_size * 1.3,
        textColor=colors.HexColor('#333333'),
        alignment=TA_LEFT,
        spaceBefore=0,
        spaceAfter=0
    )
    return Paragraph(text, style)

def generate_inad_documentation():
    """Generate the complete INAD Analysis User Documentation."""

    pdf = LegalTechPDF("INAD_Analysis_User_Documentation_v2.1.pdf", "INAD Analysis Tool")

    # ========== COVER / TITLE PAGE ==========
    pdf.add_title("INAD Analysis Tool")
    pdf.add_paragraph("User Documentation", style='body')
    pdf.add_spacer(10)
    pdf.add_paragraph("Enhanced Version 2.1 – Multilingual Edition", style='accent')
    pdf.add_spacer(20)
    pdf.add_paragraph("For Legal Team Review", style='body')
    pdf.add_paragraph("December 2024", style='small')

    pdf.add_spacer(30)
    pdf.add_divider()
    pdf.add_page_break()

    # ========== TABLE OF CONTENTS ==========
    pdf.add_heading1("Table of Contents")
    pdf.add_spacer(10)

    toc_data = [
        ['Section', 'Page'],
        ['01 — Introduction and Purpose', '3'],
        ['02 — The Three-Step Analysis Process', '4'],
        ['03 — Understanding the Enhanced Features', '6'],
        ['04 — The Dashboard Interface', '10'],
        ['05 — Interpreting Results for Legal Review', '12'],
        ['06 — Why the New Approach is More Robust', '14'],
        ['07 — Configuration Parameters', '15'],
        ['08 — Glossary of Terms', '17'],
    ]

    pdf.add_table(toc_data, col_widths=[4*inch, 1*inch], style='minimal')
    pdf.add_page_break()

    # ========== SECTION 1: INTRODUCTION ==========
    pdf.add_heading1("01 — Introduction and Purpose")
    pdf.add_divider()

    pdf.add_heading2("What is This Tool?")
    pdf.add_paragraph(
        "The INAD Analysis Tool is designed to identify airlines and routes with systematically "
        "elevated rates of inadmissible passengers (INADs). Its purpose is to support legal review "
        "by distinguishing between:"
    )

    pdf.add_spacer(5)
    pdf.add_paragraph("• Isolated incidents that may not require action", style='body')
    pdf.add_paragraph("• Systemic patterns that warrant investigation or enforcement", style='body')
    pdf.add_spacer(10)

    pdf.add_paragraph("The tool processes two data sources:")
    pdf.add_spacer(5)

    data_sources = [
        ['Data Source', 'Description'],
        ['INAD records', 'Cases of passengers refused entry at Swiss borders'],
        ['BAZL passenger data', 'Total passenger volumes by airline and route'],
    ]
    pdf.add_table(data_sources, col_widths=[2*inch, 3.5*inch], style='minimal')

    pdf.add_paragraph(
        "By comparing INAD counts against passenger volumes, we can identify which airlines or routes "
        "have disproportionately high INAD rates relative to their traffic, suggesting potential "
        "systemic issues with passenger screening."
    )

    pdf.add_spacer(15)
    pdf.add_heading2("Who Should Use This Documentation?")
    pdf.add_paragraph(
        "This documentation is written for members of the legal team who will review the analysis "
        "results and make decisions about further investigation, warnings, or enforcement actions. "
        "Technical knowledge of statistics or programming is not required."
    )

    pdf.add_page_break()

    # ========== SECTION 2: THREE-STEP PROCESS ==========
    pdf.add_heading1("02 — The Three-Step Analysis Process")
    pdf.add_divider()

    pdf.add_paragraph(
        "The analysis follows a progressive filtering approach, each step narrowing down the focus "
        "to identify the most significant cases."
    )
    pdf.add_spacer(15)

    # Step 1
    pdf.add_heading2("Step 1: Airline-Level Screening (Prüfstufe 1)")
    pdf.add_heading3("PURPOSE")
    pdf.add_paragraph("Identify airlines with a meaningful number of INAD cases")

    pdf.add_heading3("HOW IT WORKS")
    pdf.add_paragraph("• Count the total number of INADs for each airline in the semester")
    pdf.add_paragraph("• Flag airlines with 6 or more INADs (configurable threshold)")
    pdf.add_paragraph("• Airlines below this threshold are excluded from further analysis")

    pdf.add_heading3("WHY 6 INADs?")
    pdf.add_paragraph(
        "A small number of INADs (1-5) could easily be random occurrences. Setting a minimum threshold "
        "ensures we focus on statistically meaningful patterns rather than isolated incidents."
    )
    pdf.add_spacer(15)

    # Step 2
    pdf.add_heading2("Step 2: Route-Level Screening (Prüfstufe 2)")
    pdf.add_heading3("PURPOSE")
    pdf.add_paragraph("From airlines identified in Step 1, identify specific routes with elevated INAD counts")

    pdf.add_heading3("HOW IT WORKS")
    pdf.add_paragraph("• For each airline that passed Step 1, count INADs by route (origin airport)")
    pdf.add_paragraph("• Flag routes with 6 or more INADs")
    pdf.add_paragraph("• Routes below this threshold are excluded from Step 3")

    pdf.add_heading3("WHY ANALYZE BY ROUTE?")
    pdf.add_paragraph(
        "An airline might have high total INADs but concentrated on one route. This helps identify "
        "specific problem origins rather than penalizing an airline's entire operation."
    )
    pdf.add_spacer(15)

    # Step 3
    pdf.add_heading2("Step 3: Density Analysis (Prüfstufe 3)")
    pdf.add_heading3("PURPOSE")
    pdf.add_paragraph("Compare INAD counts against passenger volumes to identify disproportionately high rates")

    pdf.add_heading3("HOW IT WORKS")
    pdf.add_paragraph("1. For each route from Step 2, retrieve the passenger count (PAX)")
    pdf.add_paragraph("2. Calculate the INAD density: (INADs / PAX) × 1000")
    pdf.add_paragraph("   This gives INADs per 1,000 passengers", style='small')
    pdf.add_paragraph("3. Calculate the threshold (median of all densities)")
    pdf.add_paragraph("4. Flag routes above the threshold for legal review")
    pdf.add_spacer(10)

    pdf.add_heading3("WHY USE DENSITY INSTEAD OF RAW COUNTS?")
    pdf.add_paragraph(
        "Raw INAD counts favor large airlines unfairly. A route with 20 INADs and 500,000 passengers "
        "(0.04‰) is performing better than a route with 10 INADs and 20,000 passengers (0.50‰). "
        "Density provides a fair, relative comparison across different traffic volumes."
    )

    pdf.add_page_break()

    # ========== SECTION 3: ENHANCED FEATURES ==========
    pdf.add_heading1("03 — Understanding the Enhanced Features")
    pdf.add_divider()

    pdf.add_paragraph(
        "The enhanced version introduces several improvements to make the analysis more reliable and "
        "actionable for legal review."
    )
    pdf.add_spacer(15)

    # Feature 3.1
    pdf.add_heading2("3.1 Robust Threshold Calculation")

    # Using Paragraph objects for proper text wrapping
    threshold_comparison = [
        [make_table_paragraph('Approach', bold=True),
         make_table_paragraph('Method', bold=True),
         make_table_paragraph('Issue / Benefit', bold=True)],
        [make_table_paragraph('PREVIOUS'),
         make_table_paragraph('Simple arithmetic mean (average)'),
         make_table_paragraph('Highly sensitive to outliers; one extreme value can skew results')],
        [make_table_paragraph('NEW'),
         make_table_paragraph('Median (middle value)'),
         make_table_paragraph('Not affected by outliers; one bad data point cannot skew analysis')],
    ]
    pdf.add_table(threshold_comparison, col_widths=[1.2*inch, 2*inch, 2.3*inch])

    pdf.add_paragraph(
        "The median is the middle value when all densities are sorted. Unlike the mean, it provides "
        "robust statistics that are standard in scientific research, financial analysis, and regulatory contexts."
    )
    pdf.add_spacer(15)

    # Feature 3.2
    pdf.add_heading2("3.2 Minimum Passenger Threshold")

    passenger_comparison = [
        [make_table_paragraph('Approach', bold=True),
         make_table_paragraph('Method', bold=True),
         make_table_paragraph('Issue / Benefit', bold=True)],
        [make_table_paragraph('PREVIOUS'),
         make_table_paragraph('All routes included regardless of volume'),
         make_table_paragraph('Routes with few passengers produce unreliable densities')],
        [make_table_paragraph('NEW'),
         make_table_paragraph('Routes with <5,000 passengers marked UNRELIABLE'),
         make_table_paragraph('Clear warnings; excluded from threshold calculation')],
    ]
    pdf.add_table(passenger_comparison, col_widths=[1.2*inch, 2*inch, 2.3*inch])

    pdf.add_paragraph(
        "Routes marked UNRELIABLE are still shown but flagged with a warning. The legal team can see them "
        "but should interpret with caution. They do not influence the threshold calculation."
    )
    pdf.add_spacer(15)

    # Feature 3.3
    pdf.add_heading2("3.3 Priority Classification System")

    pdf.add_paragraph(
        "The new approach uses a four-tier priority classification system instead of simple "
        "\"above/below average\" binary classification:"
    )
    pdf.add_spacer(10)

    priority_table = [
        [make_table_paragraph('Priority Level', bold=True),
         make_table_paragraph('Criteria', bold=True),
         make_table_paragraph('Action', bold=True)],
        [make_table_paragraph('[RED] HIGH PRIORITY'),
         make_table_paragraph('Density ≥1.5× threshold AND ≥0.10‰ AND ≥10 INADs AND ≥5,000 PAX'),
         make_table_paragraph('Immediate legal review required')],
        [make_table_paragraph('[ORANGE] WATCH LIST'),
         make_table_paragraph('Density ≥ threshold but does not meet all HIGH criteria'),
         make_table_paragraph('Monitor; may escalate')],
        [make_table_paragraph('[GREEN] CLEAR'),
         make_table_paragraph('Density < threshold'),
         make_table_paragraph('No action required')],
        [make_table_paragraph('[GREY] UNRELIABLE'),
         make_table_paragraph('Fewer than 5,000 passengers or incomplete data'),
         make_table_paragraph('Do not take enforcement action')],
    ]
    pdf.add_table(priority_table, col_widths=[1.5*inch, 2.2*inch, 1.8*inch])

    pdf.add_page_break()

    # Feature 3.4
    pdf.add_heading2("3.4 Confidence Scoring")

    pdf.add_paragraph(
        "Each route receives a confidence score from 0-100% based on INAD count and passenger volume:"
    )
    pdf.add_spacer(5)

    confidence_table = [
        [make_table_paragraph('Confidence Range', bold=True),
         make_table_paragraph('Interpretation', bold=True)],
        [make_table_paragraph('0-30%'),
         make_table_paragraph('Low confidence – treat results with caution')],
        [make_table_paragraph('30-60%'),
         make_table_paragraph('Medium confidence – results are indicative')],
        [make_table_paragraph('60-100%'),
         make_table_paragraph('High confidence – results are reliable')],
    ]
    pdf.add_table(confidence_table, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_spacer(15)

    # Feature 3.5
    pdf.add_heading2("3.5 Data Quality Checks")

    pdf.add_paragraph("Automatic data quality checks with warnings:")
    pdf.add_spacer(5)

    quality_checks = [
        [make_table_paragraph('Warning', bold=True),
         make_table_paragraph('Meaning', bold=True)],
        [make_table_paragraph('Incomplete PAX data (2/6 months)'),
         make_table_paragraph('Passenger data exists for fewer than 4 of 6 months; density may be inaccurate')],
        [make_table_paragraph('Low PAX volume (<5,000)'),
         make_table_paragraph('Total passengers too low for reliable statistics')],
        [make_table_paragraph('High variance in monthly PAX data'),
         make_table_paragraph('Unusual fluctuations may indicate data recording issues')],
    ]
    pdf.add_table(quality_checks, col_widths=[2.5*inch, 3*inch])

    pdf.add_spacer(15)

    # Feature 3.6
    pdf.add_heading2("3.6 Systemic Case Detection")

    pdf.add_paragraph(
        "Multi-semester analysis identifies SYSTEMIC cases — routes that appear on the WATCH LIST or "
        "HIGH PRIORITY in 2 or more consecutive semesters. This helps the legal team distinguish between "
        "one-time issues and persistent patterns."
    )
    pdf.add_spacer(10)

    pdf.add_paragraph("Additional information provided for systemic cases:")
    pdf.add_paragraph("• Total appearances across all semesters")
    pdf.add_paragraph("• Maximum consecutive appearances")
    pdf.add_paragraph("• Trend direction (IMPROVING or WORSENING)")
    pdf.add_paragraph("• Percentage change in density over time")

    pdf.add_spacer(15)

    # Feature 3.7
    pdf.add_heading2("3.7 Refusal Code Categorization")

    pdf.add_paragraph("Refusal codes are now categorized to understand the nature of problems:")
    pdf.add_spacer(5)

    refusal_categories = [
        [make_table_paragraph('Category', bold=True),
         make_table_paragraph('Examples', bold=True)],
        [make_table_paragraph('Documentation'),
         make_table_paragraph('Missing or invalid travel documents')],
        [make_table_paragraph('Fraud'),
         make_table_paragraph('Forged or falsified documents')],
        [make_table_paragraph('Visa'),
         make_table_paragraph('Visa-related issues (expired, wrong type, overstay)')],
        [make_table_paragraph('Security'),
         make_table_paragraph('Security concerns, entry bans')],
    ]
    pdf.add_table(refusal_categories, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_paragraph(
        "This categorization helps understand the NATURE of the problem and informs appropriate responses.",
        style='body'
    )

    pdf.add_page_break()

    # ========== SECTION 4: DASHBOARD INTERFACE ==========
    pdf.add_heading1("04 — The Dashboard Interface")
    pdf.add_divider()

    pdf.add_paragraph(
        "The dashboard provides six main tabs for navigating the analysis, with support for three languages "
        "(English, German, French) via the language switcher in the sidebar."
    )
    pdf.add_spacer(15)

    # Tab descriptions
    tabs = [
        ('Tab 1: Overview', [
            'Quick summary of the entire analysis:',
            '• Summary metrics (total INADs, counts by priority level)',
            '• Priority distribution pie chart',
            '• Confidence score distribution',
            '• Data quality warnings',
            '• Top routes by density',
            '• Refusal category breakdown for flagged routes'
        ]),
        ('Tab 2: Step 1 — Airlines', [
            'Review airline-level screening results:',
            '• List of all airlines with INAD counts',
            '• Color-coded status (Review / OK)',
            '• Summary statistics',
            '• Distribution histogram'
        ]),
        ('Tab 3: Step 2 — Routes', [
            'Review route-level screening results:',
            '• List of all routes with INAD counts',
            '• Filter to airlines passing Step 1 only',
            '• Top airports by INAD count'
        ]),
        ('Tab 4: Step 3 — Priority Analysis', [
            'Detailed priority classification with full metrics:',
            '• Classification criteria explanation',
            '• Complete route list with density, confidence, and priority',
            '• Interactive scatter plot (density vs. passengers)',
            '• Summary of HIGH PRIORITY and WATCH LIST counts'
        ]),
        ('Tab 5: Systemic Cases', [
            'Identify persistent patterns across multiple semesters:',
            '• Count of confirmed systemic cases',
            '• Trend analysis (improving/worsening)',
            '• Historical chart of flagged routes over time',
            '• Individual route history viewer'
        ]),
        ('Tab 6: Legal Summary', [
            'Export-ready summary for legal team:',
            '• Analysis parameters used',
            '• List of HIGH PRIORITY routes with details',
            '• List of WATCH LIST routes with details',
            '• Data quality notes',
            '• Export buttons for CSV downloads'
        ])
    ]

    for tab_name, items in tabs:
        pdf.add_heading2(tab_name)
        for item in items:
            pdf.add_paragraph(item)
        pdf.add_spacer(10)

    pdf.add_page_break()

    # ========== SECTION 5: INTERPRETING RESULTS ==========
    pdf.add_heading1("05 — Interpreting Results for Legal Review")
    pdf.add_divider()

    pdf.add_heading2("Recommended Review Process")
    pdf.add_spacer(10)

    review_steps = [
        [make_table_paragraph('Step', bold=True),
         make_table_paragraph('Action', bold=True)],
        [make_table_paragraph('1. Start with Legal Summary Tab'),
         make_table_paragraph('Review HIGH PRIORITY routes first. These have the strongest statistical basis for action. Note confidence scores.')],
        [make_table_paragraph('2. Check for Systemic Cases'),
         make_table_paragraph('Routes appearing as systemic have persisted over time. Review their trend — worsening trends are more concerning.')],
        [make_table_paragraph('3. Review Watch List'),
         make_table_paragraph('Routes above average but not meeting all HIGH criteria. May escalate to HIGH PRIORITY next semester.')],
        [make_table_paragraph('4. Note Data Quality Warnings'),
         make_table_paragraph('Be cautious with UNRELIABLE classifications. If a route has quality warnings, results may not support action.')],
        [make_table_paragraph('5. Export for Documentation'),
         make_table_paragraph('Use export buttons to create records. Include analysis parameters in your documentation.')],
    ]
    pdf.add_table(review_steps, col_widths=[1.8*inch, 3.7*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("What Each Priority Level Means for Action")
    pdf.add_spacer(10)

    action_guidance = [
        [make_table_paragraph('Priority', bold=True),
         make_table_paragraph('Statistical Basis', bold=True),
         make_table_paragraph('Recommended Action', bold=True)],
        [make_table_paragraph('[RED] HIGH PRIORITY'),
         make_table_paragraph('Strong'),
         make_table_paragraph('Formal investigation, potential warning or fine')],
        [make_table_paragraph('[ORANGE] WATCH LIST'),
         make_table_paragraph('Moderate'),
         make_table_paragraph('Monitor, consider informal outreach')],
        [make_table_paragraph('[GREEN] CLEAR'),
         make_table_paragraph('Below threshold'),
         make_table_paragraph('No action required')],
        [make_table_paragraph('[GREY] UNRELIABLE'),
         make_table_paragraph('Insufficient data'),
         make_table_paragraph('Do not take enforcement action')],
    ]
    pdf.add_table(action_guidance, col_widths=[1.7*inch, 1.5*inch, 2.3*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("Important Caveats")

    pdf.add_paragraph(
        "1. Statistical indicators are not proof — High density indicates a pattern worth investigating, "
        "but root cause analysis is still required before action.",
        style='body'
    )
    pdf.add_paragraph(
        "2. Context matters — Some origins may have inherently higher INAD rates. Consider geopolitical "
        "factors, visa regimes, etc.",
        style='body'
    )
    pdf.add_paragraph(
        "3. Data limitations — Passenger data may be incomplete for some routes. Always check data quality warnings.",
        style='body'
    )
    pdf.add_paragraph(
        "4. Threshold is relative — Being above the median means above half of peers. It does not mean "
        "the absolute rate is necessarily problematic.",
        style='body'
    )

    pdf.add_page_break()

    # ========== SECTION 6: WHY MORE ROBUST ==========
    pdf.add_heading1("06 — Why the New Approach is More Robust")
    pdf.add_divider()

    pdf.add_heading2("Comparison: Old vs. New Methodology")
    pdf.add_spacer(10)

    methodology_comparison = [
        [make_table_paragraph('Issue', bold=True),
         make_table_paragraph('Old Approach', bold=True),
         make_table_paragraph('New Approach', bold=True)],
        [make_table_paragraph('Outlier Sensitivity'),
         make_table_paragraph('One route with bad data could skew entire semester results'),
         make_table_paragraph('Median-based threshold ignores extreme values; data quality checks')],
        [make_table_paragraph('Classification'),
         make_table_paragraph('Binary: "above average" or "below average" with no distinction'),
         make_table_paragraph('Four-tier system with clear criteria; proportionate response')],
        [make_table_paragraph('Temporal View'),
         make_table_paragraph('Each semester analyzed in isolation'),
         make_table_paragraph('Systemic case detection across semesters; trend analysis')],
        [make_table_paragraph('Confidence'),
         make_table_paragraph('All results presented with equal weight'),
         make_table_paragraph('Confidence scores based on sample size; clear warnings')],
        [make_table_paragraph('Data Quality'),
         make_table_paragraph('Issues not detected or reported'),
         make_table_paragraph('Automatic quality checks; visible warnings in dashboard')],
    ]
    pdf.add_table(methodology_comparison, col_widths=[1.3*inch, 2.1*inch, 2.1*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("Statistical Validity")

    pdf.add_paragraph(
        "The new approach follows established statistical best practices:"
    )
    pdf.add_spacer(5)

    pdf.add_paragraph(
        "• Robust statistics — Using median instead of mean is standard when outliers may be present. "
        "It is used in scientific research, financial analysis, and regulatory contexts worldwide."
    )
    pdf.add_paragraph(
        "• Minimum sample size — The 5,000 passenger threshold ensures density calculations are based "
        "on sufficient data."
    )
    pdf.add_paragraph(
        "• Multi-period analysis — Looking at patterns across multiple semesters reduces the chance of "
        "acting on random fluctuations."
    )
    pdf.add_paragraph(
        "• Confidence scoring — Provides an intuitive measure of reliability that helps non-statisticians "
        "interpret results appropriately."
    )

    pdf.add_page_break()

    # ========== SECTION 7: CONFIGURATION ==========
    pdf.add_heading1("07 — Configuration Parameters")
    pdf.add_divider()

    pdf.add_paragraph(
        "All parameters can be adjusted in the dashboard sidebar to customize the analysis sensitivity "
        "and thresholds."
    )
    pdf.add_spacer(15)

    # Parameter 1
    pdf.add_heading2("Minimum INAD Threshold (Default: 6)")
    pdf.add_paragraph("What it does: Sets the minimum number of INADs for Step 1 and Step 2")
    pdf.add_spacer(5)

    param1_data = [
        [make_table_paragraph('Setting', bold=True),
         make_table_paragraph('Recommendation', bold=True)],
        [make_table_paragraph('6 (default)'),
         make_table_paragraph('Standard setting, balances sensitivity and specificity')],
        [make_table_paragraph('Lower (3-5)'),
         make_table_paragraph('More sensitive, catches smaller patterns')],
        [make_table_paragraph('Higher (8-10)'),
         make_table_paragraph('More conservative, only flags clear patterns')],
    ]
    pdf.add_table(param1_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 2
    pdf.add_heading2("Minimum PAX for Reliable Data (Default: 5,000)")
    pdf.add_paragraph("What it does: Routes with fewer passengers are marked UNRELIABLE")
    pdf.add_spacer(5)

    param2_data = [
        [make_table_paragraph('Setting', bold=True),
         make_table_paragraph('Recommendation', bold=True)],
        [make_table_paragraph('5,000 (default)'),
         make_table_paragraph('Standard setting, reasonable statistical basis')],
        [make_table_paragraph('Lower'),
         make_table_paragraph('Include more routes but with less confidence')],
        [make_table_paragraph('Higher'),
         make_table_paragraph('More conservative, only highest-confidence results')],
    ]
    pdf.add_table(param2_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 3
    pdf.add_heading2("Threshold Calculation Method (Default: Median)")
    pdf.add_paragraph("Options for calculating the density threshold:")
    pdf.add_spacer(5)

    param3_data = [
        [make_table_paragraph('Method', bold=True),
         make_table_paragraph('Recommendation', bold=True)],
        [make_table_paragraph('Median'),
         make_table_paragraph('Middle value, most robust against outliers (RECOMMENDED)')],
        [make_table_paragraph('Trimmed Mean'),
         make_table_paragraph('Removes top/bottom 10% then averages')],
        [make_table_paragraph('Mean'),
         make_table_paragraph('Simple average (NOT RECOMMENDED — sensitive to outliers)')],
    ]
    pdf.add_table(param3_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 4
    pdf.add_heading2("Minimum Density for HIGH PRIORITY (Default: 0.10‰)")
    pdf.add_paragraph("What it does: Even if above threshold, must exceed this absolute minimum")
    pdf.add_spacer(5)

    param4_data = [
        [make_table_paragraph('Setting', bold=True),
         make_table_paragraph('Recommendation', bold=True)],
        [make_table_paragraph('0.10‰ (default)'),
         make_table_paragraph('Standard setting')],
        [make_table_paragraph('Lower'),
         make_table_paragraph('More routes qualify as HIGH PRIORITY')],
        [make_table_paragraph('Higher'),
         make_table_paragraph('Only the most severe cases flagged')],
    ]
    pdf.add_table(param4_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 5
    pdf.add_heading2("HIGH PRIORITY Multiplier (Default: 1.5×)")
    pdf.add_paragraph("What it does: Must be this multiple of threshold for HIGH PRIORITY")
    pdf.add_spacer(5)

    param5_data = [
        [make_table_paragraph('Setting', bold=True),
         make_table_paragraph('Recommendation', bold=True)],
        [make_table_paragraph('1.5× (default)'),
         make_table_paragraph('Standard setting (50% above threshold)')],
        [make_table_paragraph('Lower (1.2-1.3)'),
         make_table_paragraph('More sensitive')],
        [make_table_paragraph('Higher (2.0+)'),
         make_table_paragraph('Only extreme cases flagged')],
    ]
    pdf.add_table(param5_data, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_page_break()

    # ========== SECTION 8: GLOSSARY ==========
    pdf.add_heading1("08 — Glossary of Terms")
    pdf.add_divider()
    pdf.add_spacer(10)

    glossary_terms = [
        [make_table_paragraph('Term', bold=True),
         make_table_paragraph('Definition', bold=True)],
        [make_table_paragraph('BAZL'),
         make_table_paragraph('Bundesamt für Zivilluftfahrt (Swiss Federal Office of Civil Aviation). Source of passenger volume data.')],
        [make_table_paragraph('Confidence Score'),
         make_table_paragraph('A 0-100% score indicating how reliable the density calculation is, based on INAD count and passenger volume.')],
        [make_table_paragraph('Density (INAD-Dichtewert)'),
         make_table_paragraph('INADs per 1,000 passengers: (INAD count / PAX) × 1000. Expressed in per-mille (‰).')],
        [make_table_paragraph('HIGH PRIORITY'),
         make_table_paragraph('Routes requiring immediate legal review. Meet all criteria: high density, high INAD count, reliable data.')],
        [make_table_paragraph('INAD'),
         make_table_paragraph('Inadmissible Passenger. A passenger refused entry at the border for various reasons.')],
        [make_table_paragraph('Last Stop'),
         make_table_paragraph('The final departure airport before arriving in Switzerland. Used to identify the origin of INAD cases.')],
        [make_table_paragraph('Median'),
         make_table_paragraph('The middle value in a sorted list. Unlike the mean, it is not affected by extreme values.')],
        [make_table_paragraph('PAX'),
         make_table_paragraph('Passengers (abbreviation used in aviation industry).')],
        [make_table_paragraph('Semester'),
         make_table_paragraph('Six-month period used for analysis. H1: January-June, H2: July-December.')],
        [make_table_paragraph('Systemic Case'),
         make_table_paragraph('A route flagged in 2+ consecutive semesters. Indicates a persistent pattern.')],
        [make_table_paragraph('Threshold'),
         make_table_paragraph('The density value used to separate "above average" from "below." Calculated using median of reliable route densities.')],
        [make_table_paragraph('UNRELIABLE'),
         make_table_paragraph('Classification for routes with insufficient data. Should not be used as basis for enforcement action.')],
        [make_table_paragraph('WATCH LIST'),
         make_table_paragraph('Routes above threshold but not meeting all HIGH PRIORITY criteria. Should be monitored.')],
    ]
    pdf.add_table(glossary_terms, col_widths=[1.5*inch, 4*inch])

    pdf.add_page_break()

    # ========== FINAL PAGE ==========
    pdf.add_spacer(100)
    pdf.add_divider(color=COLOR_PRIMARY_GOLD, thickness=2)
    pdf.add_spacer(30)

    pdf.add_heading2("Document Information")
    pdf.add_spacer(10)

    doc_info = [
        [make_table_paragraph('Document Version', bold=True),
         make_table_paragraph('2.1')],
        [make_table_paragraph('Last Updated', bold=True),
         make_table_paragraph('December 2024')],
        [make_table_paragraph('Tool Version', bold=True),
         make_table_paragraph('Enhanced INAD Analysis Tool 2.1')],
        [make_table_paragraph('Languages Supported', bold=True),
         make_table_paragraph('English, German (Deutsch), French (Français)')],
    ]
    pdf.add_table(doc_info, col_widths=[2*inch, 3.5*inch], style='minimal')

    pdf.add_spacer(30)
    pdf.add_divider(color=COLOR_PRIMARY_GOLD, thickness=2)
    pdf.add_spacer(20)

    pdf.add_paragraph(
        "For technical support or questions about this documentation, contact the data analysis team.",
        style='small'
    )

    # Build the PDF
    pdf.build()
    print("✓ INAD Analysis User Documentation generated successfully!")
    print("✓ File: INAD_Analysis_User_Documentation_v2.1.pdf")


if __name__ == "__main__":
    generate_inad_documentation()
