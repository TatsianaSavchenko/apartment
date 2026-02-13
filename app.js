let lang = "ru";
let selected = null; // { startISO, endISO, nights, total }
let calendar = null;

let bookedDays = new Set(); // 'YYYY-MM-DD'

const $ = (id) => document.getElementById(id);

function setLang(next) {
  lang = next;
  renderText();
  renderGallery();
  if (calendar) {
    calendar.setOption("locale", lang === "ru" ? "ru" : "en-gb");
    // Надёжно перерисовать подписи в ячейках:
    // просто обновим источник событий (он вызовет dayCellContent заново при рендере сетки)
    calendar.refetchEvents();
  }
  $("selectionInfo").textContent = selected ? selectionText() : CONTENT[lang].chooseDates;
}

function fmtMoney(n) {
  return `${Math.round(n)} ${CURRENCY}`.trim();
}

function iso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWeekend(date) {
  const wd = date.getDay();
  return wd === 0 || wd === 6;
}
function getPriceForDay(dayISO) {
  const override = PRICE_OVERRIDES_
