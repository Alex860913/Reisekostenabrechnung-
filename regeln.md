# Regeln und offene Punkte

Begriffe stehen in `GLOSSARY.md`.

## Regeln

- Name, Projektname / Vorgang und Unterschrift sind vor dem Sichern Pflicht.
- Der Ort wird auf der Spesenabrechnung einmal oben unter Projektname / Vorgang aus der Liste in `orte.js` gewählt. Die Tabelle hat keine Spalte „Ort“ mehr. Die Auswahl ist kein Pflichtfeld.
- Unter der Auswahl stehen die Pauschbeträge des gewählten Landes bzw. Ortes (Auslandspauschalen ab 1. Januar 2026): „Abwesenheit über 14 h“ = Spalte „Abwesenheitsdauer über 8 Stunden“ der Liste, „Abwesenheit über 24 h“ = Spalte „Abwesenheitsdauer von mindestens 24 Stunden“. Für „Deutschland (Inland)“ erscheint stattdessen ein Hinweis, dass die Liste keine Beträge enthält. Die Beträge sind nur eine Anzeige und werden nicht automatisch in die Tabelle übernommen.
- Die Stunden einer Verpflegungszeile ergeben sich aus Uhrzeit von/bis. Liegt „bis“ vor „von“, läuft die Zeit über Mitternacht.
- Verpflegungsmehraufwand wird nur innerhalb der ersten drei Monate auf einer neuen Werft erstattet (Hinweis der Vorlage).
- Kilometergeld = Summe der Kilometer × 0,30 €.
- Summe der Spesenabrechnung = Summe Verpflegungsmehraufwand + Summe sonstige pauschale Erstattungen (LA 9976, steuerfrei).
- Summe der Abrechnung gegen Beleg = Summe aller Auslagen. Sie wird überwiesen.
- Summe des Eigenbelegs = Summe aller Ausgaben ohne Beleg.
- Bewirtung zählt für Frühstück mit 20 %, für Mittag- und Abendessen mit je 40 %.
- Zeilenlimits je Vorlage: Verpflegung 20, sonstige Pauschalen 2, Auslagen 17, Fahrten 11, Eigenbeleg 12.
- Alle Eingaben bleiben auf dem Gerät. Es gibt keine Übertragung ins Netz.

## Offene Punkte

- `orte.js` enthält Länder, Orte und die zwei Pauschbeträge je Eintrag (214 Zeilen, 166 Länder), von Hand aus den Seiten der PDF-Übersicht übertragen und mit der 2/3-Regel (über 8 h ≈ 2/3 von 24 h) sowie einer Sichtprüfung kontrolliert. Länder und Orte stehen in allen Sprachen auf Deutsch. Beträge der Übernachtung sind nicht enthalten.
- Die Bezeichnung „über 14 h“ folgt der Vorgabe des Auftraggebers; die Spalte der Liste gilt rechtlich ab mehr als 8 Stunden Abwesenheit.
- Für das Inland enthält die Liste keine Beträge, es wird nur ein Hinweis angezeigt.
- Die Beträge der Tabelle werden weiterhin von Hand eingetragen.
- Die Prozentwerte der Bewirtung werden nur dokumentiert, nicht in Euro umgerechnet.
- Der Aufbau von `GLOSSARY.md` folgt der Konvention aus dem Commit `d80fa0f` im Repository `mattpocock/skills`. Die Dateien `SKILL.md` und `GLOSSARY-FORMAT.md` des Skills konnten nicht gelesen werden, das genaue Format ist daher nicht abgeglichen.
