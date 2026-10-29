// مبادرة السعودية خط أحمر — المادة 34
// الصقي هذا الكود في: Google Sheets > الإضافات (Extensions) > Apps Script

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName('الأسماء');
  if (!s) { s = ss.insertSheet('الأسماء'); s.appendRow(['الوقت', 'النوع', 'الاسم', 'الصف', 'id']); }
  return s;
}

function norm_(s) {
  return String(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, '');
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const s = sheet_();
  if (p.action === 'add') {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const n = String(p.n || '').trim().replace(/\s+/g, ' ').slice(0, 40).replace(/^[=+\-@]+/, '');
      const type = p.r === 't' ? 'منسوبة' : 'طالبة';
      const c = p.r === 't' ? '' : String(p.c || '').slice(0, 20);
      if (n.length >= 2) {
        const rows = s.getDataRange().getValues().slice(1);
        const dup = rows.some(x => x[1] === type && norm_(x[2]) === norm_(n) && String(x[3]) === c);
        if (!dup) s.appendRow([new Date(), type, n, c, Utilities.getUuid()]);
      }
    } finally {
      lock.releaseLock();
    }
  }
  const rows = s.getDataRange().getValues().slice(1);
  const out = { teachers: [], students: [] };
  rows.forEach(x => {
    if (!x[2]) return;
    if (x[1] === 'منسوبة') out.teachers.push({ id: String(x[4]), n: String(x[2]) });
    else out.students.push({ id: String(x[4]), n: String(x[2]), c: String(x[3]) });
  });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
