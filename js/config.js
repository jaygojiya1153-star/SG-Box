// =========================================================
// BUSINESS SETTINGS
// Edit these values directly, then commit the change on GitHub.
// No Firebase, no database, no card needed — this whole site
// runs as plain files.
// =========================================================

const BUSINESS = {
  name: "SG92 Box Cricket Arena",
  // Country code + number, no + and no spaces, e.g. 91 then your 10-digit number
  whatsappNumber: "916351527609",
  defaultWhatsappMessage: "Hi! I'd like to check slot availability at SG92 Box Cricket Arena."
};

function waLink(message) {
  const text = encodeURIComponent(message || BUSINESS.defaultWhatsappMessage);
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${text}`;
}

// ---- On-site booking form + admin bookings list ----
// This points at a free Google Sheet (via Google Apps Script) that stores
// every booking: unique ID, name, phone, slot, price, payment status.
// Setup steps are in README.md — until you paste your real URL below,
// the booking form will politely tell visitors to use WhatsApp instead.
const BOOKING_API_URL = "https://script.google.com/macros/s/AKfycbwsKktCFYHDefOFLLgYXmt5oGK4a423ka2BNAyxj_h2jGFtynLMUUty5_7Bgs2sDAOW/exec";
