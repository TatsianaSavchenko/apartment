let lang = "ru";
let selected = null;
let calendar = null;
let bookedDays = new Set();

const $ = (id) => document.getElementById(id);

function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){
  const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function parseISO(s){ const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); }

function fmtMoney(n){ return `${Math.round(n)} ${CURRENCY}`.trim(); }

function isWeekend(date){ const wd=date.getDay(); return wd===0||wd===6; }
function getPriceForDay(dayISO){
  const override = PRICE_OVERRIDES[dayISO];
  let p = override != null ? override : DEFAULT_PRICE;
  if (override == null && WEEKEND_MULTIPLIER !== 1 && isWeekend(parseISO(dayISO))) p *= WEEKEND_MULTIPLIER;
  return p;
}
function computeStay(startISO, endISO){
  const s=parseISO(startISO), e=parseISO(endISO);
  const nights=Math.max(0, Math.round((e-s)/(1000*60*60*24)));
  let total=0;
  for(let i=0;i<nights;i++) total += getPriceForDay(iso(addDays(s,i)));
  return {nights,total};
}
function selectionText(){
  const total=fmtMoney(selected.total);
  return (lang==="ru")
    ? `Даты: ${selected.startISO} → ${selected.endISO} (выезд) • Ночей: ${selected.nights} • Итого: ${total}`
    : `Dates: ${selected.startISO} → ${selected.endISO} (check-out) • Nights: ${selected.nights} • Total: ${total}`;
}

function messengerLinks(){
  $("tgLink").href = `https://t.me/${TELEGRAM_USERNAME}`;
  $("waLink").href = `https://wa.me/${WHATSAPP_PHONE}`;
}

function renderText(){
  const t=CONTENT[lang];
  $("t_title").textContent=t.title;
  $("t_sub").textContent=t.sub;
  $("t_about").textContent=t.about;
  $("t_photos").textContent=t.photos;
  $("t_photos_hint").textContent=t.photosHint;
  $("t_calendar").textContent=t.calendar;
  $("t_free").textContent=t.free;
  $("t_booked").textContent=t.booked;
  $("t_note").textContent=t.note;
  $("btnBook").textContent=t.bookBtn;
  $("btnClear").textContent=t.clearBtn;

  $("t_badges").innerHTML="";
  t.badges.forEach(b=>{ const el=document.createElement("span"); el.className="badge"; el.textContent=b; $("t_badges").appendChild(el); });

  $("t_desc").textContent=t.desc;
  $("t_rules").textContent=t.rulesTitle;

  $("t_rules_list").innerHTML="";
  t.rules.forEach(r=>{ const li=document.createElement("li"); li.textContent=r; $("t_rules_list").appendChild(li); });
}

function renderGallery(){
  const g=$("gallery");
  g.innerHTML="";
  if(!PHOTOS.length){
    for(let i=0;i<3;i++){
      const ph=document.createElement("div");
      ph.className="ph";
      ph.textContent = (lang==="ru") ? "Фото скоро будет" : "Photo coming soon";
      g.appendChild(ph);
    }
    return;
  }
  PHOTOS.forEach(src=>{
    const ph=document.createElement("div");
    ph.className="ph";
    const img=document.createElement("img");
    img.src=src; img.alt="Apartment photo";
    ph.appendChild(img);
    g.appendChild(ph);
  });
}

function rebuildBookedDays(eventApis){
  bookedDays = new Set();
  for(const e of eventApis){
    if(!e.start) continue;
    const s = startOfDay(e.start);
    const end = e.end ? startOfDay(e.end) : addDays(s,1); // exclusive
    let d = new Date(s);
    while(d < end){
      bookedDays.add(iso(d));
      d = addDays(d,1);
    }
  }
}

function isPastDay(date){
  return startOfDay(date) < startOfDay(new Date());
}

function rangeHasBooked(start, endExclusive){
  let d = startOfDay(start);
  const end = startOfDay(endExclusive);
  while(d < end){
    if(bookedDays.has(iso(d))) return true;
    d = addDays(d,1);
  }
  return false;
}

function initCalendar(){
  const el=$("calendar");
  const today=startOfDay(new Date());

  calendar = new FullCalendar.Calendar(el, {
    initialView:"dayGridMonth",
    height:"auto",
    firstDay:1,
    selectable:true,
    selectMirror:true,
    locale: (lang==="ru") ? "ru" : "en-gb",
    validRange: { start: today },

    googleCalendarApiKey: GOOGLE_API_KEY,
    events: { googleCalendarId: GOOGLE_CALENDAR_ID },

    eventDataTransform: (eventData) => ({
      title:"",
      start:eventData.start,
      end:eventData.end,
      allDay:true,
      display:"background",
      classNames:["booked-bg"]
    }),

    eventsSet: (eventApis) => {
      rebuildBookedDays(eventApis);
      calendar.updateSize();
    },

    selectAllow: (sel) => {
      if(isPastDay(sel.start)) return false;
      if(rangeHasBooked(sel.start, sel.end)) return false;
      return true;
    },

    dayCellDidMount: (arg) => {
      const dISO = iso(arg.date);
      arg.el.classList.toggle("is-booked", bookedDays.has(dISO));
      arg.el.classList.toggle("is-past", isPastDay(arg.date));
    },

    dayCellContent: (arg) => {
      const container=document.createElement("div");

      const num=document.createElement("div");
      num.textContent=arg.dayNumberText;
      num.style.opacity="0.9";

      const dISO=iso(arg.date);
      const label=document.createElement("div");
      label.className="dayPrice";

      if(bookedDays.has(dISO)){
        label.classList.add("dayBookedLabel");
        label.textContent = (lang==="ru") ? "ЗАНЯТО" : "BOOKED";
      } else if(isPastDay(arg.date)){
        label.classList.add("dayPastLabel");
        label.textContent = "";
      } else {
        const price=getPriceForDay(dISO);
        label.textContent = price ? `${Math.round(price)}${CURRENCY}` : "";
      }

      container.appendChild(num);
      container.appendChild(label);
      return { domNodes:[container] };
    },

    select: (info) => {
      if(isPastDay(info.start) || rangeHasBooked(info.start, info.end)){
        calendar.unselect();
        clearSelection();
        return;
      }
      const startISO=info.startStr.slice(0,10);
      const endISO=info.endStr.slice(0,10);
      const {nights,total}=computeStay(startISO,endISO);
      selected={startISO,endISO,nights,total};
      $("selectionInfo").textContent=selectionText();
      $("btnBook").disabled = !(nights>0);
    }
  });

  calendar.render();
}

function openMessengerChooser(){
  const t=CONTENT[lang];
  const total=fmtMoney(selected.total);
  const msg=encodeURIComponent(t.msgTemplate({
    start:selected.startISO, end:selected.endISO, nights:selected.nights, total
  }));
  const tgUrl=`https://t.me/${TELEGRAM_USERNAME}?text=${msg}`;
  const waUrl=`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;

  const useTg = confirm(lang==="ru" ? "Открыть Telegram? (Отмена = WhatsApp)" : "Open Telegram? (Cancel = WhatsApp)");
  window.open(useTg ? tgUrl : waUrl, "_blank", "noopener");
}

function clearSelection(){
  selected=null;
  $("selectionInfo").textContent=CONTENT[lang].chooseDates;
  $("btnBook").disabled=true;
  if(calendar) calendar.unselect();
}

function init(){
  messengerLinks();
  renderText();
  renderGallery();
  $("selectionInfo").textContent=CONTENT[lang].chooseDates;

  $("btnRU").onclick=()=>{ lang="ru"; setLang("ru"); };
  $("btnEN").onclick=()=>{ lang="en"; setLang("en"); };
  $("btnClear").onclick=()=>clearSelection();
  $("btnBook").onclick=()=>selected && openMessengerChooser();

  initCalendar();
}

init();
