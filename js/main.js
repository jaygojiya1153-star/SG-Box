// =========================================================
// MAIN SITE LOGIC — homepage slot board.
// Fetches today's slots live from your Google Sheet (via
// API_URL in js/config.js) so it reflects real bookings.
// =========================================================

const SURGE_RULES = {
  morning:   { threshold: 70, multiplier: 1.10 },
  afternoon: { threshold: 70, multiplier: 1.10 },
  evening:   { threshold: 70, multiplier: 1.25 },
  night:     { threshold: 70, multiplier: 1.15 },
};

// Shown only if the Sheet isn't connected yet, so the design is always visible
const FALLBACK_SLOTS = [
  { time: "06:00 - 07:00", band: "morning", basePrice: 700, status: "open", demandPct: 20 },
  { time: "17:00 - 18:00", band: "evening", basePrice: 1000, status: "filling", demandPct: 78 },
  { time: "18:00 - 19:00", band: "evening", basePrice: 1000, status: "filling", demandPct: 90 },
  { time: "19:00 - 20:00", band: "evening", basePrice: 1000, status: "booked", demandPct: 100 },
];

function computePrice(slot) {
  const rule = SURGE_RULES[slot.band] || { threshold: 100, multiplier: 1 };
  const demand = Number(slot.demandPct) || 0;
  const surging = demand >= rule.threshold && slot.status !== "booked";
  const finalPrice = surging ? Math.round(slot.basePrice * rule.multiplier) : Number(slot.basePrice);
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
  const candidates = slots.filter(s => s.status !== "booked");
  if (!candidates.length) return null;
  return candidates.reduce((best, s) =>
    (Number(s.demandPct) || 0) > (Number(best.demandPct) || 0) ? s : best, candidates[0]);
}

function renderBoard(slots) {
  const recommended = pickRecommended(slots);
  const heroList = document.getElementById("slotList");
  const fullList = document.getElementById("fullSlotList");

  if (heroList) {
    heroList.innerHTML = slots.length
      ? slots.slice(0, 4).map(s => renderSlotRow(s, recommended && s.time === recommended.time)).join("")
      : `<div style="color:var(--text-faint); font-size:13px; padding:10px;">No slots added for today yet.</div>`;
  }
  if (fullList) {
    fullList.innerHTML = slots.length
      ? slots.map(s => renderSlotRow(s, recommended && s.time === recommended.time)).join("")
      : `<div style="color:var(--text-faint); font-size:13px; padding:10px;">No slots added for today yet.</div>`;
  }
}

function setWhatsappLinks() {
  ["heroWhatsapp", "locationWhatsapp", "ctaWhatsapp", "floatWhatsapp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.href = waLink();
  });
}

function setScoreboardDate() {
  const el = document.getElementById("scoreboardDate");
  if (!el) return;
  el.textContent = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

async function loadTodayBoard() {
  if (!isApiConfigured()) {
    renderBoard(FALLBACK_SLOTS);
    return;
  }
  try {
    const res = await fetch(`${API_URL}?action=slots&date=${todayId()}`);
    const data = await res.json();
    renderBoard(Array.isArray(data) && data.length ? data : FALLBACK_SLOTS);
  } catch (err) {
    console.warn("Could not load live slots, showing sample data:", err);
    renderBoard(FALLBACK_SLOTS);
  }
}

setWhatsappLinks();
setScoreboardDate();
loadTodayBoard();

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
