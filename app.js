'use strict';
(function () {
  /* ---------- Konstanten ---------- */
  var KM_RATE = 0.30;
  var LOCALES = { de: 'de-DE', en: 'en-GB', ru: 'ru-RU' };
  var LANG_NAMES = { de: 'Deutsch', en: 'English', ru: 'Kyrillisch' };
  var TYPES = ['spesen', 'beleg', 'km', 'eigen'];
  var FILE_NAMES = { spesen: 'Spesenabrechnung', beleg: 'Abrechnung_gegen_Beleg', km: 'KM-Abrechnung', eigen: 'Eigenbeleg' };
  var LIMITS = { meal: 20, other: 2, beleg: 17, km: 11, eigen: 12 };
  var START = { meal: 6, other: 2, beleg: 8, km: 6, eigen: 12 };
  var BLANK = {
    meal: function () { return { date: '', from: '', to: '', place: '', amount: '' }; },
    other: function () { return { period: '', text: '', amount: '' }; },
    beleg: function () { return { date: '', text: '', amount: '' }; },
    km: function () { return { date: '', dest: '', km: '' }; },
    eigen: function () { return { date: '', text: '', amount: '' }; }
  };
  var SIG_RE = /^data:image\/png;base64,[A-Za-z0-9+\/=]+$/;

  /* ---------- Texte ---------- */
  var I18N = {
    de: {
      ui: {
        appTitle: 'Reisekostenabrechnung',
        privacy: 'Alle Eingaben bleiben auf diesem Gerät. Die Seite sendet nichts ins Netz.',
        stepLang: 'Sprache', stepType: 'Art der Vorlage', stepFill: 'Ausfüllen',
        stepSign: 'Unterschreiben', stepSave: 'Sichern',
        signHint: 'Unterschreiben Sie im Feld mit Maus, Finger oder Stift. Erst danach lässt sich speichern.',
        clear: 'Unterschrift löschen', addRow: 'Zeile hinzufügen', removeRow: 'Zeile entfernen',
        btnPdf: 'PDF-Auszug sichern', btnJson: 'Daten als Datei sichern', btnLoad: 'Gesicherte Daten laden',
        missing: 'Zum Sichern fehlt noch: ', ready: 'Bereit. Beim PDF-Auszug wählen Sie im Druckdialog „Als PDF speichern“.',
        fName: 'Name', fOccasion: 'Projektname / Vorgang', fSignature: 'Unterschrift',
        loadOk: 'Daten geladen.', loadErr: 'Die Datei konnte nicht gelesen werden.',
        btnPdfAlt: 'Druckfertige Datei sichern',
        readyFile: 'Bereit. Die gesicherte Datei öffnen Sie im Browser und drucken sie dort als PDF (Strg+P).',
        saved: 'Gesichert.', saveErr: 'Das Sichern hat nicht geklappt.',
        t: { spesen: 'Spesenabrechnung', beleg: 'Abrechnung gegen Beleg', km: 'KM-Abrechnung', eigen: 'Eigenbeleg' }
      },
      f: {
        name: 'Name:', occasion: 'Projektname / Vorgang:', date: 'Datum', signature: 'Unterschrift Mitarbeiter',
        spTitle: 'Spesenabrechnung',
        spS1: '1.) pauschale Verpflegungsmehraufwendungen / Erstattung mit Lohnabrechnung',
        spS1Note: 'Erstattung nur innerhalb der ersten drei Monate auf neuer Werft',
        colDate: 'Datum', colTime: 'Uhrzeit', colFrom: 'von', colTo: 'bis', colHours: 'Anz. Std.', colPlace: 'Ort', colAmount: 'Betrag €',
        spS2: '2) Sonstige pauschale Kostenerstattungen',
        spS2Note: 'z.B. pauschale Erstattung von Telefonkosten, Unterkunft, etc.',
        colPeriod: 'Zeitraum', colText: 'Text',
        spTotal: 'Summe pauschale Kosten / Erstattung mit Lohnabrechnung:', spLa: 'LA 9976) stfr',
        hospTitle: 'Bei Bewirtung: Geldwerter Vorteil aus Arbeitnehmerbewirtung',
        hospIntro: 'Ich habe vom Arbeitgeber unentgeltlich erhalten:',
        hospB: 'x Frühstück je 20%', hospL: 'x Mittagessen je 40%', hospD: 'x Abendessen je 40%',
        hospOffset: 'Verrechnung mit pauschaler Verpflegung', hospTax: 'Versteuerung als laufender Arbeitslohn',
        beTitle: 'Abrechnung gegen Beleg', beSec: 'b.) Sonstiges / Auslagen', beSecNote: '(Original-Belege beigefügt):', bePay: 'Überweisung',
        kmTitle: 'KM-Abrechnung', kmIntro: 'Pauschale Kostenerstattung für Dienstfahrten im betrieblichen Auftrag',
        kmPlate: "poliz. Kennz. des priv. PKW's:", kmDest: 'Ziel der Fahrt (Firma, Ort)', kmCol: 'KM',
        kmSum: 'Summe gefahrene Kilometer:', kmEur: 'Summe in Euro:', kmUnit: 'KM', kmLa: 'LA 51)',
        eiTitle: 'Eigenbeleg', eiCol: 'Ausgaben ohne Beleg:', eiTotal: 'total', eiPlace: 'Ort:', eiDate: 'Datum:', eiSign: 'Unterschrift'
      }
    },
    en: {
      ui: {
        appTitle: 'Travel expense report',
        privacy: 'Everything you enter stays on this device. This page sends nothing over the network.',
        stepLang: 'Language', stepType: 'Type of form', stepFill: 'Fill in',
        stepSign: 'Sign', stepSave: 'Save',
        signHint: 'Sign in the box with a mouse, finger or pen. Saving is possible only after that.',
        clear: 'Clear signature', addRow: 'Add row', removeRow: 'Remove row',
        btnPdf: 'Save PDF extract', btnJson: 'Save data as file', btnLoad: 'Load saved data',
        missing: 'Still missing before saving: ', ready: 'Ready. For the PDF extract, choose “Save as PDF” in the print dialog.',
        fName: 'Name', fOccasion: 'Project name / reference', fSignature: 'Signature',
        loadOk: 'Data loaded.', loadErr: 'The file could not be read.',
        btnPdfAlt: 'Save print-ready file',
        readyFile: 'Ready. Open the saved file in your browser and print it as PDF there (Ctrl+P).',
        saved: 'Saved.', saveErr: 'Saving did not work.',
        t: { spesen: 'Flat-rate allowances', beleg: 'Reimbursement against receipts', km: 'Mileage claim', eigen: 'Self-issued receipt' }
      },
      f: {
        name: 'Name:', occasion: 'Project name / reference:', date: 'Date', signature: 'Employee signature',
        spTitle: 'Allowance claim',
        spS1: '1.) Flat-rate meal allowances / reimbursed with payroll',
        spS1Note: 'Reimbursement only within the first three months at a new shipyard',
        colDate: 'Date', colTime: 'Time', colFrom: 'from', colTo: 'to', colHours: 'Hours', colPlace: 'Place', colAmount: 'Amount €',
        spS2: '2) Other flat-rate reimbursements',
        spS2Note: 'e.g. flat-rate reimbursement of phone costs, accommodation, etc.',
        colPeriod: 'Period', colText: 'Description',
        spTotal: 'Total flat-rate costs / reimbursed with payroll:', spLa: 'LA 9976) tax-free',
        hospTitle: 'For hospitality: non-cash benefit from employer-provided meals',
        hospIntro: 'I received free of charge from my employer:',
        hospB: 'x breakfast at 20%', hospL: 'x lunch at 40%', hospD: 'x dinner at 40%',
        hospOffset: 'Offset against flat-rate meal allowance', hospTax: 'Taxed as regular salary',
        beTitle: 'Reimbursement against receipts', beSec: 'b.) Other / expenses', beSecNote: '(original receipts attached):', bePay: 'Bank transfer',
        kmTitle: 'Mileage claim', kmIntro: 'Flat-rate reimbursement for business trips in a private car',
        kmPlate: 'Licence plate of private car:', kmDest: 'Destination (company, place)', kmCol: 'KM',
        kmSum: 'Total kilometres driven:', kmEur: 'Total in euros:', kmUnit: 'KM', kmLa: 'LA 51)',
        eiTitle: 'Self-issued receipt', eiCol: 'Expenses without receipt:', eiTotal: 'total', eiPlace: 'Place:', eiDate: 'Date:', eiSign: 'Signature'
      }
    },
    ru: {
      ui: {
        appTitle: 'Отчёт о командировочных расходах',
        privacy: 'Все данные остаются на этом устройстве. Страница ничего не отправляет в сеть.',
        stepLang: 'Язык', stepType: 'Тип формы', stepFill: 'Заполнить',
        stepSign: 'Подписать', stepSave: 'Сохранить',
        signHint: 'Распишитесь в поле мышью, пальцем или стилусом. Сохранить можно только после этого.',
        clear: 'Стереть подпись', addRow: 'Добавить строку', removeRow: 'Удалить строку',
        btnPdf: 'Сохранить выписку в PDF', btnJson: 'Сохранить данные в файл', btnLoad: 'Загрузить сохранённые данные',
        missing: 'Для сохранения ещё не хватает: ', ready: 'Готово. Для PDF в окне печати выберите «Сохранить как PDF».',
        fName: 'ФИО', fOccasion: 'Название проекта / дело', fSignature: 'Подпись',
        loadOk: 'Данные загружены.', loadErr: 'Не удалось прочитать файл.',
        btnPdfAlt: 'Сохранить файл для печати',
        readyFile: 'Готово. Откройте сохранённый файл в браузере и распечатайте его в PDF (Ctrl+P).',
        saved: 'Сохранено.', saveErr: 'Не удалось сохранить.',
        t: { spesen: 'Суточные и пауш. расходы', beleg: 'Возмещение по чекам', km: 'Возмещение за километраж', eigen: 'Собственный документ (без чека)' }
      },
      f: {
        name: 'ФИО:', occasion: 'Название проекта / дело:', date: 'Дата', signature: 'Подпись сотрудника',
        spTitle: 'Отчёт о суточных расходах',
        spS1: '1.) Пауш. возмещение дополнительных расходов на питание / выплата с зарплатой',
        spS1Note: 'Выплата только в течение первых трёх месяцев на новой верфи',
        colDate: 'Дата', colTime: 'Время', colFrom: 'с', colTo: 'до', colHours: 'Кол-во ч.', colPlace: 'Место', colAmount: 'Сумма €',
        spS2: '2) Прочие пауш. возмещения расходов',
        spS2Note: 'напр. пауш. возмещение расходов на телефон, проживание и т. д.',
        colPeriod: 'Период', colText: 'Текст',
        spTotal: 'Итого пауш. расходы / выплата с зарплатой:', spLa: 'LA 9976) не облагается налогом',
        hospTitle: 'При угощении: денежная выгода работника от питания за счёт работодателя',
        hospIntro: 'Я бесплатно получил(а) от работодателя:',
        hospB: 'x завтрак по 20%', hospL: 'x обед по 40%', hospD: 'x ужин по 40%',
        hospOffset: 'Зачёт в счёт пауш. питания', hospTax: 'Налогообложение как текущая зарплата',
        beTitle: 'Возмещение расходов по чекам', beSec: 'б.) Прочее / расходы', beSecNote: '(оригиналы чеков приложены):', bePay: 'Банковский перевод',
        kmTitle: 'Отчёт о километраже', kmIntro: 'Пауш. возмещение расходов на служебные поездки по поручению предприятия',
        kmPlate: 'Гос. номер личного автомобиля:', kmDest: 'Цель поездки (фирма, город)', kmCol: 'КМ',
        kmSum: 'Всего пройдено километров:', kmEur: 'Сумма в евро:', kmUnit: 'км', kmLa: 'LA 51)',
        eiTitle: 'Собственный документ (без чека)', eiCol: 'Расходы без чека:', eiTotal: 'итого', eiPlace: 'Место:', eiDate: 'Дата:', eiSign: 'Подпись'
      }
    }
  };

  /* ---------- Zustand ---------- */
  function pad2(n) { return String(n).padStart(2, '0'); }
  function localToday() {
    var d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function makeRows(k) {
    var a = [];
    for (var i = 0; i < START[k]; i++) a.push(BLANK[k]());
    return a;
  }
  function blankHosp() { return { b: '', l: '', d: '', mode: '' }; }

  /* Nur in einer Umgebung ohne Druckdialog (z. B. Vorschau-Link) gesetzt: Sichern läuft dann über eine Datei. */
  var dl = null;

  var state = {
    lang: 'de', type: 'spesen',
    name: '', occasion: '', city: '', date: localToday(), sig: null, plate: '',
    meal: makeRows('meal'), other: makeRows('other'), beleg: makeRows('beleg'), km: makeRows('km'), eigen: makeRows('eigen'),
    hosp: { spesen: blankHosp(), beleg: blankHosp() }
  };

  /* ---------- Helfer ---------- */
  var $ = function (s) { return document.querySelector(s); };
  var paperEl = $('#paper');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function T() { return I18N[state.lang]; }

  function parseNum(v) {
    var s = String(v == null ? '' : v).trim().replace(/[\s€]/g, '');
    if (!s) return 0;
    var lc = s.lastIndexOf(','), ld = s.lastIndexOf('.');
    if (lc > -1 && ld > -1) {
      s = lc > ld ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else {
      s = s.replace(',', '.');
    }
    var n = Number(s);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function fmtEur(n) {
    return new Intl.NumberFormat(LOCALES[state.lang], { style: 'currency', currency: 'EUR' }).format(n);
  }
  function fmtNum(n, digits) {
    return new Intl.NumberFormat(LOCALES[state.lang], { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n);
  }
  function sum(list, field) {
    var t = 0;
    list.forEach(function (r) { t += parseNum(r[field]); });
    return Math.round(t * 100) / 100;
  }
  function hours(from, to) {
    if (!from || !to) return '';
    var a = from.split(':'), b = to.split(':');
    var m = (+b[0] * 60 + +b[1]) - (+a[0] * 60 + +a[1]);
    if (m < 0) m += 1440;
    return m / 60;
  }
  function setOut(id, text) {
    var el = paperEl.querySelector('#' + id);
    if (el) el.textContent = text;
  }

  /* ---------- Formular zeichnen ---------- */
  function rmCell(k, i) {
    return '<td class="noprint c-rm" data-c="rm"><button type="button" class="rm" data-rm="' + k + '" data-i="' + i + '" aria-label="' +
      esc(T().ui.removeRow) + '"' + (state[k].length <= 1 ? ' disabled' : '') + '>×</button></td>';
  }
  function addBtn(k) {
    return '<button type="button" class="add noprint" data-add="' + k + '"' +
      (state[k].length >= LIMITS[k] ? ' disabled' : '') + '>+ ' + esc(T().ui.addRow) + '</button>';
  }
  function cell(k, i, field, type, value, label, cls) {
    return '<input type="' + type + '" data-k="' + k + '" data-i="' + i + '" data-f="' + field + '"' +
      (cls ? ' class="' + cls + '"' : '') + (type === 'text' && cls === 'num' ? ' inputmode="decimal"' : '') +
      ' value="' + esc(value) + '" aria-label="' + esc(label) + '">';
  }

  function headBlock(title) {
    var f = T().f;
    return '<div class="p-head"><h2 class="p-title">' + esc(title) + '</h2>' +
      '<address class="p-company">LETHE Exterior Doors GmbH<br>Marschgehren 14<br>28779 Bremen</address></div>' +
      '<div class="p-meta">' +
      '<label class="line"><span>' + esc(f.name) + '</span><input type="text" id="f-name" data-k="name" autocomplete="name" value="' + esc(state.name) + '"></label>' +
      '<label class="line"><span>' + esc(f.occasion) + '</span><input type="text" id="f-occasion" data-k="occasion" value="' + esc(state.occasion) + '"></label>' +
      '</div>';
  }

  function hospBlock(tk) {
    var f = T().f, h = state.hosp[tk];
    var counts = [['b', 'hospB'], ['l', 'hospL'], ['d', 'hospD']].map(function (p) {
      return '<label class="cnt"><input type="number" min="0" step="1" inputmode="numeric" data-k="hosp" data-t="' + tk +
        '" data-f="' + p[0] + '" value="' + esc(h[p[0]]) + '" aria-label="' + esc(f[p[1]]) + '"><span>' + esc(f[p[1]]) + '</span></label>';
    }).join('');
    var modes = [['offset', 'hospOffset'], ['tax', 'hospTax']].map(function (p) {
      return '<label class="opt"><input type="radio" name="hm-' + tk + '" data-k="hosp" data-t="' + tk +
        '" data-f="mode" value="' + p[0] + '"' + (h.mode === p[0] ? ' checked' : '') + '><span>' + esc(f[p[1]]) + '</span></label>';
    }).join('');
    return '<div class="hosp"><div><p>' + esc(f.hospTitle) + '</p><p>' + esc(f.hospIntro) + '</p>' + counts + '</div>' +
      '<div class="hosp-r">' + modes + '</div></div>';
  }

  function signBlock(withDate) {
    var f = T().f;
    var img = state.sig ? '<img src="' + esc(state.sig) + '" alt="">' : '';
    var date = withDate
      ? '<div class="sg sg-date"><div class="sg-top"><input type="date" id="f-date" data-k="date" value="' + esc(state.date) +
        '" aria-label="' + esc(f.date) + '"></div><div class="sg-line"></div><span>' + esc(f.date) + '</span></div>'
      : '';
    return '<div class="p-sign">' + date + '<div class="sg sg-sig"><div class="sg-top">' + img +
      '</div><div class="sg-line"></div><span>' + esc(f.signature) + '</span></div></div>';
  }

  function paperSpesen() {
    var f = T().f;
    var meal = state.meal.map(function (r, i) {
      return '<tr class="r-meal"><td data-c="date" data-label="' + esc(f.colDate) + '">' + cell('meal', i, 'date', 'date', r.date, f.colDate) + '</td>' +
        '<td data-c="from" data-label="' + esc(f.colFrom) + '">' + cell('meal', i, 'from', 'time', r.from, f.colFrom) + '</td>' +
        '<td data-c="to" data-label="' + esc(f.colTo) + '">' + cell('meal', i, 'to', 'time', r.to, f.colTo) + '</td>' +
        '<td class="num" data-c="hrs" data-label="' + esc(f.colHours) + '"><output data-hours="' + i + '"></output></td>' +
        '<td data-c="place" data-label="' + esc(f.colPlace) + '">' + cell('meal', i, 'place', 'text', r.place, f.colPlace) + '</td>' +
        '<td data-c="amount" data-label="' + esc(f.colAmount) + '">' + cell('meal', i, 'amount', 'text', r.amount, f.colAmount, 'num') + '</td>' + rmCell('meal', i) + '</tr>';
    }).join('');
    var other = state.other.map(function (r, i) {
      return '<tr class="r-other"><td data-c="period" data-label="' + esc(f.colPeriod) + '">' + cell('other', i, 'period', 'text', r.period, f.colPeriod) + '</td>' +
        '<td colspan="4" data-c="text" data-label="' + esc(f.colText) + '">' + cell('other', i, 'text', 'text', r.text, f.colText) + '</td>' +
        '<td data-c="amount" data-label="' + esc(f.colAmount) + '">' + cell('other', i, 'amount', 'text', r.amount, f.colAmount, 'num') + '</td>' + rmCell('other', i) + '</tr>';
    }).join('');
    return headBlock(f.spTitle) +
      '<h3 class="p-sec">' + esc(f.spS1) + '</h3><p class="p-note">' + esc(f.spS1Note) + '</p>' +
      '<table class="grid"><colgroup><col class="c-date"><col class="c-time"><col class="c-time"><col class="c-hrs"><col><col class="c-amt"><col class="noprint c-rm"></colgroup>' +
      '<thead><tr><th rowspan="2">' + esc(f.colDate) + '</th><th colspan="2">' + esc(f.colTime) + '</th><th rowspan="2">' + esc(f.colHours) +
      '</th><th rowspan="2">' + esc(f.colPlace) + '</th><th rowspan="2">' + esc(f.colAmount) + '</th><th rowspan="2" class="noprint c-rm"></th></tr>' +
      '<tr><th>' + esc(f.colFrom) + '</th><th>' + esc(f.colTo) + '</th></tr></thead>' +
      '<tbody>' + meal + '</tbody>' +
      '<tfoot><tr><td colspan="5"></td><td class="sum"><output id="sum-meal"></output></td><td class="noprint"></td></tr></tfoot></table>' +
      addBtn('meal') +
      '<h3 class="p-sec">' + esc(f.spS2) + '</h3><p class="p-note">' + esc(f.spS2Note) + '</p>' +
      '<table class="grid"><colgroup><col class="c-date"><col class="c-time"><col class="c-time"><col class="c-hrs"><col><col class="c-amt"><col class="noprint c-rm"></colgroup>' +
      '<thead><tr><th>' + esc(f.colPeriod) + '</th><th colspan="4">' + esc(f.colText) + '</th><th>' + esc(f.colAmount) + '</th><th class="noprint c-rm"></th></tr></thead>' +
      '<tbody>' + other + '</tbody></table>' + addBtn('other') +
      '<div class="p-total"><span>' + esc(f.spTotal) + '</span><output id="tot"></output><span class="la">' + esc(f.spLa) + '</span></div>' +
      hospBlock('spesen') + signBlock(false);
  }

  function paperBeleg() {
    var f = T().f;
    var body = state.beleg.map(function (r, i) {
      return '<tr class="r-beleg"><td data-c="date" data-label="' + esc(f.colDate) + '">' + cell('beleg', i, 'date', 'date', r.date, f.colDate) + '</td>' +
        '<td data-c="text" data-label="' + esc(f.colText) + '">' + cell('beleg', i, 'text', 'text', r.text, f.colText) + '</td>' +
        '<td data-c="amount" data-label="' + esc(f.colAmount) + '">' + cell('beleg', i, 'amount', 'text', r.amount, f.colAmount, 'num') + '</td>' + rmCell('beleg', i) + '</tr>';
    }).join('');
    return headBlock(f.beTitle) +
      '<h3 class="p-sec">' + esc(f.beSec) + ' <span class="norm">' + esc(f.beSecNote) + '</span></h3>' +
      '<table class="grid"><colgroup><col class="c-date"><col><col class="c-amt"><col class="noprint c-rm"></colgroup>' +
      '<thead><tr><th>' + esc(f.colDate) + '</th><th>' + esc(f.colText) + '</th><th>' + esc(f.colAmount) + '</th><th class="noprint c-rm"></th></tr></thead>' +
      '<tbody>' + body + '</tbody></table>' + addBtn('beleg') +
      '<div class="p-total"><span>' + esc(f.bePay) + '</span><output id="tot"></output><span class="la"></span></div>' +
      hospBlock('beleg') + signBlock(true);
  }

  function paperKm() {
    var f = T().f;
    var body = state.km.map(function (r, i) {
      return '<tr class="r-km"><td data-c="date" data-label="' + esc(f.colDate) + '">' + cell('km', i, 'date', 'date', r.date, f.colDate) + '</td>' +
        '<td data-c="dest" data-label="' + esc(f.kmDest) + '">' + cell('km', i, 'dest', 'text', r.dest, f.kmDest) + '</td>' +
        '<td data-c="km" data-label="' + esc(f.kmCol) + '">' + cell('km', i, 'km', 'text', r.km, f.kmCol, 'num') + '</td>' + rmCell('km', i) + '</tr>';
    }).join('');
    return headBlock(f.kmTitle) +
      '<h3 class="p-sec">' + esc(f.kmIntro) + '</h3>' +
      '<div class="plate"><div class="plate-h">' + esc(f.kmPlate) + '</div><input type="text" id="f-plate" data-k="plate" autocapitalize="characters" value="' + esc(state.plate) + '" aria-label="' + esc(f.kmPlate) + '"></div>' +
      '<table class="grid cyan gap"><colgroup><col class="c-date"><col><col class="c-km"><col class="noprint c-rm"></colgroup>' +
      '<thead><tr><th class="t-c">' + esc(f.colDate) + '</th><th>' + esc(f.kmDest) + '</th><th class="t-c">' + esc(f.kmCol) + '</th><th class="noprint c-rm"></th></tr></thead>' +
      '<tbody>' + body + '</tbody></table>' + addBtn('km') +
      '<div class="km-sums">' +
      '<div class="km-row"><span>' + esc(f.kmSum) + '</span><span></span><output class="box" id="km-sum"></output><span></span></div>' +
      '<div class="km-row"><span>' + esc(f.kmEur) + '</span><span class="rate">× ' + esc(fmtEur(KM_RATE)) + '</span><output class="eur" id="km-eur"></output><em>' + esc(f.kmLa) + '</em></div>' +
      '<div class="km-row strong"><span>' + esc(f.spTotal) + '</span><span></span><output class="eur" id="tot"></output><span></span></div>' +
      '</div>' + signBlock(true);
  }

  function paperEigen() {
    var f = T().f;
    var body = state.eigen.map(function (r, i) {
      return '<tr class="r-eigen"><td data-c="date" data-label="' + esc(f.colDate) + '">' + cell('eigen', i, 'date', 'date', r.date, f.colDate) + '</td>' +
        '<td data-c="text" data-label="' + esc(f.eiCol) + '">' + cell('eigen', i, 'text', 'text', r.text, f.eiCol) + '</td>' +
        '<td data-c="amount" data-label="' + esc(f.colAmount) + '">' + cell('eigen', i, 'amount', 'text', r.amount, f.colAmount, 'num') + '</td>' + rmCell('eigen', i) + '</tr>';
    }).join('');
    var img = state.sig ? '<img src="' + esc(state.sig) + '" alt="">' : '';
    return '<h2 class="p-title">' + esc(f.eiTitle) + '</h2>' +
      '<div class="p-meta">' +
      '<label class="line"><span>' + esc(f.name) + '</span><input type="text" id="f-name" data-k="name" autocomplete="name" value="' + esc(state.name) + '"></label>' +
      '<label class="line"><span>' + esc(f.occasion) + '</span><input type="text" id="f-occasion" data-k="occasion" value="' + esc(state.occasion) + '"></label>' +
      '</div>' +
      '<table class="grid eb"><colgroup><col class="c-date"><col><col class="c-amt"><col class="noprint c-rm"></colgroup>' +
      '<thead><tr><th>' + esc(f.colDate) + '</th><th>' + esc(f.eiCol) + '</th><th class="t-r">€</th><th class="noprint c-rm"></th></tr></thead>' +
      '<tbody>' + body + '</tbody>' +
      '<tfoot><tr><td class="tl" colspan="2">' + esc(f.eiTotal) + '</td><td class="sum"><output id="tot"></output></td><td class="noprint"></td></tr></tfoot></table>' +
      addBtn('eigen') +
      '<div class="p-sign eb-sign">' +
      '<div class="sg sg-city"><div class="sg-top"><input type="text" id="f-city" data-k="city" value="' + esc(state.city) + '" aria-label="' + esc(f.eiPlace) + '"></div><div class="sg-line"></div><span>' + esc(f.eiPlace) + '</span></div>' +
      '<div class="sg sg-date"><div class="sg-top"><input type="date" id="f-date" data-k="date" value="' + esc(state.date) + '" aria-label="' + esc(f.eiDate) + '"></div><div class="sg-line"></div><span>' + esc(f.eiDate) + '</span></div>' +
      '<div class="sg sg-sig"><div class="sg-top">' + img + '</div><div class="sg-line"></div><span>' + esc(f.eiSign) + '</span></div></div>';
  }

  function renderPaper() {
    var build = { spesen: paperSpesen, beleg: paperBeleg, km: paperKm, eigen: paperEigen };
    paperEl.innerHTML = build[state.type]();
    calc();
  }

  /* ---------- Berechnung ---------- */
  function calc() {
    if (state.type === 'spesen') {
      state.meal.forEach(function (r, i) {
        var o = paperEl.querySelector('[data-hours="' + i + '"]');
        var h = hours(r.from, r.to);
        if (o) o.textContent = h === '' ? '' : fmtNum(h, 1);
      });
      var s1 = sum(state.meal, 'amount'), s2 = sum(state.other, 'amount');
      setOut('sum-meal', fmtEur(s1));
      setOut('tot', fmtEur(Math.round((s1 + s2) * 100) / 100));
    } else if (state.type === 'beleg') {
      setOut('tot', fmtEur(sum(state.beleg, 'amount')));
    } else if (state.type === 'eigen') {
      setOut('tot', fmtEur(sum(state.eigen, 'amount')));
    } else {
      var km = sum(state.km, 'km');
      var eur = Math.round(km * KM_RATE * 100) / 100;
      setOut('km-sum', fmtNum(km, 1) + ' ' + T().f.kmUnit);
      setOut('km-eur', fmtEur(eur));
      setOut('tot', fmtEur(eur));
    }
  }

  /* ---------- Auswahl und Texte ---------- */
  function renderChoices() {
    var ui = T().ui;
    $('#choice-lang').innerHTML = Object.keys(LANG_NAMES).map(function (l) {
      return '<label><input type="radio" name="lang" value="' + l + '"' + (state.lang === l ? ' checked' : '') +
        '><span class="opt">' + esc(LANG_NAMES[l]) + '</span></label>';
    }).join('');
    $('#choice-type').innerHTML = TYPES.map(function (t) {
      var orig = I18N.de.ui.t[t];
      var sub = state.lang !== 'de' ? '<small>' + esc(orig) + '</small>' : '';
      return '<label><input type="radio" name="type" value="' + t + '"' + (state.type === t ? ' checked' : '') +
        '><span class="opt">' + esc(ui.t[t]) + sub + '</span></label>';
    }).join('');
  }
  function applyChrome() {
    var ui = T().ui;
    document.documentElement.lang = state.lang;
    document.title = ui.appTitle;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (ui[key] != null) el.textContent = ui[key];
    });
    $('#pad').setAttribute('aria-label', ui.fSignature);
  }

  /* ---------- Prüfung vor dem Sichern ---------- */
  function updateStatus() {
    var ui = T().ui, miss = [];
    if (!state.name.trim()) miss.push(ui.fName);
    if (!state.occasion.trim()) miss.push(ui.fOccasion);
    if (!state.sig) miss.push(ui.fSignature);
    $('#btn-pdf').disabled = miss.length > 0;
    $('#btn-json').disabled = miss.length > 0;
    var st = $('#status');
    st.className = 'status' + (miss.length ? '' : ' ok');
    st.textContent = miss.length ? ui.missing + miss.join(', ') : (dl ? ui.readyFile : ui.ready);
  }
  function setStatus(text, ok) {
    var st = $('#status');
    st.className = 'status' + (ok ? ' ok' : '');
    st.textContent = text;
  }

  function renderAll() {
    renderChoices();
    applyChrome();
    renderPaper();
    updateStatus();
  }

  /* ---------- Ereignisse ---------- */
  paperEl.addEventListener('input', function (e) {
    var el = e.target, k = el.dataset.k;
    if (!k) return;
    var v = el.value;
    if (el.dataset.i !== undefined) state[k][+el.dataset.i][el.dataset.f] = v;
    else if (k === 'hosp') state.hosp[el.dataset.t][el.dataset.f] = v;
    else state[k] = v;
    calc();
    updateStatus();
  });
  paperEl.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var add = btn.getAttribute('data-add'), rm = btn.getAttribute('data-rm');
    if (add && state[add].length < LIMITS[add]) {
      state[add].push(BLANK[add]());
      renderPaper();
    } else if (rm && state[rm].length > 1) {
      state[rm].splice(+btn.getAttribute('data-i'), 1);
      renderPaper();
    }
  });
  $('#choice-lang').addEventListener('change', function (e) {
    if (LANG_NAMES[e.target.value]) { state.lang = e.target.value; renderAll(); }
  });
  $('#choice-type').addEventListener('change', function (e) {
    if (TYPES.indexOf(e.target.value) > -1) { state.type = e.target.value; renderAll(); }
  });

  /* ---------- Unterschrift ---------- */
  var pad = $('#pad'), ctx = pad.getContext('2d');
  ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#111';
  var drawing = false, last = null, moved = false;

  function padPos(e) {
    var r = pad.getBoundingClientRect();
    return { x: (e.clientX - r.left) * pad.width / r.width, y: (e.clientY - r.top) * pad.height / r.height };
  }
  pad.addEventListener('pointerdown', function (e) {
    drawing = true; moved = false; last = padPos(e);
    pad.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  pad.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    var p = padPos(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last = p; moved = true;
  });
  function endStroke() {
    if (!drawing) return;
    drawing = false;
    if (moved) {
      state.sig = pad.toDataURL('image/png');
      renderPaper();
      updateStatus();
    }
  }
  pad.addEventListener('pointerup', endStroke);
  pad.addEventListener('pointercancel', endStroke);
  $('#clear-sig').addEventListener('click', function () {
    ctx.clearRect(0, 0, pad.width, pad.height);
    state.sig = null;
    renderPaper();
    updateStatus();
  });
  function drawSigFromState() {
    ctx.clearRect(0, 0, pad.width, pad.height);
    if (!state.sig) return;
    var img = new Image();
    img.onload = function () { ctx.drawImage(img, 0, 0, pad.width, pad.height); };
    img.src = state.sig;
  }

  /* ---------- Sichern: PDF-Auszug (Druckdialog) und Datei ---------- */
  function slug(s) {
    return s.trim().replace(/[^\p{L}\p{N}-]+/gu, '_').replace(/^_+|_+$/g, '').slice(0, 40);
  }
  function fileBase() {
    var parts = [FILE_NAMES[state.type]];
    var n = slug(state.name);
    if (n) parts.push(n);
    parts.push(state.date || localToday());
    return parts.join('_');
  }

  function saveViaCapability(filename, data) {
    dl.save({ filename: filename, data: data }).then(function () {
      setStatus(T().ui.saved, true);
    }).catch(function (err) {
      if (err && err.code === 'declined') return;
      setStatus(T().ui.saveErr, false);
    });
  }

  /* Eigenständige HTML-Datei mit dem ausgefüllten Formular, die sich im Browser als PDF drucken lässt. */
  function printReadyHtml() {
    var live = paperEl.querySelectorAll('input');
    var copy = paperEl.cloneNode(true);
    copy.querySelectorAll('input').forEach(function (inp, i) {
      var src = live[i];
      if (inp.type === 'radio' || inp.type === 'checkbox') {
        if (src.checked) inp.setAttribute('checked', ''); else inp.removeAttribute('checked');
      } else {
        inp.setAttribute('value', src.value);
      }
    });
    copy.querySelectorAll('.noprint').forEach(function (n) { n.remove(); });
    var css = Array.prototype.map.call(document.querySelectorAll('style'), function (s) { return s.textContent; }).join('\n');
    return '<!doctype html><html lang="' + state.lang + '"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(fileBase()) + '</title>' +
      '<style>' + css + '</style></head><body><main class="app"><section class="step"><div class="paper-scroll">' +
      copy.outerHTML + '</div></section></main></body></html>';
  }

  $('#btn-pdf').addEventListener('click', function () {
    if (dl) { saveViaCapability(fileBase() + '.html', printReadyHtml()); return; }
    var prev = document.title;
    document.title = fileBase();
    var restore = function () { document.title = prev; };
    window.addEventListener('afterprint', restore, { once: true });
    window.print();
  });

  $('#btn-json').addEventListener('click', function () {
    var data = {
      version: 1, lang: state.lang, type: state.type,
      name: state.name, occasion: state.occasion, city: state.city, date: state.date, plate: state.plate,
      meal: state.meal, other: state.other, beleg: state.beleg, km: state.km, eigen: state.eigen,
      hosp: state.hosp, sig: state.sig
    };
    var json = JSON.stringify(data, null, 2);
    if (dl) { saveViaCapability(fileBase() + '.json', json); return; }
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = fileBase() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  function str(v) { return typeof v === 'string' ? v.slice(0, 500) : ''; }
  function applyLoaded(d) {
    if (!d || typeof d !== 'object') throw new Error('invalid');
    if (LANG_NAMES[d.lang]) state.lang = d.lang;
    if (TYPES.indexOf(d.type) > -1) state.type = d.type;
    ['name', 'occasion', 'city', 'date', 'plate'].forEach(function (k) { state[k] = str(d[k]); });
    Object.keys(LIMITS).forEach(function (k) {
      if (!Array.isArray(d[k])) return;
      var rows = d[k].slice(0, LIMITS[k]).map(function (r) {
        var b = BLANK[k]();
        Object.keys(b).forEach(function (f) { b[f] = str(r && r[f]); });
        return b;
      });
      state[k] = rows.length ? rows : [BLANK[k]()];
    });
    ['spesen', 'beleg'].forEach(function (t) {
      var h = d.hosp && d.hosp[t];
      if (!h) return;
      ['b', 'l', 'd'].forEach(function (c) { state.hosp[t][c] = str(h[c]); });
      state.hosp[t].mode = h.mode === 'offset' || h.mode === 'tax' ? h.mode : '';
    });
    state.sig = typeof d.sig === 'string' && SIG_RE.test(d.sig) ? d.sig : null;
  }
  $('#file-load').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        applyLoaded(JSON.parse(String(reader.result)));
        renderAll();
        drawSigFromState();
        setStatus(T().ui.loadOk, true);
      } catch (err) {
        setStatus(T().ui.loadErr, false);
      }
    };
    reader.onerror = function () { setStatus(T().ui.loadErr, false); };
    reader.readAsText(file);
    e.target.value = '';
  });

  renderAll();

  if (window.claude && typeof window.claude.use === 'function') {
    window.claude.use('downloads').then(function (d) {
      if (!d) return;
      dl = d;
      $('#btn-pdf').setAttribute('data-i18n', 'btnPdfAlt');
      applyChrome();
      updateStatus();
    }).catch(function () {});
  }

  /* App-Modus: speichert nur die eigenen Programmdateien, damit die Seite auch ohne Netz startet. */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
