'use client';

import { FileText, Calculator, AlertTriangle, CheckCircle, Eye, HelpCircle } from 'lucide-react';

export function DocumentationTab() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Einführung */}
      <section>
        <h3 className="text-xl font-bold text-neutral-900 mb-4">CASA Reporting Dashboard</h3>
        <p className="text-neutral-600 leading-relaxed">
          Das CASA (Carrier Sanctions) Reporting Dashboard dient der systematischen Analyse von
          INAD-Fällen (Inadmissible Passengers) und Passagierdaten zur Überwachung von
          Luftverkehrsunternehmen im Schengen-Raum. Die Anwendung unterstützt das
          Staatssekretariat für Migration (SEM) bei der Identifikation von Airlines mit
          erhöhten Einreiseverweigerungsraten.
        </p>
      </section>

      {/* Datenquellen */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-600" />
          Datenquellen
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <h5 className="font-bold text-neutral-900 mb-2">INAD-Tabelle</h5>
            <p className="text-sm text-neutral-600 mb-2">
              Excel-Datei (.xlsx oder .xlsm) mit Einreiseverweigerungsdaten.
            </p>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>Tabellenblatt: &quot;INAD-Tabelle&quot;</li>
              <li>Spalten: Fluggesellschaft, Abflugort (Last Stop), Jahr, Monat</li>
              <li>Spalte S: Einreiseverweigerungsgrund (EVGrund)</li>
            </ul>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 p-4">
            <h5 className="font-bold text-neutral-900 mb-2">BAZL-Passagierdaten</h5>
            <p className="text-sm text-neutral-600 mb-2">
              Excel-Datei (.xlsx) mit Passagierstatistiken vom BAZL.
            </p>
            <ul className="text-sm text-neutral-500 space-y-1">
              <li>Tabellenblatt: &quot;BAZL-Daten&quot;</li>
              <li>Spalten: Airline Code (IATA), Flughafen (IATA)</li>
              <li>Passagiere / Passagers, Jahr, Monat</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Stufen-Analyse */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-red-600" />
          3-Stufen-Analyseverfahren
        </h4>

        <div className="space-y-4">
          {/* Stufe 1 */}
          <div className="border-l-4 border-neutral-900 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">Prüfstufe 1: Airline-Screening</h5>
            <p className="text-sm text-neutral-600 mt-1">
              Identifikation aller Airlines mit mindestens <strong>6 INAD-Fällen</strong> im
              gewählten Analysezeitraum (Semester). Airlines unter diesem Schwellenwert werden
              als unauffällig eingestuft und nicht weiter analysiert.
            </p>
          </div>

          {/* Stufe 2 */}
          <div className="border-l-4 border-neutral-700 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">Prüfstufe 2: Routen-Screening</h5>
            <p className="text-sm text-neutral-600 mt-1">
              Für Airlines aus Stufe 1: Aufschlüsselung nach Last Stop (letzter Abflugort vor
              der Einreise). Routen mit mindestens <strong>6 INAD-Fällen</strong> werden für
              die Dichte-Analyse qualifiziert.
            </p>
          </div>

          {/* Stufe 3 */}
          <div className="border-l-4 border-red-600 pl-4 py-2">
            <h5 className="font-bold text-neutral-900">Prüfstufe 3: Dichte-Analyse</h5>
            <p className="text-sm text-neutral-600 mt-1">
              Berechnung der INAD-Dichte pro Route: <code className="bg-neutral-100 px-1 rounded">
              Dichte = (Anzahl INAD / Anzahl Passagiere) × 1000</code> (in Promille).
              Der Schwellenwert wird als <strong>Median</strong> aller berechneten Dichten ermittelt.
            </p>
          </div>
        </div>
      </section>

      {/* Klassifizierung */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3">Klassifizierung</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Hohe Priorität */}
          <div className="flex items-start gap-3 p-3 bg-red-50 border-2 border-red-600">
            <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 text-sm uppercase tracking-wide">Sanktion</p>
              <p className="text-xs text-red-700 mt-1">
                Dichte &ge; Schwellenwert × 1.5, UND Dichte &ge; 0.10‰, UND mindestens 10 INADs
              </p>
            </div>
          </div>

          {/* Beobachtung */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 border-2 border-amber-600">
            <Eye className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-sm uppercase tracking-wide">Beobachtung</p>
              <p className="text-xs text-amber-700 mt-1">
                Dichte &ge; Schwellenwert (Median)
              </p>
            </div>
          </div>

          {/* Konform */}
          <div className="flex items-start gap-3 p-3 bg-green-50 border-2 border-green-600">
            <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-green-900 text-sm uppercase tracking-wide">Konform</p>
              <p className="text-xs text-green-700 mt-1">
                Dichte unter dem Schwellenwert
              </p>
            </div>
          </div>

          {/* Unzuverlässig */}
          <div className="flex items-start gap-3 p-3 bg-neutral-100 border-2 border-neutral-400">
            <HelpCircle className="w-5 h-5 text-neutral-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-neutral-700 text-sm uppercase tracking-wide">Unzuverlässig</p>
              <p className="text-xs text-neutral-600 mt-1">
                Passagierzahl unter 5&apos;000 - Dichte statistisch nicht aussagekräftig
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ausgeschlossene Codes */}
      <section>
        <h4 className="text-lg font-bold text-neutral-900 mb-3">Ausgeschlossene Einreiseverweigerungsgründe</h4>
        <p className="text-sm text-neutral-600 mb-3">
          Folgende Einreiseverweigerungscodes werden von der INAD-Zählung ausgeschlossen, da sie
          administrative Gründe darstellen und nicht die Carrier-Performance widerspiegeln:
        </p>
        <div className="flex flex-wrap gap-2">
          {['B1n', 'B2n', 'C4n', 'C5n', 'C8', 'D1n', 'D2n', 'E', 'F1n', 'G', 'H', 'I'].map((code) => (
            <span
              key={code}
              className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs font-mono border border-neutral-300"
            >
              {code}
            </span>
          ))}
        </div>
      </section>

      {/* Hinweise */}
      <section className="bg-neutral-50 border border-neutral-200 p-5">
        <h4 className="font-bold text-neutral-900 mb-2">Hinweise zur Datenverarbeitung</h4>
        <ul className="text-sm text-neutral-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">1.</span>
            Alle Daten werden lokal im Browser verarbeitet - es werden keine Daten an Server übermittelt.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">2.</span>
            Der Analysezeitraum basiert auf Semestern: H1 = Januar-Juni, H2 = Juli-Dezember.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600 font-bold">3.</span>
            Die Ergebnisse können als CSV-Datei exportiert werden.
          </li>
        </ul>
      </section>
    </div>
  );
}
