#!/usr/bin/env python3
"""
Generate INAD Analysis User Documentation - GERMAN VERSION
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

def generate_inad_documentation_de():
    """Generate the complete INAD Analysis User Documentation in German."""

    pdf = LegalTechPDF("INAD_Analysis_User_Documentation_v2.1_DE.pdf", "INAD Analyse Tool")

    # ========== COVER / TITLE PAGE ==========
    pdf.add_title("INAD Analyse Tool")
    pdf.add_paragraph("Benutzerdokumentation", style='body')
    pdf.add_spacer(10)
    pdf.add_paragraph("Erweiterte Version 2.1 – Mehrsprachige Ausgabe", style='accent')
    pdf.add_spacer(20)
    pdf.add_paragraph("Für die rechtliche Prüfung", style='body')
    pdf.add_paragraph("Dezember 2024", style='small')

    pdf.add_spacer(30)
    pdf.add_divider()
    pdf.add_page_break()

    # ========== TABLE OF CONTENTS ==========
    pdf.add_heading1("Inhaltsverzeichnis")
    pdf.add_spacer(10)

    toc_data = [
        ['Abschnitt', 'Seite'],
        ['01 — Einführung und Zweck', '3'],
        ['02 — Der dreistufige Analyseprozess', '4'],
        ['03 — Die erweiterten Funktionen verstehen', '6'],
        ['04 — Die Dashboard-Oberfläche', '10'],
        ['05 — Ergebnisse für die rechtliche Prüfung interpretieren', '12'],
        ['06 — Warum der neue Ansatz robuster ist', '14'],
        ['07 — Konfigurationsparameter', '15'],
        ['08 — Glossar der Begriffe', '17'],
    ]

    pdf.add_table(toc_data, col_widths=[4*inch, 1*inch], style='minimal')
    pdf.add_page_break()

    # ========== SECTION 1: INTRODUCTION ==========
    pdf.add_heading1("01 — Einführung und Zweck")
    pdf.add_divider()

    pdf.add_heading2("Was ist dieses Tool?")
    pdf.add_paragraph(
        "Das INAD Analyse Tool wurde entwickelt, um Fluggesellschaften und Routen mit systematisch "
        "erhöhten Raten von nicht zugelassenen Passagieren (INADs) zu identifizieren. Sein Zweck ist es, "
        "die rechtliche Prüfung zu unterstützen, indem unterschieden wird zwischen:"
    )

    pdf.add_spacer(5)
    pdf.add_paragraph("• Einzelfällen, die möglicherweise keine Maßnahmen erfordern", style='body')
    pdf.add_paragraph("• Systematischen Mustern, die Untersuchungen oder Durchsetzungsmaßnahmen rechtfertigen", style='body')
    pdf.add_spacer(10)

    pdf.add_paragraph("Das Tool verarbeitet zwei Datenquellen:")
    pdf.add_spacer(5)

    data_sources = [
        [make_table_paragraph('Datenquelle', bold=True),
         make_table_paragraph('Beschreibung', bold=True)],
        [make_table_paragraph('INAD-Aufzeichnungen'),
         make_table_paragraph('Fälle von Passagieren, denen die Einreise an Schweizer Grenzen verweigert wurde')],
        [make_table_paragraph('BAZL-Passagierdaten'),
         make_table_paragraph('Gesamte Passagiervolumen nach Fluggesellschaft und Route')],
    ]
    pdf.add_table(data_sources, col_widths=[2*inch, 3.5*inch], style='minimal')

    pdf.add_paragraph(
        "Durch den Vergleich von INAD-Zahlen mit Passagiervolumen können wir identifizieren, welche "
        "Fluggesellschaften oder Routen unverhältnismäßig hohe INAD-Raten im Verhältnis zu ihrem Verkehr "
        "aufweisen, was auf potenzielle systemische Probleme bei der Passagierkontrolle hindeutet."
    )

    pdf.add_spacer(15)
    pdf.add_heading2("Wer sollte diese Dokumentation verwenden?")
    pdf.add_paragraph(
        "Diese Dokumentation richtet sich an Mitglieder des Rechtsteams, die die Analyseergebnisse prüfen "
        "und Entscheidungen über weitere Untersuchungen, Warnungen oder Durchsetzungsmaßnahmen treffen. "
        "Technische Kenntnisse in Statistik oder Programmierung sind nicht erforderlich."
    )

    pdf.add_page_break()

    # ========== SECTION 2: THREE-STEP PROCESS ==========
    pdf.add_heading1("02 — Der dreistufige Analyseprozess")
    pdf.add_divider()

    pdf.add_paragraph(
        "Die Analyse folgt einem progressiven Filteransatz, wobei jeder Schritt den Fokus einengt, "
        "um die bedeutendsten Fälle zu identifizieren."
    )
    pdf.add_spacer(15)

    # Step 1
    pdf.add_heading2("Schritt 1: Screening auf Airline-Ebene (Prüfstufe 1)")
    pdf.add_heading3("ZWECK")
    pdf.add_paragraph("Fluggesellschaften mit einer aussagekräftigen Anzahl von INAD-Fällen identifizieren")

    pdf.add_heading3("FUNKTIONSWEISE")
    pdf.add_paragraph("• Zählung der Gesamtzahl der INADs für jede Fluggesellschaft im Semester")
    pdf.add_paragraph("• Kennzeichnung von Fluggesellschaften mit 6 oder mehr INADs (konfigurierbarer Schwellenwert)")
    pdf.add_paragraph("• Fluggesellschaften unter diesem Schwellenwert werden von weiteren Analysen ausgeschlossen")

    pdf.add_heading3("WARUM 6 INADs?")
    pdf.add_paragraph(
        "Eine kleine Anzahl von INADs (1-5) könnte leicht zufällige Ereignisse sein. Die Festlegung eines "
        "Mindestschwellenwerts stellt sicher, dass wir uns auf statistisch aussagekräftige Muster konzentrieren "
        "und nicht auf Einzelfälle."
    )
    pdf.add_spacer(15)

    # Step 2
    pdf.add_heading2("Schritt 2: Screening auf Routen-Ebene (Prüfstufe 2)")
    pdf.add_heading3("ZWECK")
    pdf.add_paragraph("Von den in Schritt 1 identifizierten Airlines spezifische Routen mit erhöhten INAD-Zahlen identifizieren")

    pdf.add_heading3("FUNKTIONSWEISE")
    pdf.add_paragraph("• Für jede Airline aus Schritt 1 werden INADs nach Route (Abflughafen) gezählt")
    pdf.add_paragraph("• Kennzeichnung von Routen mit 6 oder mehr INADs")
    pdf.add_paragraph("• Routen unter diesem Schwellenwert werden von Schritt 3 ausgeschlossen")

    pdf.add_heading3("WARUM NACH ROUTE ANALYSIEREN?")
    pdf.add_paragraph(
        "Eine Airline könnte insgesamt hohe INAD-Zahlen haben, diese aber auf eine Route konzentriert sein. "
        "Dies hilft, spezifische Problemquellen zu identifizieren, anstatt den gesamten Betrieb einer Airline zu bestrafen."
    )
    pdf.add_spacer(15)

    # Step 3
    pdf.add_heading2("Schritt 3: Dichteanalyse (Prüfstufe 3)")
    pdf.add_heading3("ZWECK")
    pdf.add_paragraph("INAD-Zahlen mit Passagiervolumen vergleichen, um unverhältnismäßig hohe Raten zu identifizieren")

    pdf.add_heading3("FUNKTIONSWEISE")
    pdf.add_paragraph("1. Für jede Route aus Schritt 2 wird die Passagierzahl (PAX) abgerufen")
    pdf.add_paragraph("2. Berechnung der INAD-Dichte: (INADs / PAX) × 1000")
    pdf.add_paragraph("   Dies ergibt INADs pro 1.000 Passagiere", style='small')
    pdf.add_paragraph("3. Berechnung des Schwellenwerts (Median aller Dichten)")
    pdf.add_paragraph("4. Kennzeichnung von Routen über dem Schwellenwert zur rechtlichen Prüfung")
    pdf.add_spacer(10)

    pdf.add_heading3("WARUM DICHTE STATT ABSOLUTE ZAHLEN?")
    pdf.add_paragraph(
        "Absolute INAD-Zahlen benachteiligen große Airlines unfair. Eine Route mit 20 INADs und 500.000 Passagieren "
        "(0,04‰) schneidet besser ab als eine Route mit 10 INADs und 20.000 Passagieren (0,50‰). "
        "Die Dichte ermöglicht einen fairen, relativen Vergleich über verschiedene Verkehrsvolumen hinweg."
    )

    pdf.add_page_break()

    # ========== SECTION 3: ENHANCED FEATURES ==========
    pdf.add_heading1("03 — Die erweiterten Funktionen verstehen")
    pdf.add_divider()

    pdf.add_paragraph(
        "Die erweiterte Version führt mehrere Verbesserungen ein, um die Analyse zuverlässiger und "
        "handlungsorientierter für die rechtliche Prüfung zu machen."
    )
    pdf.add_spacer(15)

    # Feature 3.1
    pdf.add_heading2("3.1 Robuste Schwellenwertberechnung")

    threshold_comparison = [
        [make_table_paragraph('Ansatz', bold=True),
         make_table_paragraph('Methode', bold=True),
         make_table_paragraph('Problem / Vorteil', bold=True)],
        [make_table_paragraph('VORHER'),
         make_table_paragraph('Einfacher arithmetischer Mittelwert (Durchschnitt)'),
         make_table_paragraph('Hochgradig empfindlich gegenüber Ausreißern; ein Extremwert kann Ergebnisse verzerren')],
        [make_table_paragraph('NEU'),
         make_table_paragraph('Median (Mittelwert)'),
         make_table_paragraph('Nicht von Ausreißern betroffen; ein schlechter Datenpunkt kann die Analyse nicht verzerren')],
    ]
    pdf.add_table(threshold_comparison, col_widths=[1.2*inch, 2*inch, 2.3*inch])

    pdf.add_paragraph(
        "Der Median ist der mittlere Wert, wenn alle Dichten sortiert sind. Im Gegensatz zum Mittelwert bietet er "
        "robuste Statistiken, die in der wissenschaftlichen Forschung, Finanzanalyse und regulatorischen Kontexten Standard sind."
    )
    pdf.add_spacer(15)

    # Feature 3.2
    pdf.add_heading2("3.2 Mindestpassagier-Schwellenwert")

    passenger_comparison = [
        [make_table_paragraph('Ansatz', bold=True),
         make_table_paragraph('Methode', bold=True),
         make_table_paragraph('Problem / Vorteil', bold=True)],
        [make_table_paragraph('VORHER'),
         make_table_paragraph('Alle Routen unabhängig vom Volumen einbezogen'),
         make_table_paragraph('Routen mit wenigen Passagieren erzeugen unzuverlässige Dichten')],
        [make_table_paragraph('NEU'),
         make_table_paragraph('Routen mit <5.000 Passagieren als UNZUVERLÄSSIG markiert'),
         make_table_paragraph('Klare Warnungen; von Schwellenwertberechnung ausgeschlossen')],
    ]
    pdf.add_table(passenger_comparison, col_widths=[1.2*inch, 2*inch, 2.3*inch])

    pdf.add_paragraph(
        "Als UNZUVERLÄSSIG markierte Routen werden weiterhin angezeigt, aber mit einer Warnung versehen. "
        "Das Rechtsteam kann sie einsehen, sollte sie aber mit Vorsicht interpretieren. Sie beeinflussen "
        "die Schwellenwertberechnung nicht."
    )
    pdf.add_spacer(15)

    # Feature 3.3
    pdf.add_heading2("3.3 Prioritätsklassifizierungssystem")

    pdf.add_paragraph(
        "Der neue Ansatz verwendet ein vierstufiges Prioritätsklassifizierungssystem anstelle einer einfachen "
        "\"über/unter Durchschnitt\" binären Klassifizierung:"
    )
    pdf.add_spacer(10)

    priority_table = [
        [make_table_paragraph('Prioritätsstufe', bold=True),
         make_table_paragraph('Kriterien', bold=True),
         make_table_paragraph('Maßnahme', bold=True)],
        [make_table_paragraph('[ROT] HOHE PRIORITÄT'),
         make_table_paragraph('Dichte ≥1,5× Schwellenwert UND ≥0,10‰ UND ≥10 INADs UND ≥5.000 PAX'),
         make_table_paragraph('Sofortige rechtliche Prüfung erforderlich')],
        [make_table_paragraph('[ORANGE] BEOBACHTUNGSLISTE'),
         make_table_paragraph('Dichte ≥ Schwellenwert, erfüllt aber nicht alle HOHE PRIORITÄT Kriterien'),
         make_table_paragraph('Beobachten; kann eskalieren')],
        [make_table_paragraph('[GRÜN] UNAUFFÄLLIG'),
         make_table_paragraph('Dichte < Schwellenwert'),
         make_table_paragraph('Keine Maßnahme erforderlich')],
        [make_table_paragraph('[GRAU] UNZUVERLÄSSIG'),
         make_table_paragraph('Weniger als 5.000 Passagiere oder unvollständige Daten'),
         make_table_paragraph('Keine Durchsetzungsmaßnahme ergreifen')],
    ]
    pdf.add_table(priority_table, col_widths=[1.5*inch, 2.2*inch, 1.8*inch])

    pdf.add_page_break()

    # Feature 3.4
    pdf.add_heading2("3.4 Konfidenz-Bewertung")

    pdf.add_paragraph(
        "Jede Route erhält einen Konfidenzwert von 0-100% basierend auf INAD-Anzahl und Passagiervolumen:"
    )
    pdf.add_spacer(5)

    confidence_table = [
        [make_table_paragraph('Konfidenzbereich', bold=True),
         make_table_paragraph('Interpretation', bold=True)],
        [make_table_paragraph('0-30%'),
         make_table_paragraph('Geringe Konfidenz – Ergebnisse mit Vorsicht behandeln')],
        [make_table_paragraph('30-60%'),
         make_table_paragraph('Mittlere Konfidenz – Ergebnisse sind indikativ')],
        [make_table_paragraph('60-100%'),
         make_table_paragraph('Hohe Konfidenz – Ergebnisse sind zuverlässig')],
    ]
    pdf.add_table(confidence_table, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_spacer(15)

    # Feature 3.5
    pdf.add_heading2("3.5 Datenqualitätsprüfungen")

    pdf.add_paragraph("Automatische Datenqualitätsprüfungen mit Warnungen:")
    pdf.add_spacer(5)

    quality_checks = [
        [make_table_paragraph('Warnung', bold=True),
         make_table_paragraph('Bedeutung', bold=True)],
        [make_table_paragraph('Unvollständige PAX-Daten (2/6 Monate)'),
         make_table_paragraph('Passagierdaten existieren für weniger als 4 von 6 Monaten; Dichte kann ungenau sein')],
        [make_table_paragraph('Niedriges PAX-Volumen (<5.000)'),
         make_table_paragraph('Gesamtpassagierzahl zu niedrig für zuverlässige Statistiken')],
        [make_table_paragraph('Hohe Varianz in monatlichen PAX-Daten'),
         make_table_paragraph('Ungewöhnliche Schwankungen können auf Datenerfassungsprobleme hinweisen')],
    ]
    pdf.add_table(quality_checks, col_widths=[2.5*inch, 3*inch])

    pdf.add_spacer(15)

    # Feature 3.6
    pdf.add_heading2("3.6 Erkennung systematischer Fälle")

    pdf.add_paragraph(
        "Die Mehrsemester-Analyse identifiziert SYSTEMATISCHE Fälle — Routen, die in 2 oder mehr aufeinanderfolgenden "
        "Semestern auf der BEOBACHTUNGSLISTE oder HOHEN PRIORITÄT erscheinen. Dies hilft dem Rechtsteam, zwischen "
        "einmaligen Problemen und anhaltenden Mustern zu unterscheiden."
    )
    pdf.add_spacer(10)

    pdf.add_paragraph("Zusätzliche Informationen für systematische Fälle:")
    pdf.add_paragraph("• Gesamtauftreten über alle Semester")
    pdf.add_paragraph("• Maximale aufeinanderfolgende Auftreten")
    pdf.add_paragraph("• Trendrichtung (VERBESSERND oder VERSCHLECHTERND)")
    pdf.add_paragraph("• Prozentuale Änderung der Dichte im Zeitverlauf")

    pdf.add_spacer(15)

    # Feature 3.7
    pdf.add_heading2("3.7 Kategorisierung der Verweigerungscodes")

    pdf.add_paragraph("Verweigerungscodes werden nun kategorisiert, um die Art der Probleme zu verstehen:")
    pdf.add_spacer(5)

    refusal_categories = [
        [make_table_paragraph('Kategorie', bold=True),
         make_table_paragraph('Beispiele', bold=True)],
        [make_table_paragraph('Dokumentation'),
         make_table_paragraph('Fehlende oder ungültige Reisedokumente')],
        [make_table_paragraph('Betrug'),
         make_table_paragraph('Gefälschte oder verfälschte Dokumente')],
        [make_table_paragraph('Visum'),
         make_table_paragraph('Visumsbezogene Probleme (abgelaufen, falscher Typ, Überschreitung)')],
        [make_table_paragraph('Sicherheit'),
         make_table_paragraph('Sicherheitsbedenken, Einreiseverbote')],
    ]
    pdf.add_table(refusal_categories, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_paragraph(
        "Diese Kategorisierung hilft, die NATUR des Problems zu verstehen und angemessene Reaktionen zu informieren.",
        style='body'
    )

    pdf.add_page_break()

    # ========== SECTION 4: DASHBOARD INTERFACE ==========
    pdf.add_heading1("04 — Die Dashboard-Oberfläche")
    pdf.add_divider()

    pdf.add_paragraph(
        "Das Dashboard bietet sechs Hauptregisterkarten zur Navigation durch die Analyse, mit Unterstützung "
        "für drei Sprachen (Englisch, Deutsch, Französisch) über den Sprachwechsler in der Seitenleiste."
    )
    pdf.add_spacer(15)

    # Tab descriptions
    tabs = [
        ('Tab 1: Übersicht', [
            'Schnellzusammenfassung der gesamten Analyse:',
            '• Zusammenfassungsmetriken (Gesamt-INADs, Anzahl nach Prioritätsstufe)',
            '• Kreisdiagramm zur Prioritätsverteilung',
            '• Konfidenzwert-Verteilung',
            '• Datenqualitätswarnungen',
            '• Top-Routen nach Dichte',
            '• Aufschlüsselung der Verweigerungskategorien für gekennzeichnete Routen'
        ]),
        ('Tab 2: Schritt 1 — Airlines', [
            'Überprüfung der Screening-Ergebnisse auf Airline-Ebene:',
            '• Liste aller Airlines mit INAD-Zahlen',
            '• Farbcodierter Status (Prüfung / OK)',
            '• Zusammenfassungsstatistiken',
            '• Verteilungshistogramm'
        ]),
        ('Tab 3: Schritt 2 — Routen', [
            'Überprüfung der Screening-Ergebnisse auf Routen-Ebene:',
            '• Liste aller Routen mit INAD-Zahlen',
            '• Filter nur für Airlines aus Schritt 1',
            '• Top-Flughäfen nach INAD-Anzahl'
        ]),
        ('Tab 4: Schritt 3 — Prioritätsanalyse', [
            'Detaillierte Prioritätsklassifizierung mit vollständigen Metriken:',
            '• Erklärung der Klassifizierungskriterien',
            '• Vollständige Routenliste mit Dichte, Konfidenz und Priorität',
            '• Interaktives Streudiagramm (Dichte vs. Passagiere)',
            '• Zusammenfassung der HOHEN PRIORITÄT und BEOBACHTUNGSLISTE Anzahl'
        ]),
        ('Tab 5: Systematische Fälle', [
            'Identifizierung persistenter Muster über mehrere Semester:',
            '• Anzahl bestätigter systematischer Fälle',
            '• Trendanalyse (verbessernd/verschlechternd)',
            '• Historisches Diagramm gekennzeichneter Routen im Zeitverlauf',
            '• Individueller Routen-Verlauf-Viewer'
        ]),
        ('Tab 6: Rechtliche Zusammenfassung', [
            'Exportbereite Zusammenfassung für das Rechtsteam:',
            '• Verwendete Analyseparameter',
            '• Liste der HOHEN PRIORITÄT Routen mit Details',
            '• Liste der BEOBACHTUNGSLISTE Routen mit Details',
            '• Datenqualitätshinweise',
            '• Export-Schaltflächen für CSV-Downloads'
        ])
    ]

    for tab_name, items in tabs:
        pdf.add_heading2(tab_name)
        for item in items:
            pdf.add_paragraph(item)
        pdf.add_spacer(10)

    pdf.add_page_break()

    # ========== SECTION 5: INTERPRETING RESULTS ==========
    pdf.add_heading1("05 — Ergebnisse für die rechtliche Prüfung interpretieren")
    pdf.add_divider()

    pdf.add_heading2("Empfohlener Prüfprozess")
    pdf.add_spacer(10)

    review_steps = [
        [make_table_paragraph('Schritt', bold=True),
         make_table_paragraph('Maßnahme', bold=True)],
        [make_table_paragraph('1. Mit Rechtlicher Zusammenfassung beginnen'),
         make_table_paragraph('HOHE PRIORITÄT Routen zuerst prüfen. Diese haben die stärkste statistische Grundlage für Maßnahmen. Konfidenzwerte beachten.')],
        [make_table_paragraph('2. Nach systematischen Fällen suchen'),
         make_table_paragraph('Routen, die als systematisch erscheinen, haben über die Zeit persistiert. Trend prüfen — sich verschlechternde Trends sind besorgniserregender.')],
        [make_table_paragraph('3. Beobachtungsliste prüfen'),
         make_table_paragraph('Routen über dem Durchschnitt, die aber nicht alle HOHE Kriterien erfüllen. Können im nächsten Semester zu HOHER PRIORITÄT eskalieren.')],
        [make_table_paragraph('4. Datenqualitätswarnungen beachten'),
         make_table_paragraph('Vorsicht bei UNZUVERLÄSSIGEN Klassifizierungen. Wenn eine Route Qualitätswarnungen hat, unterstützen Ergebnisse möglicherweise keine Maßnahmen.')],
        [make_table_paragraph('5. Für Dokumentation exportieren'),
         make_table_paragraph('Export-Schaltflächen verwenden, um Aufzeichnungen zu erstellen. Analyseparameter in Dokumentation einbeziehen.')],
    ]
    pdf.add_table(review_steps, col_widths=[1.8*inch, 3.7*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("Was jede Prioritätsstufe für Maßnahmen bedeutet")
    pdf.add_spacer(10)

    action_guidance = [
        [make_table_paragraph('Priorität', bold=True),
         make_table_paragraph('Statistische Basis', bold=True),
         make_table_paragraph('Empfohlene Maßnahme', bold=True)],
        [make_table_paragraph('[ROT] HOHE PRIORITÄT'),
         make_table_paragraph('Stark'),
         make_table_paragraph('Formelle Untersuchung, mögliche Warnung oder Geldstrafe')],
        [make_table_paragraph('[ORANGE] BEOBACHTUNGSLISTE'),
         make_table_paragraph('Moderat'),
         make_table_paragraph('Beobachten, informelle Kontaktaufnahme erwägen')],
        [make_table_paragraph('[GRÜN] UNAUFFÄLLIG'),
         make_table_paragraph('Unter Schwellenwert'),
         make_table_paragraph('Keine Maßnahme erforderlich')],
        [make_table_paragraph('[GRAU] UNZUVERLÄSSIG'),
         make_table_paragraph('Unzureichende Daten'),
         make_table_paragraph('Keine Durchsetzungsmaßnahme ergreifen')],
    ]
    pdf.add_table(action_guidance, col_widths=[1.7*inch, 1.5*inch, 2.3*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("Wichtige Vorbehalte")

    pdf.add_paragraph(
        "1. Statistische Indikatoren sind kein Beweis — Hohe Dichte deutet auf ein untersuchungswürdiges Muster hin, "
        "aber vor Maßnahmen ist noch eine Ursachenanalyse erforderlich.",
        style='body'
    )
    pdf.add_paragraph(
        "2. Kontext ist wichtig — Einige Herkunftsorte können inhärent höhere INAD-Raten haben. Geopolitische "
        "Faktoren, Visaregime usw. berücksichtigen.",
        style='body'
    )
    pdf.add_paragraph(
        "3. Datenlimitierungen — Passagierdaten können für einige Routen unvollständig sein. Immer Datenqualitätswarnungen prüfen.",
        style='body'
    )
    pdf.add_paragraph(
        "4. Schwellenwert ist relativ — Über dem Median zu liegen bedeutet über der Hälfte der Vergleichsgruppe. "
        "Es bedeutet nicht, dass die absolute Rate notwendigerweise problematisch ist.",
        style='body'
    )

    pdf.add_page_break()

    # ========== SECTION 6: WHY MORE ROBUST ==========
    pdf.add_heading1("06 — Warum der neue Ansatz robuster ist")
    pdf.add_divider()

    pdf.add_heading2("Vergleich: Alte vs. neue Methodik")
    pdf.add_spacer(10)

    methodology_comparison = [
        [make_table_paragraph('Problem', bold=True),
         make_table_paragraph('Alter Ansatz', bold=True),
         make_table_paragraph('Neuer Ansatz', bold=True)],
        [make_table_paragraph('Ausreißer-Empfindlichkeit'),
         make_table_paragraph('Eine Route mit schlechten Daten konnte gesamte Semesterergebnisse verzerren'),
         make_table_paragraph('Median-basierter Schwellenwert ignoriert Extremwerte; Datenqualitätsprüfungen')],
        [make_table_paragraph('Klassifizierung'),
         make_table_paragraph('Binär: "über Durchschnitt" oder "unter Durchschnitt" ohne Unterscheidung'),
         make_table_paragraph('Vierstufiges System mit klaren Kriterien; proportionale Reaktion')],
        [make_table_paragraph('Zeitliche Ansicht'),
         make_table_paragraph('Jedes Semester isoliert analysiert'),
         make_table_paragraph('Systematische Fallerkennung über Semester; Trendanalyse')],
        [make_table_paragraph('Konfidenz'),
         make_table_paragraph('Alle Ergebnisse mit gleichem Gewicht präsentiert'),
         make_table_paragraph('Konfidenzwerte basierend auf Stichprobengröße; klare Warnungen')],
        [make_table_paragraph('Datenqualität'),
         make_table_paragraph('Probleme nicht erkannt oder gemeldet'),
         make_table_paragraph('Automatische Qualitätsprüfungen; sichtbare Warnungen im Dashboard')],
    ]
    pdf.add_table(methodology_comparison, col_widths=[1.3*inch, 2.1*inch, 2.1*inch])

    pdf.add_spacer(15)
    pdf.add_heading2("Statistische Validität")

    pdf.add_paragraph(
        "Der neue Ansatz folgt etablierten statistischen Best Practices:"
    )
    pdf.add_spacer(5)

    pdf.add_paragraph(
        "• Robuste Statistik — Die Verwendung des Medians anstelle des Mittelwerts ist Standard, wenn Ausreißer "
        "vorhanden sein können. Sie wird weltweit in wissenschaftlicher Forschung, Finanzanalyse und regulatorischen Kontexten verwendet."
    )
    pdf.add_paragraph(
        "• Mindeststichprobengröße — Der Schwellenwert von 5.000 Passagieren stellt sicher, dass Dichteberechnungen "
        "auf ausreichenden Daten basieren."
    )
    pdf.add_paragraph(
        "• Mehrperiodenanalyse — Die Betrachtung von Mustern über mehrere Semester reduziert die Chance, "
        "auf zufällige Schwankungen zu reagieren."
    )
    pdf.add_paragraph(
        "• Konfidenz-Bewertung — Bietet ein intuitives Maß für Zuverlässigkeit, das Nicht-Statistikern hilft, "
        "Ergebnisse angemessen zu interpretieren."
    )

    pdf.add_page_break()

    # ========== SECTION 7: CONFIGURATION ==========
    pdf.add_heading1("07 — Konfigurationsparameter")
    pdf.add_divider()

    pdf.add_paragraph(
        "Alle Parameter können in der Dashboard-Seitenleiste angepasst werden, um die Analyseempfindlichkeit "
        "und Schwellenwerte anzupassen."
    )
    pdf.add_spacer(15)

    # Parameter 1
    pdf.add_heading2("Mindest-INAD-Schwellenwert (Standard: 6)")
    pdf.add_paragraph("Funktion: Legt die Mindestanzahl von INADs für Schritt 1 und Schritt 2 fest")
    pdf.add_spacer(5)

    param1_data = [
        [make_table_paragraph('Einstellung', bold=True),
         make_table_paragraph('Empfehlung', bold=True)],
        [make_table_paragraph('6 (Standard)'),
         make_table_paragraph('Standardeinstellung, gleicht Sensitivität und Spezifität aus')],
        [make_table_paragraph('Niedriger (3-5)'),
         make_table_paragraph('Empfindlicher, erfasst kleinere Muster')],
        [make_table_paragraph('Höher (8-10)'),
         make_table_paragraph('Konservativer, kennzeichnet nur klare Muster')],
    ]
    pdf.add_table(param1_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 2
    pdf.add_heading2("Mindest-PAX für zuverlässige Daten (Standard: 5.000)")
    pdf.add_paragraph("Funktion: Routen mit weniger Passagieren werden als UNZUVERLÄSSIG markiert")
    pdf.add_spacer(5)

    param2_data = [
        [make_table_paragraph('Einstellung', bold=True),
         make_table_paragraph('Empfehlung', bold=True)],
        [make_table_paragraph('5.000 (Standard)'),
         make_table_paragraph('Standardeinstellung, vernünftige statistische Basis')],
        [make_table_paragraph('Niedriger'),
         make_table_paragraph('Mehr Routen einbeziehen, aber mit weniger Konfidenz')],
        [make_table_paragraph('Höher'),
         make_table_paragraph('Konservativer, nur Ergebnisse mit höchster Konfidenz')],
    ]
    pdf.add_table(param2_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 3
    pdf.add_heading2("Schwellenwert-Berechnungsmethode (Standard: Median)")
    pdf.add_paragraph("Optionen zur Berechnung des Dichteschwellenwerts:")
    pdf.add_spacer(5)

    param3_data = [
        [make_table_paragraph('Methode', bold=True),
         make_table_paragraph('Empfehlung', bold=True)],
        [make_table_paragraph('Median'),
         make_table_paragraph('Mittelwert, am robustesten gegenüber Ausreißern (EMPFOHLEN)')],
        [make_table_paragraph('Getrimmter Mittelwert'),
         make_table_paragraph('Entfernt obere/untere 10%, dann Durchschnitt')],
        [make_table_paragraph('Mittelwert'),
         make_table_paragraph('Einfacher Durchschnitt (NICHT EMPFOHLEN — empfindlich gegenüber Ausreißern)')],
    ]
    pdf.add_table(param3_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 4
    pdf.add_heading2("Mindestdichte für HOHE PRIORITÄT (Standard: 0,10‰)")
    pdf.add_paragraph("Funktion: Auch wenn über Schwellenwert, muss dieses absolute Minimum überschritten werden")
    pdf.add_spacer(5)

    param4_data = [
        [make_table_paragraph('Einstellung', bold=True),
         make_table_paragraph('Empfehlung', bold=True)],
        [make_table_paragraph('0,10‰ (Standard)'),
         make_table_paragraph('Standardeinstellung')],
        [make_table_paragraph('Niedriger'),
         make_table_paragraph('Mehr Routen qualifizieren sich als HOHE PRIORITÄT')],
        [make_table_paragraph('Höher'),
         make_table_paragraph('Nur die schwerwiegendsten Fälle gekennzeichnet')],
    ]
    pdf.add_table(param4_data, col_widths=[1.5*inch, 4*inch], style='minimal')
    pdf.add_spacer(15)

    # Parameter 5
    pdf.add_heading2("HOHE PRIORITÄT Multiplikator (Standard: 1,5×)")
    pdf.add_paragraph("Funktion: Muss dieses Vielfache des Schwellenwerts für HOHE PRIORITÄT sein")
    pdf.add_spacer(5)

    param5_data = [
        [make_table_paragraph('Einstellung', bold=True),
         make_table_paragraph('Empfehlung', bold=True)],
        [make_table_paragraph('1,5× (Standard)'),
         make_table_paragraph('Standardeinstellung (50% über Schwellenwert)')],
        [make_table_paragraph('Niedriger (1,2-1,3)'),
         make_table_paragraph('Empfindlicher')],
        [make_table_paragraph('Höher (2,0+)'),
         make_table_paragraph('Nur extreme Fälle gekennzeichnet')],
    ]
    pdf.add_table(param5_data, col_widths=[1.5*inch, 4*inch], style='minimal')

    pdf.add_page_break()

    # ========== SECTION 8: GLOSSARY ==========
    pdf.add_heading1("08 — Glossar der Begriffe")
    pdf.add_divider()
    pdf.add_spacer(10)

    glossary_terms = [
        [make_table_paragraph('Begriff', bold=True),
         make_table_paragraph('Definition', bold=True)],
        [make_table_paragraph('BAZL'),
         make_table_paragraph('Bundesamt für Zivilluftfahrt. Quelle der Passagiervolumendaten.')],
        [make_table_paragraph('Konfidenzwert'),
         make_table_paragraph('Ein 0-100% Wert, der anzeigt, wie zuverlässig die Dichteberechnung ist, basierend auf INAD-Anzahl und Passagiervolumen.')],
        [make_table_paragraph('Dichte (INAD-Dichtewert)'),
         make_table_paragraph('INADs pro 1.000 Passagiere: (INAD-Anzahl / PAX) × 1000. Ausgedrückt in Promille (‰).')],
        [make_table_paragraph('HOHE PRIORITÄT'),
         make_table_paragraph('Routen, die sofortige rechtliche Prüfung erfordern. Erfüllen alle Kriterien: hohe Dichte, hohe INAD-Anzahl, zuverlässige Daten.')],
        [make_table_paragraph('INAD'),
         make_table_paragraph('Nicht zugelassener Passagier. Ein Passagier, dem aus verschiedenen Gründen die Einreise an der Grenze verweigert wurde.')],
        [make_table_paragraph('Letzter Stopp'),
         make_table_paragraph('Der letzte Abflughafen vor der Ankunft in der Schweiz. Wird verwendet, um die Herkunft von INAD-Fällen zu identifizieren.')],
        [make_table_paragraph('Median'),
         make_table_paragraph('Der mittlere Wert in einer sortierten Liste. Im Gegensatz zum Mittelwert wird er nicht von Extremwerten beeinflusst.')],
        [make_table_paragraph('PAX'),
         make_table_paragraph('Passagiere (in der Luftfahrtindustrie verwendete Abkürzung).')],
        [make_table_paragraph('Semester'),
         make_table_paragraph('Sechsmonatiger Zeitraum für die Analyse. H1: Januar-Juni, H2: Juli-Dezember.')],
        [make_table_paragraph('Systematischer Fall'),
         make_table_paragraph('Eine Route, die in 2+ aufeinanderfolgenden Semestern gekennzeichnet wurde. Zeigt ein anhaltendes Muster an.')],
        [make_table_paragraph('Schwellenwert'),
         make_table_paragraph('Der Dichtewert, der verwendet wird, um "über dem Durchschnitt" von "darunter" zu trennen. Berechnet unter Verwendung des Medians zuverlässiger Routendichten.')],
        [make_table_paragraph('UNZUVERLÄSSIG'),
         make_table_paragraph('Klassifizierung für Routen mit unzureichenden Daten. Sollte nicht als Grundlage für Durchsetzungsmaßnahmen verwendet werden.')],
        [make_table_paragraph('BEOBACHTUNGSLISTE'),
         make_table_paragraph('Routen über dem Schwellenwert, die aber nicht alle HOHE PRIORITÄT Kriterien erfüllen. Sollten beobachtet werden.')],
    ]
    pdf.add_table(glossary_terms, col_widths=[1.5*inch, 4*inch])

    pdf.add_page_break()

    # ========== FINAL PAGE ==========
    pdf.add_spacer(100)
    pdf.add_divider(color=COLOR_PRIMARY_GOLD, thickness=2)
    pdf.add_spacer(30)

    pdf.add_heading2("Dokumentinformationen")
    pdf.add_spacer(10)

    doc_info = [
        [make_table_paragraph('Dokumentversion', bold=True),
         make_table_paragraph('2.1')],
        [make_table_paragraph('Zuletzt aktualisiert', bold=True),
         make_table_paragraph('Dezember 2024')],
        [make_table_paragraph('Tool-Version', bold=True),
         make_table_paragraph('Erweitertes INAD Analyse Tool 2.1')],
        [make_table_paragraph('Unterstützte Sprachen', bold=True),
         make_table_paragraph('English, Deutsch, Français')],
    ]
    pdf.add_table(doc_info, col_widths=[2*inch, 3.5*inch], style='minimal')

    pdf.add_spacer(30)
    pdf.add_divider(color=COLOR_PRIMARY_GOLD, thickness=2)
    pdf.add_spacer(20)

    pdf.add_paragraph(
        "Für technischen Support oder Fragen zu dieser Dokumentation wenden Sie sich bitte an das Datenanalyseteam.",
        style='small'
    )

    # Build the PDF
    pdf.build()
    print("✓ INAD Analyse Benutzerdokumentation (Deutsch) erfolgreich erstellt!")
    print("✓ Datei: INAD_Analysis_User_Documentation_v2.1_DE.pdf")


if __name__ == "__main__":
    generate_inad_documentation_de()
