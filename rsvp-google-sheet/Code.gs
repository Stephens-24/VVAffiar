/**
 * Vincent & Vida — RSVP to Google Sheet
 *
 * SETUP (one time, about 3 minutes):
 *  1. Open the RSVP sheet:
 *     https://docs.google.com/spreadsheets/d/13YX4SQZSFdKTL1yXZNWCuw1jPNYeNkAvEIFxL922uMA/edit
 *  2. Extensions > Apps Script. Delete what's there and paste this whole file. Save.
 *  3. Deploy > New deployment > type "Web app".
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     Click Deploy and allow the permissions it asks for (it only needs this spreadsheet).
 *  4. Copy the "Web app URL" (ends in /exec) and paste it into index.html:
 *       const RSVP_ENDPOINT = "https://script.google.com/macros/s/…/exec";
 *
 * If you edit this script later: Deploy > Manage deployments > edit (pencil) >
 * Version "New version" > Deploy. The URL stays the same.
 *
 * Columns: uses the first tab. If row 1 is empty it adds the headers below.
 * If you already typed your own headers, values go under the matching ones
 * (e.g. "Full name", "Number of guests"), and any missing column is added at the end.
 */

const SPREADSHEET_ID = '13YX4SQZSFdKTL1yXZNWCuw1jPNYeNkAvEIFxL922uMA';
const SHEET_NAME = ''; // leave blank to use the first tab, or type a tab name, e.g. 'RSVPs'

// [header to create, field key, other header names that count as a match]
const COLUMNS = [
  ['Timestamp', 'timestamp', ['date', 'submitted', 'submitted at', 'time']],
  ['Name', 'name', ['full name', 'guest name', 'guest']],
  ['Email', 'email', ['email address', 'e-mail']],
  ['Attending', 'attending', ['rsvp', 'attendance', 'will attend', 'coming', 'response']],
  ['Guests', 'guests', ['number of guests', 'guest count', 'no. of guests', 'party size', 'count']],
  ['Message', 'message', ['note', 'notes', 'message for the couple', 'comment', 'comments']],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // two guests submitting at once won't overwrite each other
  try {
    const p = (e && e.parameter) || {};
    const name = clean(p.name);
    if (!name) return json({ ok: false, error: 'Name is required' });

    const attending = p.attending === 'no' ? 'No' : 'Yes';
    const values = {
      timestamp: new Date(),
      name: name,
      email: clean(p.email),
      attending: attending,
      guests: attending === 'No' ? 0 : Math.min(Math.max(parseInt(p.guests, 10) || 1, 1), 20),
      message: clean(p.message),
    };

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0];
    const headers = ensureHeaders(sheet);

    const row = headers.map(h => {
      const col = findColumn(h);
      return col ? values[col[1]] : '';
    });
    sheet.appendRow(row);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the /exec URL in a browser shows this, so you can check it's live.
function doGet() {
  return json({ ok: true, message: 'Vincent & Vida RSVP endpoint is running.' });
}

function ensureHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  let headers = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String) : [];

  if (!headers.some(h => h.trim())) {
    headers = COLUMNS.map(c => c[0]);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return headers;
  }
  COLUMNS.forEach(col => {
    if (!headers.some(h => matches(h, col))) {
      headers.push(col[0]);
      sheet.getRange(1, headers.length).setValue(col[0]).setFontWeight('bold');
    }
  });
  return headers;
}

function findColumn(header) {
  return COLUMNS.find(col => matches(header, col));
}

function matches(header, col) {
  const h = String(header).trim().toLowerCase();
  return h === col[0].toLowerCase() || col[2].indexOf(h) !== -1;
}

// Trim, cap length, and stop text like "=SUM(...)" being run as a formula.
function clean(value) {
  const v = String(value || '').trim().slice(0, 1000);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
