// =========================================================
// BUSINESS SETTINGS
// Edit these values directly, then commit the change on GitHub.
// No card needed anywhere — this whole site runs as plain
// files plus one free Google Sheet acting as the database.
// =========================================================

const BUSINESS = {
  name: "SG92 Box Cricket Arena",
  // Country code + number, no + and no spaces, e.g. 91 then your 10-digit number
  whatsappNumber: "916351527609",
  defaultWhatsappMessage: "Hi! I'd like to check slot availability at SG92 Box Cricket Arena."
};

// The Web App URL from your Google Apps Script deployment (see README.md).
// Both live slot availability AND bookings go through this one URL.
const API_URL = "https://script.google.com/macros/s/AKfycbwsKktCFYHDefOFLLgYXmt5oGK4a423ka2BNAyxj_h2jGFtynLMUUty5_7Bgs2sDAOW/exec";

// How many days ahead visitors can book (today + this many days)
const MAX_BOOKING_DAYS_AHEAD = 15;

function waLink(message) {
  const text = encodeURIComponent(message || BUSINESS.defaultWhatsappMessage);
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${text}`;
}

function todayId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDaysId(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isApiConfigured() {
  return API_URL && !API_URL.includes("PASTE_YOUR");
}
