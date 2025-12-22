#!/usr/bin/env python3
"""
translations.py - Multi-language support for CASA Reporting Dashboard

Supports English, German, and French translations for all UI elements.
"""

TRANSLATIONS = {
    'en': {
        # Language
        'language': 'Language',
        
        # Main headers
        'main_header': 'INAD Analysis Dashboard',
        'sub_header': 'Enhanced Analysis with Priority Classification & Systemic Case Detection',
        
        # Documentation
        'documentation': 'Documentation',
        'view_documentation': 'View Documentation',
        
        # Data configuration
        'data_configuration': 'Data Configuration',
        'data_source': 'Data Source',
        'upload_files': 'Upload Files',
        'use_server_files': 'Use Server Files',
        'upload_help': 'Upload your own data files or use files stored on the server',
        'upload_data_files': 'Upload Data Files',
        'inad_file': 'INAD Excel File (.xlsm)',
        'inad_file_help': 'Excel file containing INAD case data',
        'bazl_file': 'BAZL Data File (.xlsx)',
        'bazl_file_help': 'Excel file containing BAZL passenger data',
        'upload_warning': 'Please upload both required data files to continue.',
        'required_files': 'Required Files:',
        'inad_description': 'INAD Excel (.xlsm): Contains inadmissible passenger case data',
        'bazl_description': 'BAZL Data (.xlsx): Contains passenger volume data by route',
        'files_uploaded': 'Files uploaded successfully',
        'inad_file_path': 'INAD File Path',
        'bazl_file_path': 'BAZL File Path',
        'enter_paths_warning': 'Please enter valid file paths.',
        'files_not_found': 'One or more files not found. Please check the paths.',
        
        # Time period
        'time_period': 'Time Period',
        'select_semester': 'Select Semester',
        'loading_semesters': 'Loading available semesters...',
        'error_loading_inad': 'Error loading INAD data:',
        'no_data_found': 'No data found in the INAD file.',
        
        # Analysis parameters
        'analysis_parameters': 'Analysis Parameters',
        'min_inad_threshold': 'Minimum INAD Threshold',
        'min_inad_help': 'Minimum number of INADs required for a route to be analyzed',
        'min_pax_reliable': 'Minimum PAX for Reliable Analysis',
        'min_pax_help': 'Routes with fewer passengers are marked as unreliable',
        'threshold_method': 'Threshold Method',
        'threshold_method_help': 'Statistical method for calculating the density threshold',
        'min_density_high': 'Minimum Density for High Priority (‰)',
        'min_density_help': 'Absolute minimum density threshold for high priority classification',
        'high_priority_multiplier': 'High Priority Multiplier',
        'multiplier_help': 'Routes must exceed threshold × this multiplier for high priority',
        
        # Filters
        'filters': 'Filters',
        'airlines': 'Airlines',
        'airports_last_stop': 'Airports (Last Stop)',
        
        # Running analysis
        'running_analysis': 'Running analysis...',
        'analysis_error': 'Error running analysis:',
        
        # Summary metrics
        'total_inad': 'Total INAD',
        'high_priority': 'High Priority',
        'watch_list': 'Watch List',
        'unreliable': 'Unreliable',
        'threshold': 'Threshold',
        'method': 'Method',
        
        # Tabs
        'tab_globe': 'Globe View',
        'tab_overview': 'Overview',
        'tab_step1': 'Step 1: Airlines',
        'tab_step2': 'Step 2: Routes',
        'tab_step3': 'Step 3: Priority',
        'tab_systemic': 'Systemic Cases',
        'tab_legal': 'Legal Summary',
        'tab_history': 'Historical',
        
        # Globe view
        'globe_title': 'Route Visualization',
        'globe_controls': 'Globe Controls',
        'show_priorities': 'Show Priorities',
        'min_inad_display': 'Minimum INAD to Display',
        'routes_displayed': 'Routes Displayed',
        'unique_origins': 'Unique Origins',
        'coverage': 'Coverage',
        'route_details': 'Route Details',
        'select_route': 'Select Route for Details',
        'airports_without_coords': 'airports without coordinates',
        'no_routes_match': 'No routes match the current filter criteria.',
        'globe_not_available': 'Globe visualization is not available.',
        'loading_geo_data': 'Loading geographic data...',
        
        # Historical comparison
        'historical_comparison': 'Historical Comparison',
        'compare_semesters': 'Compare Semesters',
        'select_comparison_semester': 'Select Comparison Semester',
        'current_semester': 'Current',
        'previous_semester': 'Previous',
        'new_routes': 'New Routes',
        'resolved_routes': 'Resolved Routes',
        'persistent_routes': 'Persistent Routes',
        'trend_improving': 'Improving',
        'trend_worsening': 'Worsening',
        'trend_stable': 'Stable',
        
        # Overview tab
        'analysis_overview': 'Analysis Overview',
        'priority_distribution': 'Priority Distribution',
        'confidence_distribution': 'Confidence Score Distribution',
        'medium_confidence': 'Medium Confidence',
        'data_quality_warnings': 'Data Quality Warnings',
        'top_routes_density': 'Top Routes by Density (Reliable Data Only)',
        'density_label': 'Density (‰)',
        'refusal_categories_flagged': 'Refusal Categories (Flagged Routes)',
        'confidence_label': 'Confidence Score',
        
        # Step 1
        'step1_header': 'Step 1: Airlines with ≥{} INADs',
        'step1_summary': 'Summary',
        'airlines_above_threshold': '{} airlines above threshold (≥{} INADs)',
        'airlines_below_threshold': '{} airlines below threshold',
        'total_inads_flagged': '{} total INADs from flagged airlines',
        'inad_distribution_airline': 'INAD Distribution by Airline',
        'review': 'Review',
        'ok': 'OK',
        'airline': 'Airline',
        'inad_count': 'INAD Count',
        'status': 'Status',
        
        # Step 2
        'step2_header': 'Step 2: Routes with ≥{} INADs',
        'step2_summary': 'Summary',
        'routes_above_threshold': '{} routes above threshold (≥{} INADs)',
        'airlines_affected': '{} airlines affected',
        'top_airports_inad': 'Top Airports by INAD Count',
        'airport': 'Airport',
        'last_stop': 'Last Stop',
        
        # Step 3
        'step3_header': 'Step 3: Priority Classification',
        'classification_criteria': 'Classification Criteria',
        'high_priority_desc': 'HIGH PRIORITY',
        'high_priority_criteria1': 'Density ≥ {}× threshold ({:.4f}‰)',
        'high_priority_criteria2': 'Density ≥ {}‰ absolute minimum',
        'high_priority_criteria3': '≥10 INAD cases',
        'high_priority_criteria4': '≥{:,} PAX (reliable data)',
        'watch_list_desc': 'WATCH LIST',
        'watch_list_criteria': 'Density above threshold ({}‰)',
        'watch_list_criteria2': 'Does not meet all high priority criteria',
        'clear_desc': 'CLEAR - Below threshold',
        'clear_criteria': 'Density below threshold, no immediate action needed',
        'unreliable_desc': 'UNRELIABLE',
        'unreliable_criteria': 'Less than {:,} PAX - insufficient data for reliable analysis',
        'pax': 'PAX',
        'density': 'Density',
        'confidence': 'Confidence',
        'priority': 'Priority',
        'high_priority_routes_msg': '{} routes require immediate attention',
        'requires_legal_review': 'These routes require legal review and potential carrier sanction proceedings.',
        'watch_list_routes_msg': '{} routes under surveillance',
        'monitor_escalation': 'Monitor these routes for potential escalation to high priority.',
        'density_vs_pax': 'Density vs. Passenger Volume',
        
        # Systemic cases
        'systemic_header': 'Systemic Case Detection',
        'systemic_info': 'Routes appearing as HIGH PRIORITY or WATCH LIST in multiple consecutive semesters may indicate systemic issues requiring escalated intervention.',
        'analyzing_historical': 'Analyzing historical data...',
        'systemic_analysis_error': 'Error in systemic analysis:',
        'no_systemic_routes': 'No routes have been flagged in multiple semesters.',
        'systemic_cases': 'Systemic Cases',
        'routes_flagged_multiple': 'Routes Flagged Multiple Times',
        'worsening_trends': 'Worsening Trends',
        'confirmed_systemic': 'Confirmed Systemic Cases',
        'systemic_description': 'Routes flagged in 2+ consecutive semesters',
        'appearances': 'Appearances',
        'consecutive': 'Consecutive',
        'trend': 'Trend',
        'latest_data': 'Latest Data',
        'current_priority': 'Current Priority',
        'historical_trends': 'Historical Trends',
        'flagged_routes_time': 'Flagged Routes Over Time',
        'semester': 'Semester',
        'number_routes': 'Number of Routes',
        'route_history_detail': 'Route History Detail',
        'select_route_history': 'Select Route to View History',
        'history': 'History:',
        
        # Legal summary
        'legal_header': 'Legal Review Summary',
        'analysis_params': 'Analysis Parameters',
        'period': 'Period:',
        'threshold_method_label': 'Threshold Method:',
        'threshold_value': 'Threshold Value:',
        'minimum_inad': 'Minimum INAD:',
        'minimum_pax': 'Minimum PAX:',
        'high_priority_routes': 'High Priority Routes',
        'no_high_priority': 'No routes classified as high priority.',
        'watch_list_routes': 'Watch List Routes',
        'no_watch_list': 'No routes on watch list.',
        'data_quality_notes': 'Data Quality Notes',
        'export_reports': 'Export Reports',
        'export_high_priority': 'Export High Priority',
        'export_watch_list': 'Export Watch List',
        'export_full': 'Export Full Analysis',
        
        # Footer
        'analysis_label': 'Analysis:',
        'threshold_label': 'Threshold:',
        'min_pax_label': 'Min PAX:',
        'generated': 'Generated:',
    },
    
    'de': {
        # Language
        'language': 'Sprache',
        
        # Main headers
        'main_header': 'INAD Analyse Dashboard',
        'sub_header': 'Erweiterte Analyse mit Prioritätsklassifizierung & Erkennung systemischer Fälle',
        
        # Documentation
        'documentation': 'Dokumentation',
        'view_documentation': 'Dokumentation anzeigen',
        
        # Data configuration
        'data_configuration': 'Datenkonfiguration',
        'data_source': 'Datenquelle',
        'upload_files': 'Dateien hochladen',
        'use_server_files': 'Server-Dateien verwenden',
        'upload_help': 'Laden Sie eigene Datendateien hoch oder verwenden Sie auf dem Server gespeicherte Dateien',
        'upload_data_files': 'Datendateien hochladen',
        'inad_file': 'INAD Excel-Datei (.xlsm)',
        'inad_file_help': 'Excel-Datei mit INAD-Falldaten',
        'bazl_file': 'BAZL-Datendatei (.xlsx)',
        'bazl_file_help': 'Excel-Datei mit BAZL-Passagierdaten',
        'upload_warning': 'Bitte laden Sie beide erforderlichen Datendateien hoch, um fortzufahren.',
        'required_files': 'Erforderliche Dateien:',
        'inad_description': 'INAD Excel (.xlsm): Enthält Daten zu unzulässigen Passagierfällen',
        'bazl_description': 'BAZL-Daten (.xlsx): Enthält Passagiervolumendaten nach Route',
        'files_uploaded': 'Dateien erfolgreich hochgeladen',
        'inad_file_path': 'INAD-Dateipfad',
        'bazl_file_path': 'BAZL-Dateipfad',
        'enter_paths_warning': 'Bitte geben Sie gültige Dateipfade ein.',
        'files_not_found': 'Eine oder mehrere Dateien nicht gefunden. Bitte überprüfen Sie die Pfade.',
        
        # Time period
        'time_period': 'Zeitraum',
        'select_semester': 'Semester auswählen',
        'loading_semesters': 'Verfügbare Semester werden geladen...',
        'error_loading_inad': 'Fehler beim Laden der INAD-Daten:',
        'no_data_found': 'Keine Daten in der INAD-Datei gefunden.',
        
        # Analysis parameters
        'analysis_parameters': 'Analyseparameter',
        'min_inad_threshold': 'Mindest-INAD-Schwelle',
        'min_inad_help': 'Mindestanzahl an INADs, damit eine Route analysiert wird',
        'min_pax_reliable': 'Mindest-PAX für zuverlässige Analyse',
        'min_pax_help': 'Routen mit weniger Passagieren werden als unzuverlässig markiert',
        'threshold_method': 'Schwellenwert-Methode',
        'threshold_method_help': 'Statistische Methode zur Berechnung des Dichteschwellenwerts',
        'min_density_high': 'Mindestdichte für hohe Priorität (‰)',
        'min_density_help': 'Absoluter Mindestdichteschwellenwert für hohe Prioritätseinstufung',
        'high_priority_multiplier': 'Hohe-Priorität-Multiplikator',
        'multiplier_help': 'Routen müssen den Schwellenwert × diesen Multiplikator für hohe Priorität überschreiten',
        
        # Filters
        'filters': 'Filter',
        'airlines': 'Fluggesellschaften',
        'airports_last_stop': 'Flughäfen (Letzte Station)',
        
        # Running analysis
        'running_analysis': 'Analyse wird durchgeführt...',
        'analysis_error': 'Fehler bei der Analyse:',
        
        # Summary metrics
        'total_inad': 'Total INAD',
        'high_priority': 'Hohe Priorität',
        'watch_list': 'Beobachtungsliste',
        'unreliable': 'Unzuverlässig',
        'threshold': 'Schwellenwert',
        'method': 'Methode',
        
        # Tabs
        'tab_globe': 'Globus-Ansicht',
        'tab_overview': 'Übersicht',
        'tab_step1': 'Prüfstufe 1: Fluggesellschaften',
        'tab_step2': 'Prüfstufe 2: Routen',
        'tab_step3': 'Prüfstufe 3: Prioritätsanalyse',
        'tab_systemic': 'Systemische Fälle',
        'tab_legal': 'Rechtliche Zusammenfassung',
        'tab_history': 'Historisch',
        
        # Globe view
        'globe_title': 'Routenvisualisierung',
        'globe_controls': 'Globus-Steuerung',
        'show_priorities': 'Prioritäten anzeigen',
        'min_inad_display': 'Mindest-INAD zur Anzeige',
        'routes_displayed': 'Angezeigte Routen',
        'unique_origins': 'Eindeutige Abflughäfen',
        'coverage': 'Abdeckung',
        'route_details': 'Routendetails',
        'select_route': 'Route für Details auswählen',
        'airports_without_coords': 'Flughäfen ohne Koordinaten',
        'no_routes_match': 'Keine Routen entsprechen den aktuellen Filterkriterien.',
        'globe_not_available': 'Globus-Visualisierung ist nicht verfügbar.',
        'loading_geo_data': 'Geografische Daten werden geladen...',
        
        # Historical comparison
        'historical_comparison': 'Historischer Vergleich',
        'compare_semesters': 'Semester vergleichen',
        'select_comparison_semester': 'Vergleichssemester auswählen',
        'current_semester': 'Aktuell',
        'previous_semester': 'Vorherig',
        'new_routes': 'Neue Routen',
        'resolved_routes': 'Gelöste Routen',
        'persistent_routes': 'Persistente Routen',
        'trend_improving': 'Verbessernd',
        'trend_worsening': 'Verschlechternd',
        'trend_stable': 'Stabil',
        
        # Overview tab
        'analysis_overview': 'Analyseübersicht',
        'priority_distribution': 'Prioritätsverteilung',
        'confidence_distribution': 'Konfidenzwert-Verteilung',
        'medium_confidence': 'Mittlere Konfidenz',
        'data_quality_warnings': 'Datenqualitätswarnungen',
        'top_routes_density': 'Top-Routen nach Dichte (nur zuverlässige Daten)',
        'density_label': 'Dichte (‰)',
        'refusal_categories_flagged': 'Ablehnungskategorien (Markierte Routen)',
        'confidence_label': 'Konfidenzwert',
        
        # Step 1
        'step1_header': 'Prüfstufe 1: Fluggesellschaften mit ≥{} INADs',
        'step1_summary': 'Zusammenfassung',
        'airlines_above_threshold': '{} Fluggesellschaften über Schwelle (≥{} INADs)',
        'airlines_below_threshold': '{} Fluggesellschaften unter Schwelle',
        'total_inads_flagged': '{} INADs insgesamt von markierten Fluggesellschaften',
        'inad_distribution_airline': 'INAD-Verteilung nach Fluggesellschaft',
        'review': 'Prüfen',
        'ok': 'OK',
        'airline': 'Fluggesellschaft',
        'inad_count': 'INAD-Anzahl',
        'status': 'Status',
        
        # Step 2
        'step2_header': 'Prüfstufe 2: Routen mit ≥{} INADs',
        'step2_summary': 'Zusammenfassung',
        'routes_above_threshold': '{} Routen über Schwelle (≥{} INADs)',
        'airlines_affected': '{} betroffene Fluggesellschaften',
        'top_airports_inad': 'Top-Flughäfen nach INAD-Anzahl',
        'airport': 'Flughafen',
        'last_stop': 'Letzte Station',
        
        # Step 3
        'step3_header': 'Prüfstufe 3: Prioritätsklassifizierung',
        'classification_criteria': 'Klassifizierungskriterien',
        'high_priority_desc': 'HOHE PRIORITÄT',
        'high_priority_criteria1': 'Dichte ≥ {}× Schwellenwert ({:.4f}‰)',
        'high_priority_criteria2': 'Dichte ≥ {}‰ absolutes Minimum',
        'high_priority_criteria3': '≥10 INAD-Fälle',
        'high_priority_criteria4': '≥{:,} PAX (zuverlässige Daten)',
        'watch_list_desc': 'BEOBACHTUNGSLISTE',
        'watch_list_criteria': 'Dichte über Schwellenwert ({}‰)',
        'watch_list_criteria2': 'Erfüllt nicht alle Kriterien für hohe Priorität',
        'clear_desc': 'UNBEDENKLICH - Unter Schwellenwert',
        'clear_criteria': 'Dichte unter Schwellenwert, keine sofortige Aktion erforderlich',
        'unreliable_desc': 'UNZUVERLÄSSIG',
        'unreliable_criteria': 'Weniger als {:,} PAX - unzureichende Daten für zuverlässige Analyse',
        'pax': 'PAX',
        'density': 'Dichte',
        'confidence': 'Konfidenz',
        'priority': 'Priorität',
        'high_priority_routes_msg': '{} Routen erfordern sofortige Aufmerksamkeit',
        'requires_legal_review': 'Diese Routen erfordern rechtliche Prüfung und mögliche Carrier-Sanktionsverfahren.',
        'watch_list_routes_msg': '{} Routen unter Beobachtung',
        'monitor_escalation': 'Überwachen Sie diese Routen auf mögliche Eskalation zu hoher Priorität.',
        'density_vs_pax': 'Dichte vs. Passagiervolumen',
        
        # Systemic cases
        'systemic_header': 'Erkennung systemischer Fälle',
        'systemic_info': 'Routen, die in mehreren aufeinanderfolgenden Semestern als HOHE PRIORITÄT oder BEOBACHTUNGSLISTE erscheinen, können auf systemische Probleme hinweisen, die eine eskalierte Intervention erfordern.',
        'analyzing_historical': 'Historische Daten werden analysiert...',
        'systemic_analysis_error': 'Fehler bei der systemischen Analyse:',
        'no_systemic_routes': 'Keine Routen wurden in mehreren Semestern markiert.',
        'systemic_cases': 'Systemische Fälle',
        'routes_flagged_multiple': 'Mehrfach markierte Routen',
        'worsening_trends': 'Verschlechternde Trends',
        'confirmed_systemic': 'Bestätigte systemische Fälle',
        'systemic_description': 'Routen, die in 2+ aufeinanderfolgenden Semestern markiert wurden',
        'appearances': 'Erscheinungen',
        'consecutive': 'Aufeinanderfolgend',
        'trend': 'Trend',
        'latest_data': 'Neueste Daten',
        'current_priority': 'Aktuelle Priorität',
        'historical_trends': 'Historische Trends',
        'flagged_routes_time': 'Markierte Routen im Zeitverlauf',
        'semester': 'Semester',
        'number_routes': 'Anzahl Routen',
        'route_history_detail': 'Routenhistorie Detail',
        'select_route_history': 'Route zur Ansicht der Historie auswählen',
        'history': 'Historie:',
        
        # Legal summary
        'legal_header': 'Rechtliche Zusammenfassung',
        'analysis_params': 'Analyseparameter',
        'period': 'Zeitraum:',
        'threshold_method_label': 'Schwellenwert-Methode:',
        'threshold_value': 'Schwellenwert:',
        'minimum_inad': 'Mindest-INAD:',
        'minimum_pax': 'Mindest-PAX:',
        'high_priority_routes': 'Routen mit hoher Priorität',
        'no_high_priority': 'Keine Routen als hohe Priorität klassifiziert.',
        'watch_list_routes': 'Routen auf Beobachtungsliste',
        'no_watch_list': 'Keine Routen auf der Beobachtungsliste.',
        'data_quality_notes': 'Hinweise zur Datenqualität',
        'export_reports': 'Berichte exportieren',
        'export_high_priority': 'Hohe Priorität exportieren',
        'export_watch_list': 'Beobachtungsliste exportieren',
        'export_full': 'Vollständige Analyse exportieren',
        
        # Footer
        'analysis_label': 'Analyse:',
        'threshold_label': 'Schwellenwert:',
        'min_pax_label': 'Min PAX:',
        'generated': 'Generiert:',
    },
    
    'fr': {
        # Language
        'language': 'Langue',
        
        # Main headers
        'main_header': 'Tableau de bord d\'analyse INAD',
        'sub_header': 'Analyse avancée avec classification de priorité et détection de cas systémiques',
        
        # Documentation
        'documentation': 'Documentation',
        'view_documentation': 'Voir la documentation',
        
        # Data configuration
        'data_configuration': 'Configuration des données',
        'data_source': 'Source des données',
        'upload_files': 'Télécharger des fichiers',
        'use_server_files': 'Utiliser les fichiers serveur',
        'upload_help': 'Téléchargez vos propres fichiers de données ou utilisez les fichiers stockés sur le serveur',
        'upload_data_files': 'Télécharger les fichiers de données',
        'inad_file': 'Fichier Excel INAD (.xlsm)',
        'inad_file_help': 'Fichier Excel contenant les données de cas INAD',
        'bazl_file': 'Fichier de données BAZL (.xlsx)',
        'bazl_file_help': 'Fichier Excel contenant les données passagers BAZL',
        'upload_warning': 'Veuillez télécharger les deux fichiers de données requis pour continuer.',
        'required_files': 'Fichiers requis:',
        'inad_description': 'Excel INAD (.xlsm): Contient les données des cas de passagers inadmissibles',
        'bazl_description': 'Données BAZL (.xlsx): Contient les données de volume de passagers par route',
        'files_uploaded': 'Fichiers téléchargés avec succès',
        'inad_file_path': 'Chemin du fichier INAD',
        'bazl_file_path': 'Chemin du fichier BAZL',
        'enter_paths_warning': 'Veuillez entrer des chemins de fichiers valides.',
        'files_not_found': 'Un ou plusieurs fichiers non trouvés. Veuillez vérifier les chemins.',
        
        # Time period
        'time_period': 'Période',
        'select_semester': 'Sélectionner le semestre',
        'loading_semesters': 'Chargement des semestres disponibles...',
        'error_loading_inad': 'Erreur lors du chargement des données INAD:',
        'no_data_found': 'Aucune donnée trouvée dans le fichier INAD.',
        
        # Analysis parameters
        'analysis_parameters': 'Paramètres d\'analyse',
        'min_inad_threshold': 'Seuil minimum INAD',
        'min_inad_help': 'Nombre minimum d\'INADs requis pour qu\'une route soit analysée',
        'min_pax_reliable': 'PAX minimum pour analyse fiable',
        'min_pax_help': 'Les routes avec moins de passagers sont marquées comme non fiables',
        'threshold_method': 'Méthode de seuil',
        'threshold_method_help': 'Méthode statistique pour calculer le seuil de densité',
        'min_density_high': 'Densité minimale pour haute priorité (‰)',
        'min_density_help': 'Seuil de densité minimum absolu pour la classification haute priorité',
        'high_priority_multiplier': 'Multiplicateur haute priorité',
        'multiplier_help': 'Les routes doivent dépasser le seuil × ce multiplicateur pour haute priorité',
        
        # Filters
        'filters': 'Filtres',
        'airlines': 'Compagnies aériennes',
        'airports_last_stop': 'Aéroports (Dernière escale)',
        
        # Running analysis
        'running_analysis': 'Analyse en cours...',
        'analysis_error': 'Erreur lors de l\'analyse:',
        
        # Summary metrics
        'total_inad': 'Total INAD',
        'high_priority': 'Haute Priorité',
        'watch_list': 'Liste de Surveillance',
        'unreliable': 'Non Fiable',
        'threshold': 'Seuil',
        'method': 'Méthode',
        
        # Tabs
        'tab_globe': 'Vue Globe',
        'tab_overview': 'Aperçu',
        'tab_step1': 'Étape 1: Compagnies',
        'tab_step2': 'Étape 2: Routes',
        'tab_step3': 'Étape 3: Priorité',
        'tab_systemic': 'Cas Systémiques',
        'tab_legal': 'Résumé Juridique',
        'tab_history': 'Historique',
        
        # Globe view
        'globe_title': 'Visualisation des Routes',
        'globe_controls': 'Contrôles du Globe',
        'show_priorities': 'Afficher les Priorités',
        'min_inad_display': 'INAD minimum à afficher',
        'routes_displayed': 'Routes Affichées',
        'unique_origins': 'Origines Uniques',
        'coverage': 'Couverture',
        'route_details': 'Détails de la Route',
        'select_route': 'Sélectionner une route pour détails',
        'airports_without_coords': 'aéroports sans coordonnées',
        'no_routes_match': 'Aucune route ne correspond aux critères de filtre actuels.',
        'globe_not_available': 'La visualisation du globe n\'est pas disponible.',
        'loading_geo_data': 'Chargement des données géographiques...',
        
        # Historical comparison
        'historical_comparison': 'Comparaison Historique',
        'compare_semesters': 'Comparer les Semestres',
        'select_comparison_semester': 'Sélectionner le semestre de comparaison',
        'current_semester': 'Actuel',
        'previous_semester': 'Précédent',
        'new_routes': 'Nouvelles Routes',
        'resolved_routes': 'Routes Résolues',
        'persistent_routes': 'Routes Persistantes',
        'trend_improving': 'En amélioration',
        'trend_worsening': 'En dégradation',
        'trend_stable': 'Stable',
        
        # Overview tab
        'analysis_overview': 'Aperçu de l\'analyse',
        'priority_distribution': 'Distribution des Priorités',
        'confidence_distribution': 'Distribution des Scores de Confiance',
        'medium_confidence': 'Confiance Moyenne',
        'data_quality_warnings': 'Avertissements de Qualité des Données',
        'top_routes_density': 'Meilleures Routes par Densité (Données Fiables Uniquement)',
        'density_label': 'Densité (‰)',
        'refusal_categories_flagged': 'Catégories de Refus (Routes Signalées)',
        'confidence_label': 'Score de Confiance',
        
        # Step 1
        'step1_header': 'Étape 1: Compagnies avec ≥{} INADs',
        'step1_summary': 'Résumé',
        'airlines_above_threshold': '{} compagnies au-dessus du seuil (≥{} INADs)',
        'airlines_below_threshold': '{} compagnies sous le seuil',
        'total_inads_flagged': '{} INADs totaux des compagnies signalées',
        'inad_distribution_airline': 'Distribution INAD par Compagnie',
        'review': 'À Examiner',
        'ok': 'OK',
        'airline': 'Compagnie',
        'inad_count': 'Nombre d\'INAD',
        'status': 'Statut',
        
        # Step 2
        'step2_header': 'Étape 2: Routes avec ≥{} INADs',
        'step2_summary': 'Résumé',
        'routes_above_threshold': '{} routes au-dessus du seuil (≥{} INADs)',
        'airlines_affected': '{} compagnies concernées',
        'top_airports_inad': 'Meilleurs Aéroports par Nombre d\'INAD',
        'airport': 'Aéroport',
        'last_stop': 'Dernière Escale',
        
        # Step 3
        'step3_header': 'Étape 3: Classification des Priorités',
        'classification_criteria': 'Critères de Classification',
        'high_priority_desc': 'HAUTE PRIORITÉ',
        'high_priority_criteria1': 'Densité ≥ {}× seuil ({:.4f}‰)',
        'high_priority_criteria2': 'Densité ≥ {}‰ minimum absolu',
        'high_priority_criteria3': '≥10 cas INAD',
        'high_priority_criteria4': '≥{:,} PAX (données fiables)',
        'watch_list_desc': 'LISTE DE SURVEILLANCE',
        'watch_list_criteria': 'Densité au-dessus du seuil ({}‰)',
        'watch_list_criteria2': 'Ne répond pas à tous les critères de haute priorité',
        'clear_desc': 'SANS PROBLÈME - Sous le seuil',
        'clear_criteria': 'Densité sous le seuil, aucune action immédiate nécessaire',
        'unreliable_desc': 'NON FIABLE',
        'unreliable_criteria': 'Moins de {:,} PAX - données insuffisantes pour une analyse fiable',
        'pax': 'PAX',
        'density': 'Densité',
        'confidence': 'Confiance',
        'priority': 'Priorité',
        'high_priority_routes_msg': '{} routes nécessitent une attention immédiate',
        'requires_legal_review': 'Ces routes nécessitent un examen juridique et des procédures de sanction potentielles.',
        'watch_list_routes_msg': '{} routes sous surveillance',
        'monitor_escalation': 'Surveillez ces routes pour une escalade potentielle vers haute priorité.',
        'density_vs_pax': 'Densité vs. Volume de Passagers',
        
        # Systemic cases
        'systemic_header': 'Détection de Cas Systémiques',
        'systemic_info': 'Les routes apparaissant comme HAUTE PRIORITÉ ou LISTE DE SURVEILLANCE pendant plusieurs semestres consécutifs peuvent indiquer des problèmes systémiques nécessitant une intervention escaladée.',
        'analyzing_historical': 'Analyse des données historiques...',
        'systemic_analysis_error': 'Erreur dans l\'analyse systémique:',
        'no_systemic_routes': 'Aucune route n\'a été signalée dans plusieurs semestres.',
        'systemic_cases': 'Cas Systémiques',
        'routes_flagged_multiple': 'Routes Signalées Plusieurs Fois',
        'worsening_trends': 'Tendances en Dégradation',
        'confirmed_systemic': 'Cas Systémiques Confirmés',
        'systemic_description': 'Routes signalées pendant 2+ semestres consécutifs',
        'appearances': 'Apparitions',
        'consecutive': 'Consécutifs',
        'trend': 'Tendance',
        'latest_data': 'Dernières Données',
        'current_priority': 'Priorité Actuelle',
        'historical_trends': 'Tendances Historiques',
        'flagged_routes_time': 'Routes Signalées au Fil du Temps',
        'semester': 'Semestre',
        'number_routes': 'Nombre de Routes',
        'route_history_detail': 'Détail de l\'Historique de Route',
        'select_route_history': 'Sélectionner une route pour voir l\'historique',
        'history': 'Historique:',
        
        # Legal summary
        'legal_header': 'Résumé Juridique',
        'analysis_params': 'Paramètres d\'Analyse',
        'period': 'Période:',
        'threshold_method_label': 'Méthode de Seuil:',
        'threshold_value': 'Valeur du Seuil:',
        'minimum_inad': 'INAD Minimum:',
        'minimum_pax': 'PAX Minimum:',
        'high_priority_routes': 'Routes Haute Priorité',
        'no_high_priority': 'Aucune route classée comme haute priorité.',
        'watch_list_routes': 'Routes en Liste de Surveillance',
        'no_watch_list': 'Aucune route en liste de surveillance.',
        'data_quality_notes': 'Notes sur la Qualité des Données',
        'export_reports': 'Exporter les Rapports',
        'export_high_priority': 'Exporter Haute Priorité',
        'export_watch_list': 'Exporter Liste de Surveillance',
        'export_full': 'Exporter Analyse Complète',
        
        # Footer
        'analysis_label': 'Analyse:',
        'threshold_label': 'Seuil:',
        'min_pax_label': 'PAX Min:',
        'generated': 'Généré:',
    }
}


def t(key: str, lang: str = 'en') -> str:
    """
    Get translation for a key in the specified language.
    Falls back to English if key not found in target language.
    
    Args:
        key: Translation key
        lang: Language code ('en', 'de', 'fr')
    
    Returns:
        Translated string or key if not found
    """
    translations = TRANSLATIONS.get(lang, TRANSLATIONS['en'])
    
    # Try target language first
    if key in translations:
        return translations[key]
    
    # Fall back to English
    if lang != 'en' and key in TRANSLATIONS['en']:
        return TRANSLATIONS['en'][key]
    
    # Return key if not found
    return key
