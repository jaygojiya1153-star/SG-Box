// =========================================================
// MAIN SITE LOGIC — no Firebase, no database.
// Reads slot data straight from js/slots-data.js (loaded
// before this file in index.html), computes surge pricing,
// and fills in the WhatsApp links from js/config.js.
// =========================================================

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

setWhatsappLinks();
setScoreboardDate();
renderBoard(SLOTS); // SLOTS comes from js/slots-data.js

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
