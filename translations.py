"""
Translations module for the INAD Analysis Dashboard.
Provides translations in English, German (Deutsch), and French (Français).
"""

TRANSLATIONS = {
    "en": {
        # Language names
        "language_name": "English",

        # Page config
        "page_title": "INAD Analysis Dashboard",

        # Headers
        "main_header": "INAD Analysis Dashboard",
        "sub_header": "Enhanced Analysis with Priority Classification & Systemic Case Detection",

        # Sidebar - Data Configuration
        "data_configuration": "Data Configuration",
        "data_source": "Data Source",
        "upload_files": "Upload Files",
        "use_server_files": "Use Server Files",
        "upload_help": "Upload new files or use existing files on the server",
        "upload_data_files": "Upload Data Files",
        "inad_file": "INAD File (.xlsm)",
        "inad_file_help": "Upload the INAD Tabelle file",
        "bazl_file": "BAZL File (.xlsx)",
        "bazl_file_help": "Upload the BAZL-Daten file",
        "files_uploaded": "Files uploaded successfully!",
        "inad_file_path": "INAD File Path",
        "bazl_file_path": "BAZL File Path",

        # Warnings and errors
        "upload_warning": "Please upload both INAD and BAZL files in the sidebar to begin analysis.",
        "required_files": "Required Files:",
        "inad_description": "INAD Tabelle (.xlsm): Contains inadmissible passenger records",
        "bazl_description": "BAZL-Daten (.xlsx): Contains passenger count data",
        "enter_paths_warning": "Please enter paths to INAD and BAZL files in the sidebar.",
        "files_not_found": "One or more data files not found on server.",
        "error_loading_inad": "Error loading INAD file:",
        "no_data_found": "No data found in INAD file.",
        "analysis_error": "Analysis error:",

        # Time Period
        "time_period": "Time Period",
        "select_semester": "Select Semester",
        "loading_semesters": "Loading available semesters...",

        # Analysis Parameters
        "analysis_parameters": "Analysis Parameters",
        "min_inad_threshold": "Minimum INAD Threshold",
        "min_inad_help": "Minimum INADs for Step 1 and Step 2",
        "min_pax_reliable": "Minimum PAX for Reliable Data",
        "min_pax_help": "Routes with fewer passengers are marked as UNRELIABLE",
        "threshold_method": "Threshold Calculation Method",
        "threshold_method_help": "Median is most robust against outliers",
        "min_density_high": "Minimum Density for HIGH PRIORITY (‰)",
        "min_density_help": "Must exceed this density to be HIGH PRIORITY",
        "high_priority_multiplier": "HIGH PRIORITY Multiplier",
        "multiplier_help": "Must be this × threshold for HIGH PRIORITY",

        # Documentation
        "documentation": "Documentation",
        "user_documentation": "User Documentation",
        "view_documentation": "View Documentation",

        # Filters
        "filters": "Filters",
        "airlines": "Airlines",
        "airports_last_stop": "Airports (Last Stop)",

        # Metrics
        "total_inad": "Total INAD",
        "high_priority": "HIGH PRIORITY",
        "watch_list": "WATCH LIST",
        "unreliable": "UNRELIABLE",
        "threshold": "Threshold",
        "method": "Method",

        # Tabs
        "tab_overview": "Overview",
        "tab_step1": "Step 1: Airlines",
        "tab_step2": "Step 2: Routes",
        "tab_step3": "Step 3: Priority Analysis",
        "tab_systemic": "Systemic Cases",
        "tab_legal": "Legal Summary",

        # Overview tab
        "analysis_overview": "Analysis Overview",
        "priority_distribution": "Route Priority Distribution",
        "confidence_distribution": "Confidence Score Distribution",
        "confidence_label": "Confidence Score (0-100)",
        "medium_confidence": "Medium Confidence",
        "data_quality_warnings": "Data Quality Warnings",
        "top_routes_density": "Top 10 Routes by Density (Reliable Data Only)",
        "density_label": "Density (‰)",
        "refusal_categories_flagged": "Refusal Categories (Flagged Routes)",

        # Step 1 tab
        "step1_header": "Step 1: Airlines with ≥{} INADs",
        "airline": "Airline",
        "inad_count": "INAD Count",
        "status": "Status",
        "review": "Review",
        "ok": "OK",
        "step1_summary": "Summary:",
        "airlines_above_threshold": "{} airlines ≥{} INADs",
        "airlines_below_threshold": "{} airlines below threshold",
        "total_inads_flagged": "{} total INADs from flagged airlines",
        "inad_distribution_airline": "INAD Distribution by Airline",

        # Step 2 tab
        "step2_header": "Step 2: Routes with ≥{} INADs",
        "last_stop": "Last Stop",
        "step2_summary": "Summary:",
        "routes_above_threshold": "{} routes ≥{} INADs",
        "airlines_affected": "{} airlines affected",
        "top_airports_inad": "Top 10 Airports by INAD Count",
        "airport": "Airport",

        # Step 3 tab
        "step3_header": "Step 3: Priority Classification",
        "classification_criteria": "Classification Criteria",
        "high_priority_desc": "HIGH PRIORITY - Requires immediate legal review:",
        "high_priority_criteria1": "Density ≥ {}× threshold ({}‰)",
        "high_priority_criteria2": "Density ≥ {}‰ (minimum density)",
        "high_priority_criteria3": "INAD count ≥ 10",
        "high_priority_criteria4": "PAX ≥ {:,} (reliable data)",
        "watch_list_desc": "WATCH LIST - Monitor closely:",
        "watch_list_criteria": "Density ≥ threshold ({}‰)",
        "watch_list_criteria2": "Does not meet all HIGH PRIORITY criteria",
        "clear_desc": "CLEAR - No action needed:",
        "clear_criteria": "Density < threshold",
        "unreliable_desc": "UNRELIABLE - Data quality concerns:",
        "unreliable_criteria": "PAX < {:,} (insufficient passenger data)",
        "pax": "PAX",
        "density": "Density",
        "confidence": "Confidence",
        "priority": "Priority",
        "high_priority_routes_msg": "{} HIGH PRIORITY Routes",
        "requires_legal_review": "Require immediate legal review",
        "watch_list_routes_msg": "{} WATCH LIST Routes",
        "monitor_escalation": "Monitor for potential escalation",
        "density_vs_pax": "Density vs. PAX Volume",

        # Systemic tab
        "systemic_header": "Systemic Case Detection",
        "systemic_info": "**Systemic cases** are routes that appear on the WATCH LIST or HIGH PRIORITY in **2 or more consecutive semesters**, indicating a persistent pattern rather than a one-time occurrence.",
        "analyzing_historical": "Analyzing historical data for systemic patterns...",
        "systemic_analysis_error": "Error in systemic analysis:",
        "no_systemic_routes": "No routes have appeared on watch lists in multiple semesters.",
        "systemic_cases": "Systemic Cases",
        "routes_flagged_multiple": "Routes Flagged Multiple Times",
        "worsening_trends": "Worsening Trends",
        "confirmed_systemic": "Confirmed Systemic Cases",
        "systemic_description": "Routes flagged in 2+ consecutive semesters - require priority legal review",
        "appearances": "Appearances",
        "consecutive": "Consecutive",
        "trend": "Trend",
        "latest_data": "Latest Data",
        "current_priority": "Current Priority",
        "historical_trends": "Historical Trends",
        "flagged_routes_time": "Flagged Routes Over Time",
        "semester": "Semester",
        "number_routes": "Number of Routes",
        "route_history_detail": "Route History Detail",
        "select_route_history": "Select a route to view history",
        "history": "History:",

        # Legal tab
        "legal_header": "Legal Review Summary",
        "analysis_params": "Analysis Parameters",
        "period": "Period:",
        "threshold_method_label": "Threshold Method:",
        "threshold_value": "Threshold Value:",
        "minimum_inad": "Minimum INAD:",
        "minimum_pax": "Minimum PAX:",
        "high_priority_routes": "HIGH PRIORITY Routes",
        "no_high_priority": "No HIGH PRIORITY routes identified.",
        "watch_list_routes": "WATCH LIST Routes",
        "no_watch_list": "No WATCH LIST routes identified.",
        "data_quality_notes": "Data Quality Notes",
        "export_reports": "Export Reports",
        "export_high_priority": "HIGH PRIORITY Routes (CSV)",
        "export_watch_list": "WATCH LIST Routes (CSV)",
        "export_full": "Full Analysis (CSV)",

        # Footer
        "analysis_label": "Analysis:",
        "threshold_label": "Threshold:",
        "min_pax_label": "Min PAX:",
        "generated": "Generated:",

        # Running analysis
        "running_analysis": "Running analysis...",

        # Language selector
        "language": "Language",
    },

    "de": {
        # Language names
        "language_name": "Deutsch",

        # Page config
        "page_title": "INAD Analyse Dashboard",

        # Headers
        "main_header": "INAD Analyse Dashboard",
        "sub_header": "Erweiterte Analyse mit Prioritätsklassifizierung & Erkennung systemischer Fälle",

        # Sidebar - Data Configuration
        "data_configuration": "Datenkonfiguration",
        "data_source": "Datenquelle",
        "upload_files": "Dateien hochladen",
        "use_server_files": "Server-Dateien verwenden",
        "upload_help": "Neue Dateien hochladen oder vorhandene Dateien auf dem Server verwenden",
        "upload_data_files": "Datendateien hochladen",
        "inad_file": "INAD-Datei (.xlsm)",
        "inad_file_help": "INAD-Tabelle hochladen",
        "bazl_file": "BAZL-Datei (.xlsx)",
        "bazl_file_help": "BAZL-Daten hochladen",
        "files_uploaded": "Dateien erfolgreich hochgeladen!",
        "inad_file_path": "INAD-Dateipfad",
        "bazl_file_path": "BAZL-Dateipfad",

        # Warnings and errors
        "upload_warning": "Bitte laden Sie beide INAD- und BAZL-Dateien in der Seitenleiste hoch, um die Analyse zu starten.",
        "required_files": "Erforderliche Dateien:",
        "inad_description": "INAD Tabelle (.xlsm): Enthält Datensätze über unzulässige Passagiere",
        "bazl_description": "BAZL-Daten (.xlsx): Enthält Passagierzahlen",
        "enter_paths_warning": "Bitte geben Sie die Pfade zu den INAD- und BAZL-Dateien in der Seitenleiste ein.",
        "files_not_found": "Eine oder mehrere Datendateien wurden auf dem Server nicht gefunden.",
        "error_loading_inad": "Fehler beim Laden der INAD-Datei:",
        "no_data_found": "Keine Daten in der INAD-Datei gefunden.",
        "analysis_error": "Analysefehler:",

        # Time Period
        "time_period": "Zeitraum",
        "select_semester": "Semester auswählen",
        "loading_semesters": "Verfügbare Semester werden geladen...",

        # Analysis Parameters
        "analysis_parameters": "Analyseparameter",
        "min_inad_threshold": "Mindestanzahl INAD",
        "min_inad_help": "Mindest-INADs für Prüfstufe 1 und 2",
        "min_pax_reliable": "Mindest-PAX für zuverlässige Daten",
        "min_pax_help": "Routen mit weniger Passagieren werden als UNZUVERLÄSSIG markiert",
        "threshold_method": "Schwellenwert-Berechnungsmethode",
        "threshold_method_help": "Der Median ist am robustesten gegen Ausreisser",
        "min_density_high": "Mindestdichte für HOHE PRIORITÄT (‰)",
        "min_density_help": "Muss diese Dichte überschreiten für HOHE PRIORITÄT",
        "high_priority_multiplier": "HOHE PRIORITÄT Multiplikator",
        "multiplier_help": "Muss das ×-fache des Schwellenwerts sein für HOHE PRIORITÄT",

        # Documentation
        "documentation": "Dokumentation",
        "user_documentation": "Benutzerdokumentation",
        "view_documentation": "Dokumentation anzeigen",

        # Filters
        "filters": "Filter",
        "airlines": "Fluggesellschaften",
        "airports_last_stop": "Flughäfen (Letzter Stopp)",

        # Metrics
        "total_inad": "Total INAD",
        "high_priority": "HOHE PRIORITÄT",
        "watch_list": "BEOBACHTUNGSLISTE",
        "unreliable": "UNZUVERLÄSSIG",
        "threshold": "Schwellenwert",
        "method": "Methode",

        # Tabs
        "tab_overview": "Übersicht",
        "tab_step1": "Prüfstufe 1: Fluggesellschaften",
        "tab_step2": "Prüfstufe 2: Routen",
        "tab_step3": "Prüfstufe 3: Prioritätsanalyse",
        "tab_systemic": "Systemische Fälle",
        "tab_legal": "Rechtliche Zusammenfassung",

        # Overview tab
        "analysis_overview": "Analyseübersicht",
        "priority_distribution": "Verteilung der Routenpriorität",
        "confidence_distribution": "Verteilung der Konfidenzwerte",
        "confidence_label": "Konfidenzwert (0-100)",
        "medium_confidence": "Mittlere Konfidenz",
        "data_quality_warnings": "Datenqualitätswarnungen",
        "top_routes_density": "Top 10 Routen nach Dichte (nur zuverlässige Daten)",
        "density_label": "Dichte (‰)",
        "refusal_categories_flagged": "Ablehnungskategorien (markierte Routen)",

        # Step 1 tab
        "step1_header": "Prüfstufe 1: Fluggesellschaften mit ≥{} INADs",
        "airline": "Fluggesellschaft",
        "inad_count": "INAD-Anzahl",
        "status": "Status",
        "review": "Prüfen",
        "ok": "OK",
        "step1_summary": "Zusammenfassung:",
        "airlines_above_threshold": "{} Fluggesellschaften ≥{} INADs",
        "airlines_below_threshold": "{} Fluggesellschaften unter Schwellenwert",
        "total_inads_flagged": "{} INADs insgesamt von markierten Fluggesellschaften",
        "inad_distribution_airline": "INAD-Verteilung nach Fluggesellschaft",

        # Step 2 tab
        "step2_header": "Prüfstufe 2: Routen mit ≥{} INADs",
        "last_stop": "Letzter Stopp",
        "step2_summary": "Zusammenfassung:",
        "routes_above_threshold": "{} Routen ≥{} INADs",
        "airlines_affected": "{} betroffene Fluggesellschaften",
        "top_airports_inad": "Top 10 Flughäfen nach INAD-Anzahl",
        "airport": "Flughafen",

        # Step 3 tab
        "step3_header": "Prüfstufe 3: Prioritätsklassifizierung",
        "classification_criteria": "Klassifizierungskriterien",
        "high_priority_desc": "HOHE PRIORITÄT - Erfordert sofortige rechtliche Prüfung:",
        "high_priority_criteria1": "Dichte ≥ {}× Schwellenwert ({}‰)",
        "high_priority_criteria2": "Dichte ≥ {}‰ (Mindestdichte)",
        "high_priority_criteria3": "INAD-Anzahl ≥ 10",
        "high_priority_criteria4": "PAX ≥ {:,} (zuverlässige Daten)",
        "watch_list_desc": "BEOBACHTUNGSLISTE - Genau beobachten:",
        "watch_list_criteria": "Dichte ≥ Schwellenwert ({}‰)",
        "watch_list_criteria2": "Erfüllt nicht alle Kriterien für HOHE PRIORITÄT",
        "clear_desc": "UNBEDENKLICH - Keine Massnahmen erforderlich:",
        "clear_criteria": "Dichte < Schwellenwert",
        "unreliable_desc": "UNZUVERLÄSSIG - Datenqualitätsbedenken:",
        "unreliable_criteria": "PAX < {:,} (unzureichende Passagierdaten)",
        "pax": "PAX",
        "density": "Dichte",
        "confidence": "Konfidenz",
        "priority": "Priorität",
        "high_priority_routes_msg": "{} HOHE PRIORITÄT Routen",
        "requires_legal_review": "Erfordern sofortige rechtliche Prüfung",
        "watch_list_routes_msg": "{} BEOBACHTUNGSLISTE Routen",
        "monitor_escalation": "Auf mögliche Eskalation überwachen",
        "density_vs_pax": "Dichte vs. PAX-Volumen",

        # Systemic tab
        "systemic_header": "Erkennung systemischer Fälle",
        "systemic_info": "**Systemische Fälle** sind Routen, die in **2 oder mehr aufeinanderfolgenden Semestern** auf der BEOBACHTUNGSLISTE oder HOHE PRIORITÄT erscheinen, was auf ein anhaltendes Muster und nicht auf ein einmaliges Ereignis hinweist.",
        "analyzing_historical": "Historische Daten werden auf systemische Muster analysiert...",
        "systemic_analysis_error": "Fehler bei der systemischen Analyse:",
        "no_systemic_routes": "Keine Routen sind in mehreren Semestern auf Beobachtungslisten erschienen.",
        "systemic_cases": "Systemische Fälle",
        "routes_flagged_multiple": "Mehrfach markierte Routen",
        "worsening_trends": "Verschlechternde Trends",
        "confirmed_systemic": "Bestätigte systemische Fälle",
        "systemic_description": "Routen, die in 2+ aufeinanderfolgenden Semestern markiert wurden - erfordern vorrangige rechtliche Prüfung",
        "appearances": "Auftreten",
        "consecutive": "Aufeinanderfolgend",
        "trend": "Trend",
        "latest_data": "Neueste Daten",
        "current_priority": "Aktuelle Priorität",
        "historical_trends": "Historische Trends",
        "flagged_routes_time": "Markierte Routen im Zeitverlauf",
        "semester": "Semester",
        "number_routes": "Anzahl Routen",
        "route_history_detail": "Routenverlauf Detail",
        "select_route_history": "Route für Verlaufsanzeige auswählen",
        "history": "Verlauf:",

        # Legal tab
        "legal_header": "Rechtliche Zusammenfassung",
        "analysis_params": "Analyseparameter",
        "period": "Zeitraum:",
        "threshold_method_label": "Schwellenwert-Methode:",
        "threshold_value": "Schwellenwert:",
        "minimum_inad": "Mindest-INAD:",
        "minimum_pax": "Mindest-PAX:",
        "high_priority_routes": "HOHE PRIORITÄT Routen",
        "no_high_priority": "Keine Routen mit HOHER PRIORITÄT identifiziert.",
        "watch_list_routes": "BEOBACHTUNGSLISTE Routen",
        "no_watch_list": "Keine BEOBACHTUNGSLISTE Routen identifiziert.",
        "data_quality_notes": "Hinweise zur Datenqualität",
        "export_reports": "Berichte exportieren",
        "export_high_priority": "HOHE PRIORITÄT Routen (CSV)",
        "export_watch_list": "BEOBACHTUNGSLISTE Routen (CSV)",
        "export_full": "Vollständige Analyse (CSV)",

        # Footer
        "analysis_label": "Analyse:",
        "threshold_label": "Schwellenwert:",
        "min_pax_label": "Min PAX:",
        "generated": "Erstellt:",

        # Running analysis
        "running_analysis": "Analyse wird ausgeführt...",

        # Language selector
        "language": "Sprache",
    },

    "fr": {
        # Language names
        "language_name": "Français",

        # Page config
        "page_title": "Tableau de bord d'analyse INAD",

        # Headers
        "main_header": "Tableau de bord d'analyse INAD",
        "sub_header": "Analyse avancée avec classification des priorités et détection des cas systémiques",

        # Sidebar - Data Configuration
        "data_configuration": "Configuration des données",
        "data_source": "Source de données",
        "upload_files": "Télécharger des fichiers",
        "use_server_files": "Utiliser les fichiers du serveur",
        "upload_help": "Télécharger de nouveaux fichiers ou utiliser des fichiers existants sur le serveur",
        "upload_data_files": "Télécharger les fichiers de données",
        "inad_file": "Fichier INAD (.xlsm)",
        "inad_file_help": "Télécharger le tableau INAD",
        "bazl_file": "Fichier BAZL (.xlsx)",
        "bazl_file_help": "Télécharger les données BAZL",
        "files_uploaded": "Fichiers téléchargés avec succès!",
        "inad_file_path": "Chemin du fichier INAD",
        "bazl_file_path": "Chemin du fichier BAZL",

        # Warnings and errors
        "upload_warning": "Veuillez télécharger les fichiers INAD et BAZL dans la barre latérale pour commencer l'analyse.",
        "required_files": "Fichiers requis:",
        "inad_description": "Tableau INAD (.xlsm): Contient les enregistrements des passagers inadmissibles",
        "bazl_description": "Données BAZL (.xlsx): Contient les comptages de passagers",
        "enter_paths_warning": "Veuillez entrer les chemins vers les fichiers INAD et BAZL dans la barre latérale.",
        "files_not_found": "Un ou plusieurs fichiers de données introuvables sur le serveur.",
        "error_loading_inad": "Erreur de chargement du fichier INAD:",
        "no_data_found": "Aucune donnée trouvée dans le fichier INAD.",
        "analysis_error": "Erreur d'analyse:",

        # Time Period
        "time_period": "Période",
        "select_semester": "Sélectionner le semestre",
        "loading_semesters": "Chargement des semestres disponibles...",

        # Analysis Parameters
        "analysis_parameters": "Paramètres d'analyse",
        "min_inad_threshold": "Seuil minimum INAD",
        "min_inad_help": "Minimum d'INAD pour les étapes 1 et 2",
        "min_pax_reliable": "PAX minimum pour données fiables",
        "min_pax_help": "Les routes avec moins de passagers sont marquées comme NON FIABLES",
        "threshold_method": "Méthode de calcul du seuil",
        "threshold_method_help": "La médiane est la plus robuste contre les valeurs aberrantes",
        "min_density_high": "Densité minimum pour PRIORITÉ HAUTE (‰)",
        "min_density_help": "Doit dépasser cette densité pour PRIORITÉ HAUTE",
        "high_priority_multiplier": "Multiplicateur PRIORITÉ HAUTE",
        "multiplier_help": "Doit être ce × seuil pour PRIORITÉ HAUTE",

        # Documentation
        "documentation": "Documentation",
        "user_documentation": "Documentation Utilisateur",
        "view_documentation": "Voir la Documentation",

        # Filters
        "filters": "Filtres",
        "airlines": "Compagnies aériennes",
        "airports_last_stop": "Aéroports (Dernier arrêt)",

        # Metrics
        "total_inad": "Total INAD",
        "high_priority": "PRIORITÉ HAUTE",
        "watch_list": "LISTE DE SURVEILLANCE",
        "unreliable": "NON FIABLE",
        "threshold": "Seuil",
        "method": "Méthode",

        # Tabs
        "tab_overview": "Aperçu",
        "tab_step1": "Étape 1: Compagnies",
        "tab_step2": "Étape 2: Routes",
        "tab_step3": "Étape 3: Analyse des priorités",
        "tab_systemic": "Cas systémiques",
        "tab_legal": "Résumé juridique",

        # Overview tab
        "analysis_overview": "Aperçu de l'analyse",
        "priority_distribution": "Distribution des priorités des routes",
        "confidence_distribution": "Distribution des scores de confiance",
        "confidence_label": "Score de confiance (0-100)",
        "medium_confidence": "Confiance moyenne",
        "data_quality_warnings": "Avertissements sur la qualité des données",
        "top_routes_density": "Top 10 des routes par densité (données fiables uniquement)",
        "density_label": "Densité (‰)",
        "refusal_categories_flagged": "Catégories de refus (routes signalées)",

        # Step 1 tab
        "step1_header": "Étape 1: Compagnies avec ≥{} INAD",
        "airline": "Compagnie aérienne",
        "inad_count": "Nombre d'INAD",
        "status": "Statut",
        "review": "À examiner",
        "ok": "OK",
        "step1_summary": "Résumé:",
        "airlines_above_threshold": "{} compagnies ≥{} INAD",
        "airlines_below_threshold": "{} compagnies sous le seuil",
        "total_inads_flagged": "{} INAD au total des compagnies signalées",
        "inad_distribution_airline": "Distribution des INAD par compagnie",

        # Step 2 tab
        "step2_header": "Étape 2: Routes avec ≥{} INAD",
        "last_stop": "Dernier arrêt",
        "step2_summary": "Résumé:",
        "routes_above_threshold": "{} routes ≥{} INAD",
        "airlines_affected": "{} compagnies concernées",
        "top_airports_inad": "Top 10 des aéroports par nombre d'INAD",
        "airport": "Aéroport",

        # Step 3 tab
        "step3_header": "Étape 3: Classification des priorités",
        "classification_criteria": "Critères de classification",
        "high_priority_desc": "PRIORITÉ HAUTE - Nécessite un examen juridique immédiat:",
        "high_priority_criteria1": "Densité ≥ {}× seuil ({}‰)",
        "high_priority_criteria2": "Densité ≥ {}‰ (densité minimum)",
        "high_priority_criteria3": "Nombre d'INAD ≥ 10",
        "high_priority_criteria4": "PAX ≥ {:,} (données fiables)",
        "watch_list_desc": "LISTE DE SURVEILLANCE - Surveiller de près:",
        "watch_list_criteria": "Densité ≥ seuil ({}‰)",
        "watch_list_criteria2": "Ne répond pas à tous les critères de PRIORITÉ HAUTE",
        "clear_desc": "SANS PROBLÈME - Aucune action requise:",
        "clear_criteria": "Densité < seuil",
        "unreliable_desc": "NON FIABLE - Problèmes de qualité des données:",
        "unreliable_criteria": "PAX < {:,} (données passagers insuffisantes)",
        "pax": "PAX",
        "density": "Densité",
        "confidence": "Confiance",
        "priority": "Priorité",
        "high_priority_routes_msg": "{} routes PRIORITÉ HAUTE",
        "requires_legal_review": "Nécessitent un examen juridique immédiat",
        "watch_list_routes_msg": "{} routes LISTE DE SURVEILLANCE",
        "monitor_escalation": "Surveiller une éventuelle escalade",
        "density_vs_pax": "Densité vs. Volume PAX",

        # Systemic tab
        "systemic_header": "Détection des cas systémiques",
        "systemic_info": "Les **cas systémiques** sont des routes qui apparaissent sur la LISTE DE SURVEILLANCE ou PRIORITÉ HAUTE pendant **2 semestres consécutifs ou plus**, indiquant un schéma persistant plutôt qu'un événement ponctuel.",
        "analyzing_historical": "Analyse des données historiques pour les schémas systémiques...",
        "systemic_analysis_error": "Erreur dans l'analyse systémique:",
        "no_systemic_routes": "Aucune route n'est apparue sur les listes de surveillance dans plusieurs semestres.",
        "systemic_cases": "Cas systémiques",
        "routes_flagged_multiple": "Routes signalées plusieurs fois",
        "worsening_trends": "Tendances en détérioration",
        "confirmed_systemic": "Cas systémiques confirmés",
        "systemic_description": "Routes signalées dans 2+ semestres consécutifs - nécessitent un examen juridique prioritaire",
        "appearances": "Apparitions",
        "consecutive": "Consécutifs",
        "trend": "Tendance",
        "latest_data": "Dernières données",
        "current_priority": "Priorité actuelle",
        "historical_trends": "Tendances historiques",
        "flagged_routes_time": "Routes signalées au fil du temps",
        "semester": "Semestre",
        "number_routes": "Nombre de routes",
        "route_history_detail": "Détail de l'historique de la route",
        "select_route_history": "Sélectionner une route pour voir l'historique",
        "history": "Historique:",

        # Legal tab
        "legal_header": "Résumé juridique",
        "analysis_params": "Paramètres d'analyse",
        "period": "Période:",
        "threshold_method_label": "Méthode de seuil:",
        "threshold_value": "Valeur du seuil:",
        "minimum_inad": "INAD minimum:",
        "minimum_pax": "PAX minimum:",
        "high_priority_routes": "Routes PRIORITÉ HAUTE",
        "no_high_priority": "Aucune route PRIORITÉ HAUTE identifiée.",
        "watch_list_routes": "Routes LISTE DE SURVEILLANCE",
        "no_watch_list": "Aucune route LISTE DE SURVEILLANCE identifiée.",
        "data_quality_notes": "Notes sur la qualité des données",
        "export_reports": "Exporter les rapports",
        "export_high_priority": "Routes PRIORITÉ HAUTE (CSV)",
        "export_watch_list": "Routes LISTE DE SURVEILLANCE (CSV)",
        "export_full": "Analyse complète (CSV)",

        # Footer
        "analysis_label": "Analyse:",
        "threshold_label": "Seuil:",
        "min_pax_label": "PAX min:",
        "generated": "Généré:",

        # Running analysis
        "running_analysis": "Analyse en cours...",

        # Language selector
        "language": "Langue",
    }
}


def get_text(key: str, lang: str = "en") -> str:
    """Get translated text for a given key and language."""
    if lang not in TRANSLATIONS:
        lang = "en"
    return TRANSLATIONS[lang].get(key, TRANSLATIONS["en"].get(key, key))


def t(key: str, lang: str = "en") -> str:
    """Shorthand for get_text."""
    return get_text(key, lang)
