// =========================================================
// TODAY'S SLOTS
// This is your "database" — no login, no app needed.
// To update slot status/price, edit this list directly on
// GitHub (tap the pencil icon on this file) and commit.
//
// Fields:
//   time      — shown on the board, e.g. "18:00 - 19:00"
//   band      — "morning" | "afternoon" | "evening" | "night"
//   basePrice — normal price for that hour, in rupees
//   status    — "open" | "filling" | "booked"
//   demandPct — 0-100. Drives surge pricing + the "Recommended" badge.
//               Set it higher as a band fills up.
//
// Easiest way to keep this current: update it once each morning
// for the day ahead, and flip a slot to "booked" whenever someone
// confirms on WhatsApp.
// =========================================================

const SLOTS = [
  { time: "06:00 - 07:00", band: "morning",   basePrice: 700,  status: "open",    demandPct: 20 },
  { time: "07:00 - 08:00", band: "morning",   basePrice: 700,  status: "open",    demandPct: 15 },
  { time: "08:00 - 09:00", band: "morning",   basePrice: 700,  status: "open",    demandPct: 10 },
  { time: "12:00 - 13:00", band: "afternoon", basePrice: 600,  status: "open",    demandPct: 20 },
  { time: "13:00 - 14:00", band: "afternoon", basePrice: 600,  status: "open",    demandPct: 15 },
  { time: "17:00 - 18:00", band: "evening",   basePrice: 1000, status: "filling", demandPct: 78 },
  { time: "18:00 - 19:00", band: "evening",   basePrice: 1000, status: "filling", demandPct: 90 },
  { time: "19:00 - 20:00", band: "evening",   basePrice: 1000, status: "booked",  demandPct: 100 },
  { time: "20:00 - 21:00", band: "evening",   basePrice: 1000, status: "open",    demandPct: 55 },
  { time: "21:00 - 22:00", band: "night",     basePrice: 800,  status: "open",    demandPct: 30 },
  { time: "22:00 - 23:00", band: "night",     basePrice: 800,  status: "open",    demandPct: 20 },
];
