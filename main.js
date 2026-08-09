import { db, BUSINESS, waLink } from "./firebase-config.js";
import {
  collection, query, where, onSnapshot, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---------------------------------------------------------
   Sample fallback data — shown if Firestore isn't connected
   yet, or has no slots for today. Replace via the admin panel
   once Firebase is set up (see README.md).
--------------------------------------------------------- */
const FALLBACK_SLOTS = [
  { time: "06:00 - 07:00", band: "morning",   basePrice: 700,  status: "open" },
  { time: "07:00 - 08:00", band: "morning",   basePrice: 700,  status: "open" },
  { time: "17:00 - 18:00", band: "evening",   basePrice: 1000, status: "filling", demandPct: 78 },
  { time: "18:00 - 19:00", band: "evening",   basePrice: 1000, status: "filling", demandPct: 90 },
  { time: "19:00 - 20:00", band: "evening",   basePrice: 1000, status: "booked" },
  { time: "20:00 - 21:00", band: "evening",   basePrice: 1000, status: "open",   demandPct: 55 },
  { time: "21:00 - 22:00", band: "night",     basePrice: 800,  status: "open" },
  { time: "22:00 - 23:00", band: "night",     basePrice: 800,  status: "open" },
];

// Bands that surge, and by how much, once demand crosses the threshold
const SURGE_RULES = {
  morning:   { threshold: 70, multiplier: 1.10 },
  afternoon: { threshold: 70, multiplier: 1.10 },
  evening:   { threshold: 70, multiplier: 1.25 },
  night:     { threshold: 70, multiplier: 1.15 },
};

function computePrice(slot) {
  const rule = SURGE_RULES[slot.band] || { threshold: 100, multiplier: 1 };
  const demand = slot.demandPct || 0;
  const surging = demand >= rule.threshold && slot.status !== "booked";
  const finalPrice = surging ? Math.round(slot.basePrice * rule.multiplier) : slot.basePrice;
  return { finalPrice, surging };
}

function statusChip(status) {
  if (status === "booked") return `<span class="status-chip status-booked">Booked</span>`;
  if (status === "filling") return `<span class="status-chip status-filling">Filling Fast</span>`;
  return `<span class="status-chip status-open">Open</span>`;
}

function renderSlotRow(slot, isRecommended) {
  const { finalPrice, surging } = computePrice(slot);
  const priceHtml = surging
    ? `<span class="was">₹${slot.basePrice}</span><span class="surge">₹${finalPrice}</span>`
    : `₹${finalPrice}`;
  return `
    <div class="slot-row ${isRecommended ? "recommended" : ""}">
      <div class="slot-time">${slot.time}</div>
      <div class="slot-tag ${isRecommended ? "hot" : ""}">${isRecommended ? "★ Recommended" : slot.band}</div>
      ${statusChip(slot.status)}
      <div class="slot-price">${priceHtml}</div>
    </div>`;
}

function pickRecommended(slots) {
  // Most-in-demand open/filling slot wins the "Recommended" badge
  const candidates = slots.filter(s => s.status !== "booked");
  if (!candidates.length) return null;
  return candidates.reduce((best, s) =>
    (s.demandPct || 0) > (best.demandPct || 0) ? s : best, candidates[0]);
}

function renderBoard(slots) {
  const recommended = pickRecommended(slots);
  const topFour = slots.slice(0, 4);
  const heroList = document.getElementById("slotList");
  const fullList = document.getElementById("fullSlotList");

  if (heroList) {
    heroList.innerHTML = topFour
      .map(s => renderSlotRow(s, recommended && s.time === recommended.time))
      .join("");
  }
  if (fullList) {
    fullList.innerHTML = slots
      .map(s => renderSlotRow(s, recommended && s.time === recommended.time))
      .join("");
  }
}

function setWhatsappLinks() {
  const links = ["heroWhatsapp", "locationWhatsapp", "ctaWhatsapp", "floatWhatsapp"];
  links.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = waLink();
  });
}

function setScoreboardDate() {
  const el = document.getElementById("scoreboardDate");
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

function todayId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function subscribeToSlots() {
  try {
    const slotsRef = collection(db, "slots");
    const q = query(slotsRef, where("date", "==", todayId()), orderBy("time"));
    onSnapshot(
      q,
      snap => {
        if (snap.empty) {
          renderBoard(FALLBACK_SLOTS);
          return;
        }
        const slots = snap.docs.map(d => d.data());
        renderBoard(slots);
      },
      err => {
        console.warn("Falling back to sample slots — Firestore not reachable yet:", err.message);
        renderBoard(FALLBACK_SLOTS);
      }
    );
  } catch (err) {
    console.warn("Firebase not configured yet — showing sample slots.", err.message);
    renderBoard(FALLBACK_SLOTS);
  }
}

setWhatsappLinks();
setScoreboardDate();
subscribeToSlots();

// Mobile nav toggle
const navToggle = document.getElementById("navToggle");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const links = document.querySelector(".nav-links");
    links.style.display = links.style.display === "flex" ? "none" : "flex";
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "64px";
    links.style.left = "0";
    links.style.right = "0";
    links.style.background = "#0a120d";
    links.style.padding = "20px 24px";
  });
}
