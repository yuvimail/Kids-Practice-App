// ── Kids Practice App — Google Apps Script Backend ──────────────────────────
// SETUP INSTRUCTIONS:
//   1. Go to https://script.google.com → New Project
//   2. Delete any existing code, paste this entire file
//   3. Click Save, give project any name (e.g. KidsPractice)
//   4. Click Deploy → New deployment → Web app
//      Execute as: Me  |  Who has access: Anyone
//   5. Click Deploy → Authorize → copy the Web App URL
//   6. Paste that URL into index.html as the SCRIPT_URL value
//
// SHEET TABS CREATED AUTOMATICALLY:
//   records  — one row per attempt
//   users    — one row per user
//   content  — English passages  (columns: grade, month, day_index, json)
//   maths    — Maths questions   (columns: grade, month, day_index, json)
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_RECORDS = 'records';
const SHEET_USERS   = 'users';
const SHEET_CONTENT = 'content';
const SHEET_MATHS   = 'maths';

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers) sh.appendRow(headers);
  }
  return sh;
}

// ── ROUTING ──────────────────────────────────────────────────────────────────
function doGet(e) {
  const a = e.parameter.action;
  if (a === 'getAll')     return respond(getAllData());
  if (a === 'getContent') return respond(getContent(e.parameter.subject, e.parameter.grade, e.parameter.month));
  return respond({ error: 'Unknown action' });
}

function doPost(e) {
  const p = JSON.parse(e.postData.contents);
  if (p.action === 'saveRecord')   return respond(saveRecord(p.record));
  if (p.action === 'saveUsers')    return respond(saveUsers(p.users));
  if (p.action === 'deleteRecord') return respond(deleteRecord(p.student_id, p.date, p.subject));
  if (p.action === 'importAll')    return respond(importAll(p.users, p.records));
  return respond({ error: 'Unknown action' });
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET ALL (users + records) ─────────────────────────────────────────────────
function getAllData() {
  const recRows  = getOrCreateSheet(SHEET_RECORDS, ['json']).getDataRange().getValues();
  const userRows = getOrCreateSheet(SHEET_USERS,   ['json']).getDataRange().getValues();
  return {
    records: recRows.slice(1).map(r => JSON.parse(r[0])),
    users:   userRows.slice(1).map(r => JSON.parse(r[0]))
  };
}

// ── GET CONTENT (passages for one subject/grade/month) ────────────────────────
// Sheet columns: grade | month | day_index | json
function getContent(subject, grade, month) {
  const sheetName = subject === 'maths' ? SHEET_MATHS : SHEET_CONTENT;
  const sh = getOrCreateSheet(sheetName, ['grade','month','day_index','json']);
  const rows = sh.getDataRange().getValues();
  const passages = [];
  rows.slice(1).forEach(r => {
    if (String(r[0]) === String(grade) && String(r[1]).toLowerCase() === String(month).toLowerCase()) {
      passages[parseInt(r[2])] = JSON.parse(r[3]);
    }
  });
  // compact — remove empty slots
  return { passages: passages.filter(p => p !== undefined && p !== null) };
}

// ── SAVE SINGLE RECORD ────────────────────────────────────────────────────────
function saveRecord(record) {
  const sh = getOrCreateSheet(SHEET_RECORDS, ['json']);
  sh.appendRow([JSON.stringify(record)]);
  return { ok: true };
}

// ── SAVE USERS (full replace) ─────────────────────────────────────────────────
function saveUsers(users) {
  const sh = getOrCreateSheet(SHEET_USERS, ['json']);
  sh.clearContents();
  sh.appendRow(['json']);
  users.forEach(u => sh.appendRow([JSON.stringify(u)]));
  return { ok: true };
}

// ── DELETE A RECORD ───────────────────────────────────────────────────────────
function deleteRecord(student_id, date, subject) {
  const sh   = getOrCreateSheet(SHEET_RECORDS, ['json']);
  const rows = sh.getDataRange().getValues();
  for (let i = rows.length - 1; i >= 1; i--) {
    const r = JSON.parse(rows[i][0]);
    if (r.student_id === student_id && r.date === date && r.subject === subject) {
      sh.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: false };
}

// ── IMPORT ALL ────────────────────────────────────────────────────────────────
function importAll(users, records) {
  saveUsers(users);
  const sh = getOrCreateSheet(SHEET_RECORDS, ['json']);
  sh.clearContents();
  sh.appendRow(['json']);
  records.forEach(r => sh.appendRow([JSON.stringify(r)]));
  return { ok: true };
}

// ── CONTENT IMPORT HELPER ─────────────────────────────────────────────────────
// Call this function manually from the Apps Script editor to bulk-load
// all passages from the JS files into the sheet.
// Steps:
//   1. Open the Apps Script editor
//   2. Paste your JS file content into the variable below
//   3. Run importContentFromJS() or importMathsFromJS()
//   4. Check the content / maths sheet tabs — rows will appear

function importContentFromJS() {
  // Paste the full content of content_grade4.js and content_grade7.js here
  // Example — replace with actual data:
  const data = {
    // CONTENT_G4: window.CONTENT_G4 value from content_grade4.js
    // CONTENT_G7: window.CONTENT_G7 value from content_grade7.js
  };
  _bulkImportPassages(SHEET_CONTENT, data);
}

function importMathsFromJS() {
  // Paste the full content of math_grade4.js and math_grade7.js here
  const data = {
    // MATH_G4: window.MATH_G4 value from math_grade4.js
    // MATH_G7: window.MATH_G7 value from math_grade7.js
  };
  _bulkImportPassages(SHEET_MATHS, data);
}

function _bulkImportPassages(sheetName, gradeMap) {
  // gradeMap: { 4: { january:[...], february:[...], ... }, 7: { ... } }
  const sh = getOrCreateSheet(sheetName, ['grade','month','day_index','json']);
  sh.clearContents();
  sh.appendRow(['grade','month','day_index','json']);
  Object.entries(gradeMap).forEach(([grade, months]) => {
    Object.entries(months).forEach(([month, passages]) => {
      passages.forEach((passage, idx) => {
        sh.appendRow([grade, month, idx, JSON.stringify(passage)]);
      });
    });
  });
  Logger.log('Import done for ' + sheetName);
}
