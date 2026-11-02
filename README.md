# Reisekostenabrechnung

Statische Seite für die Reisekostenabrechnung der LETHE Exterior Doors GmbH. Sie läuft komplett im Browser, ohne Server und ohne Build-Schritt.

## Funktionen

1. Sprache wählen: Deutsch, Englisch oder Russisch.
2. Vorlage wählen: Spesenabrechnung, Abrechnung gegen Beleg oder KM-Abrechnung.
3. Formular ausfüllen. Summen, Stunden und Kilometergeld (0,30 € je km) werden automatisch berechnet.
4. Im Feld unterschreiben (Maus, Finger oder Stift).
5. Sichern ist erst nach Name, Anlass und Unterschrift möglich:
   - **PDF-Auszug sichern** öffnet den Druckdialog des Browsers im A4-Layout. Dort „Als PDF speichern“ wählen.
   - **Daten als Datei sichern** lädt eine `.json`-Datei herunter, die sich später wieder laden lässt.

Es wird nichts ins Netz gesendet. Eine Content-Security-Policy in `index.html` blockiert jede Netzwerkverbindung der Seite. Gespeichert wird nur über den Download in den Browser auf dem eigenen Gerät.

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf GitHub anlegen, zum Beispiel `reisekostenabrechnung`.
2. Alle Dateien aus diesem Ordner hochladen (`index.html`, `style.css`, `app.js`, `README.md`, `GLOSSARY.md`, `docs/`).
3. Im Repository **Settings → Pages** öffnen, bei **Source** „Deploy from a branch“ wählen, Branch `main` und Ordner `/ (root)` einstellen, speichern.
4. Nach etwa einer Minute ist die Seite unter `https://<benutzername>.github.io/reisekostenabrechnung/` erreichbar.

Bei einem privaten Repository ist GitHub Pages nur mit bestimmten GitHub-Tarifen verfügbar.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seitengerüst und Content-Security-Policy |
| `style.css` | Oberfläche und Druck-Layout |
| `app.js` | Texte in drei Sprachen, Formulare, Berechnung, Unterschrift, Sichern |
| `GLOSSARY.md` | Begriffe der Reisekostenabrechnung, abgeleitet aus den Vorlagen |
| `docs/regeln.md` | Regeln und offene Punkte |

## Anpassen

- Kilometersatz: Konstante `KM_RATE` am Anfang von `app.js`.
- Zeilenlimits je Vorlage: `LIMITS` in `app.js`.
- Texte und Übersetzungen: Objekt `I18N` in `app.js`.
