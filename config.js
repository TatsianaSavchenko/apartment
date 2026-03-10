// ==== 1) МЕССЕНДЖЕРЫ (обязательно) ====
const TELEGRAM_USERNAME = "tonysav25";   // без @
const WHATSAPP_PHONE    = "995599688762";    // международный формат, без +

/*
 ==== 2) GOOGLE CALENDAR (обязательно) ====
 1) Calendar ID берётся в настройках календаря → Integrate calendar
 2) Google API key создаётся в Google Cloud Console (Calendar API включён)
*/
const GOOGLE_CALENDAR_ID  = "0a9238557de26079877d12349a61289eca0a9714d5b562dabe27bbedd80c7212@group.calendar.google.com";
const GOOGLE_API_KEY      = "AIzaSyB1oewwTojkoc38vKmAfMNufL9lm2fhyTU";

// ==== 3) ЦЕНЫ (опционально) ====
const CURRENCY = "₾";
const DEFAULT_PRICE = 100;
const WEEKEND_MULTIPLIER = 1.2; // 1.0 если не нужно
const PRICE_OVERRIDES = {
  // "2026-03-08": 240,
};

// ==== 4) ТЕКСТЫ (RU / EN) ====
const CONTENT = {
  ru: {
    title: "Квартира у моря в Батуми",
    sub: "Выберите даты в календаре → отправьте заявку в Telegram или WhatsApp",
    about: "О квартире",
    photos: "Фото",
    calendar: "Календарь",
    free: "свободно",
    booked: "занято",
    note: "Оплата на сайте не производится. Это предбронь: подтверждение и детали — в мессенджере. Оплата наличными на месте.",
    bookBtn: "Забронировать",
    clearBtn: "Сбросить",
    chooseDates: "Выберите даты в календаре — и тут появится итог.",
    rulesTitle: "Условия",
    badges: ["👤 до 3 гостей", "🔑 Квартира-студия", "🛏 1 кровать и 🛋 1 раскладывающийся диван  ", "9️⃣ этаж", "📶 Wi-Fi", "❄️ кондиционер"],
    desc: "ул. Шериф Химшиашвили 15G, Батуми, всего 3 минуты пешком до моря. Балкон с видом на море. В квартире: кухня с посудой, большим холодильником и микроволновкой, двуспальная кровать, раскладывающийся диван, кондиционер, Wi-Fi, Smart TV, ванная комната с ванной и сушильно-стиральной машиной",
    rules: ["Заезд: 14:00", "Выезд: 12:00", "Предоплата за 1 сутки"],
    msgTemplate: ({start, end, nights, total}) =>
      `Здравствуйте! Хочу забронировать квартиру.\nДаты: ${start} → ${end} (выезд)\nНочей: ${nights}\nИтого: ${total}\n`
  },
  en: {
    title: "Sea View Apartment in Batumi",
    sub: "Pick dates in the calendar → send a pre-booking request via messenger.",
    about: "About the apartment",
    photos: "Photos",
    calendar: "Calendar",
    free: "available",
    booked: "booked",
    note: "No online payments. This is a pre-booking request: details/confirmation via messenger. Cash on arrival.",
    bookBtn: "Book",
    clearBtn: "Clear",
    chooseDates: "Select dates in the calendar — summary will appear here.",
    rulesTitle: "Rules",
    badges: ["👤 up to 3 guests", "🛏 1 bedroom", "9️⃣ floor", "📶 Wi-Fi", "❄️ A/C"],
    desc: "Cozy apartment located at 15G Sherif Khimshiashvili St. in Batumi, just a 3-minute walk to the beach. Balcony with sea view. The apartment includes a kitchen with a large refrigerator and microwave, one double bed, a sofa bed, air conditioning, Wi-Fi, Smart TV, bathroom with bathtub, and washing machine.",
    rules: ["Check-in: 14:00", "Check-out: 12:00", "Deposit is required for 1 night"],
    msgTemplate: ({start, end, nights, total}) =>
      `Hello! I'd like to book the apartment.\nDates: ${start} → ${end} (check-out)\nNights: ${nights}\nTotal: ${total}\n`
  }
};

// ==== 5) ФОТО (можно позже) ====
// Потом просто загрузишь фото в папку /photos и перечислишь тут:
const PHOTOS = [
  "photos/1.jpg",
  "photos/2.jpg",
  "photos/3.jpg",
 "photos/4.jpg",
 "photos/5.jpg",
 "photos/6.jpg",
 "photos/7.jpg",
];






