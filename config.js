// ==== 1) МЕССЕНДЖЕРЫ (обязательно) ====
const TELEGRAM_USERNAME = "your_telegram";   // без @
const WHATSAPP_PHONE    = "995500000000";    // международный формат, без +

/*
 ==== 2) GOOGLE CALENDAR (обязательно) ====
 1) Calendar ID берётся в настройках календаря → Integrate calendar
 2) Google API key создаётся в Google Cloud Console (Calendar API включён)
*/
const GOOGLE_CALENDAR_ID  = "your_calendar_id@group.calendar.google.com";
const GOOGLE_API_KEY      = "your_google_api_key";

// ==== 3) ЦЕНЫ (опционально) ====
const CURRENCY = "₾";
const DEFAULT_PRICE = 150;
const WEEKEND_MULTIPLIER = 1.2; // 1.0 если не нужно
const PRICE_OVERRIDES = {
  // "2026-03-08": 240,
};

// ==== 4) ТЕКСТЫ (RU / EN) ====
const CONTENT = {
  ru: {
    title: "Квартира для аренды",
    sub: "Выберите даты в календаре → отправьте предбронь в мессенджер.",
    about: "О квартире",
    photos: "Фото",
    photosHint: "Фотографии можно добавить позже — просто загрузишь файлы, и они появятся.",
    calendar: "Календарь",
    free: "свободно",
    booked: "занято",
    note: "Оплата на сайте не производится. Это предбронь: подтверждение и детали — в мессенджере. Оплата наличными на месте.",
    bookBtn: "Забронировать",
    clearBtn: "Сбросить",
    chooseDates: "Выберите даты в календаре — и тут появится итог.",
    rulesTitle: "Условия",
    badges: ["👤 до 4 гостей", "🛏 1 спальня", "📶 Wi-Fi", "❄️ кондиционер"],
    desc: "Короткое описание квартиры (потом поменяешь на своё): район, близость к морю/центру, удобства и т.д.",
    rules: ["Заезд: 14:00", "Выезд: 12:00", "Без вечеринок", "Залог по договорённости"],
    msgTemplate: ({start, end, nights, total}) =>
      `Здравствуйте! Хочу забронировать квартиру.\nДаты: ${start} → ${end} (выезд)\nНочей: ${nights}\nИтого: ${total}\n`
  },
  en: {
    title: "Apartment for rent",
    sub: "Pick dates in the calendar → send a pre-booking request via messenger.",
    about: "About the apartment",
    photos: "Photos",
    photosHint: "You can add photos later — just upload files and they’ll appear here.",
    calendar: "Calendar",
    free: "available",
    booked: "booked",
    note: "No online payments. This is a pre-booking request: details/confirmation via messenger. Cash on arrival.",
    bookBtn: "Book",
    clearBtn: "Clear",
    chooseDates: "Select dates in the calendar — summary will appear here.",
    rulesTitle: "Rules",
    badges: ["👤 up to 4 guests", "🛏 1 bedroom", "📶 Wi-Fi", "❄️ A/C"],
    desc: "Short apartment description (you’ll replace it later): area, distance to sea/center, amenities, etc.",
    rules: ["Check-in: 14:00", "Check-out: 12:00", "No parties", "Deposit on request"],
    msgTemplate: ({start, end, nights, total}) =>
      `Hello! I'd like to book the apartment.\nDates: ${start} → ${end} (check-out)\nNights: ${nights}\nTotal: ${total}\n`
  }
};

// ==== 5) ФОТО (можно позже) ====
// Потом просто загрузишь фото в папку /photos и перечислишь тут:
const PHOTOS = [
  // "photos/1.jpg",
  // "photos/2.jpg",
  // "photos/3.jpg",
];
