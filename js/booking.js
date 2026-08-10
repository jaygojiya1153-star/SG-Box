// =========================================================
// ON-SITE BOOKING FORM
// Submits directly to a free Google Sheet (via a Google Apps
// Script "Web App" URL you set as BOOKING_API_URL in
// js/config.js). Setup steps are in README.md.
// Until that URL is set, the form tells visitors to use
// WhatsApp instead — it never just silently fails.
// =========================================================

function generateBookingId() {
  return "SG" + Date.now().toString().slice(-8);
}

function populateSlotDropdown() {
  const select = document.getElementById("bookSlotSelect");
  if (!select || typeof SLOTS === "undefined") return;
  const bookable = SLOTS.filter(s => s.status !== "booked");
  select.innerHTML = bookable.length
    ? bookable
        .map(
          s =>
            `<option value="${s.time}|${s.basePrice}">${s.time} — ₹${s.basePrice}${
              s.status === "filling" ? " (filling fast)" : ""
            }</option>`
        )
        .join("")
    : `<option value="">No open slots right now — please WhatsApp us</option>`;
}

function showBookingResult(message, isError) {
  const box = document.getElementById("bookingResult");
  box.style.display = "block";
  box.className = "booking-result" + (isError ? " error" : "");
  box.innerHTML = message;
}

async function submitBooking(e) {
  e.preventDefault();
  const name = document.getElementById("bookName").value.trim();
  const phone = document.getElementById("bookPhone").value.trim();
  const slotSelect = document.getElementById("bookSlotSelect");
  const [time, price] = (slotSelect.value || "").split("|");
  const payment = document.querySelector('input[name="bookPayment"]:checked')?.value || "Pending";

  if (!time) {
    showBookingResult("Please pick a slot first.", true);
    return;
  }

  const bookingId = generateBookingId();
  const submitBtn = document.getElementById("bookSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Booking…";

  const payload = {
    bookingId,
    name,
    phone,
    slotTime: time,
    price,
    paymentStatus: payment,
    bookedAt: new Date().toLocaleString("en-IN")
  };

  const notConfigured =
    !BOOKING_API_URL || BOOKING_API_URL.includes("PASTE_YOUR");

  try {
    if (notConfigured) throw new Error("not configured");

    // Apps Script web apps require no-cors mode from browser fetch;
    // we can't read a response back, so we treat "no network error" as success.
    await fetch(BOOKING_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    showBookingResult(
      `✅ Booking requested! Your ID is <strong>${bookingId}</strong>. ` +
        `We'll confirm on WhatsApp shortly — please save this ID.`,
      false
    );
    document.getElementById("bookingForm").reset();
    populateSlotDropdown();

    const waMsg = `Hi! I just booked slot ${time} (ID: ${bookingId}, Name: ${name}, Phone: ${phone}). Please confirm.`;
    const waBtn = document.getElementById("bookWhatsappConfirm");
    waBtn.href = waLink(waMsg);
    waBtn.style.display = "inline-flex";
  } catch (err) {
    showBookingResult(
      notConfigured
        ? `Online booking isn't fully set up yet — please tap the WhatsApp button above to book directly. (Site owner: add your Google Sheet URL in js/config.js — see README.)`
        : `Something went wrong sending your booking. Please tap WhatsApp to book directly instead.`,
      true
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Booking";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateSlotDropdown();
  const form = document.getElementById("bookingForm");
  if (form) form.addEventListener("submit", submitBooking);
});
