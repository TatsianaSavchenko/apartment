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
    calendar.rerenderDates();
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
  const override = PRICE_OVERRIDES[dayISO];
  let p = override != null ? override : DEFAULT_PRICE;
  if (override == null && WEEKEND_MULTIPLIER !== 1 && isWeekend(parseISO(dayISO))) {
    p = p * WEEKEND_MULTIPLIER;
  }
  return p;
}
function computeStay(startISO, endISOExclusive) {
  const start = parseISO(startISO);
  const end = parseISO(endISOExclusive);
  const nights = Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  let total = 0;
  for (let i = 0; i < nights; i++) total += getPriceForDay(iso(addDays(start, i)));
  return { nights, total };
}

function selectionText() {
  const total = fmtMoney(selected.total);
  if (lang === "ru") {
    return `Даты: ${selected.startISO} → ${selected.endISO} (выезд) • Ночей: ${selected.nights} • Итого: ${total}`;
  }
  return `Dates: ${selected.startISO} → ${selected.endISO} (check-out) • Nights: ${selected.nights} • Total: ${total}`;
}

function messengerLinks() {
  $("tgLink").href = `https://t.me/${TELEGRAM_USERNAME}`;
  $("waLink").href = `https://wa.me/${WHATSAPP_PHONE}`;
}

function renderText() {
  const t = CONTENT[lang];
  $("t_title").textContent = t.title;
  $("t_sub").textContent = t.sub;
  $("t_about").textContent = t.about;
  $("t_photos").textContent = t.photos;
  $("t_photos_hint").textContent = t.photosHint;
  $("t_calendar").textContent = t.calendar;
  $("t_free").textContent = t.free;
  $("t_booked").textContent = t.booked;
  $("t_note").textContent = t.note;
  $("btnBook").textContent = t.bookBtn;
  $("btnClear").textContent = t.clearBtn;

  $("t_badges").innerHTML = "";
  t.badges.forEach((b) => {
    const el = document.createElement("span");
    el.className = "badge";
    el.textContent = b;
    $("t_badges").appendChild(el);
  });

  $("t_desc").textContent = t.desc;

  $("t_rules").textContent = t.rulesTitle;
  $("t_rules_list").innerHTML = "";
  t.rules.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    $("t_rules_list").appendChild(li);
  });
}

function renderGallery() {
  const g = $("gallery");
  g.innerHTML = "";
  if (!PHOTOS.length) {
    for (let i = 0; i < 3; i++) {
      const ph = document.createElement("div");
      ph.className = "ph";
      ph.textContent = lang === "ru" ? "Фото скоро будет" : "Photo coming soon";
      g.appendChild(ph);
    }
    return;
  }
  PHOTOS.forEach((src) => {
    const ph = document.createElement("div");
    ph.className = "ph";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Apartment photo";
    ph.appendChild(img);
    g.appendChild(ph);
  });
}

function isPastDay(date) {
  return startOfDay(date) < startOfDay(new Date());
}

function rebuildBookedDaysFromEvents(events) {
  bookedDays = new Set();

  for (const e of events) {
    // e is EventApi
    const s = e.start ? startOfDay(e.start) : null;
    if (!s) continue;

    const endRaw = e.end ? startOfDay(e.end) : addDays(s, 1); // end exclusive
    let d = new Date(s);

    while (d < endRaw) {
      bookedDays.add(iso(d));
      d = addDays(d, 1);
    }
  }
}

function rangeHasBooked(startDate, endExclusive) {
  let d = startOfDay(startDate);
  const end = startOfDay(endExclusive);
  while (d < end) {
    if (bookedDays.has(iso(d))) return true;
    d = addDays(d, 1);
  }
  return false;
}

function initCalendar() {
  const el = $("calendar");

  calendar = new FullCalendar.Calendar(el, {
    initialView: "dayGridMonth",
    height: "auto",
    firstDay: 1,
    selectable: true,
    selectMirror: true,
    locale: lang === "ru" ? "ru" : "en-gb",

    // вот это и делает “прошлое недоступным” и выключает кнопку Prev, если уйдёшь в прошлое
    validRange: { start: startOfDay(new Date()) },

    googleCalendarApiKey: GOOGLE_API_KEY,
    events: { googleCalendarId: GOOGLE_CALENDAR_ID },

    // Делаем события фоном (и без текста), чтобы:
    // 1) не было полосок “Booked”
    // 2) диапазон "занято" был корректным
    eventDataTransform: function (eventData) {
      return {
        title: "",
        start: eventData.start,
        end: eventData.end,
        allDay: true,
        display: "background",
        classNames: ["booked-bg"]
      };
    },

    // Когда события обновились/подгрузились — пересобираем bookedDays и перерисовываем сетку
    eventsSet: function (events) {
      rebuildBookedDaysFromEvents(events);
      calendar.rerenderDates();
    },

    // запрет выбора: прошлое + пересечение с booked
    selectAllow: function (selectInfo) {
      if (isPastDay(selectInfo.start)) return false;
      if (rangeHasBooked(selectInfo.start, selectInfo.end)) return false;
      return true;
    },

    dayCellDidMount: function (arg) {
      const dayISO = iso(arg.date);
      arg.el.classList.toggle("is-booked", bookedDays.has(dayISO));
      arg.el.classList.toggle("is-past", isPastDay(arg.date));
    },

    dayCellContent: function (arg) {
      const container = document.createElement("div");

      const num = document.createElement("div");
      num.textContent = arg.dayNumberText;
      num.style.opacity = "0.9";

      const dayISO = iso(arg.date);

      const label = document.createElement("div");
      label.className = "dayPrice";

      if (bookedDays.has(dayISO)) {
        label.classList.add("dayBookedLabel");
        label.textContent = (lang === "ru") ? "ЗАНЯТО" : "BOOKED";
      } else if (isPastDay(arg.date)) {
        label.classList.add("dayPastLabel");
        label.textContent = "";
      } else {
        const price = getPriceForDay(dayISO);
        label.textContent = price ? `${Math.round(price)}${CURRENCY}` : "";
      }

      container.appendChild(num);
      container.appendChild(label);
      return { domNodes: [container] };
    },

    select: function (info) {
      if (isPastDay(info.start) || rangeHasBooked(info.start, info.end)) {
        calendar.unselect();
        clearSelection();
        return;
      }

      const startISO = info.startStr.slice(0, 10);
      const endISO = info.endStr.slice(0, 10);
      const { nights, total } = computeStay(startISO, endISO);

      selected = { startISO, endISO, nights, total };
      $("selectionInfo").textContent = selectionText();
      $("btnBook").disabled = !(nights > 0);
    }
  });

  calendar.render();
}

function buildMessage() {
  const t = CONTENT[lang];
  const total = fmtMoney(selected.total);
  return t.msgTemplate({
    start: selected.startISO,
    end: selected.endISO,
    nights: selected.nights,
    total
  });
}

function openMessengerChooser() {
  const msg = encodeURIComponent(buildMessage());
  const tgUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${msg}`;
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;

  const useTg = confirm(
    lang === "ru"
      ? "Открыть Telegram? (Отмена = WhatsApp)"
      : "Open Telegram? (Cancel = WhatsApp)"
  );

  window.open(useTg ? tgUrl : waUrl, "_blank", "noopener");
}

function clearSelection() {
  selected = null;
  $("selectionInfo").textContent = CONTENT[lang].chooseDates;
  $("btnBook").disabled = true;
  if (calendar) calendar.unselect();
}

function init() {
  messengerLinks();
  renderText();
  renderGallery();
  $("selectionInfo").textContent = CONTENT[lang].chooseDates;

  $("btnRU").onclick = () => setLang("ru");
  $("btnEN").onclick = () => setLang("en");
  $("btnClear").onclick = () => clearSelection();
  $("btnBook").onclick = () => selected && openMessengerChooser();

  initCalendar();
}

init();
