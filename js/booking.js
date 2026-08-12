// =========================================================
// ON-SITE BOOKING FORM — real-time, date-aware.
// Loads live slots for the chosen date, and checks with the
// Sheet at the moment of booking so two people can't take the
// same slot (same idea as a movie/bus ticket site).
// =========================================================

function generateBookingId() {
  return "SG" + Date.now().toString().slice(-8);
}

function setupDatePicker() {
  const dateInput = document.getElementById("bookDate");
  if (!dateInput) return;
  const min = todayId();
  const max = addDaysId(MAX_BOOKING_DAYS_AHEAD);
  dateInput.min = min;
  dateInput.max = max;
  dateInput.value = min;
  dateInput.addEventListener("change", () => loadSlotsForDate(dateInput.value));
  loadSlotsForDate(min);
}

async function loadSlotsForDate(date) {
  const select = document.getElementById("bookSlotSelect");
  if (!select) return;
  select.innerHTML = `<option value="">Loading slots…</option>`;

  if (!isApiConfigured()) {
    select.innerHTML = `<option value="">Online booking not set up yet — use WhatsApp</option>`;
    return;
  }

  try {
    const res = await fetch(`${API_URL}?action=slots&date=${date}`);
    const slots = await res.json();
    const bookable = Array.isArray(slots) ? slots.filter(s => s.status !== "booked") : [];

    select.innerHTML = bookable.length
      ? bookable
          .map(
            s =>
              `<option value="${s.time}|${s.basePrice}">${s.time} — ₹${s.basePrice}${
                s.status === "filling" ? " (filling fast)" : ""
              }</option>`
          )
          .join("")
      : `<option value="">No open slots for this date — try another day</option>`;
  } catch (err) {
    select.innerHTML = `<option value="">Couldn't load slots — try again</option>`;
  }
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
  const date = document.getElementById("bookDate").value;
  const slotSelect = document.getElementById("bookSlotSelect");
  const [time, price] = (slotSelect.value || "").split("|");
  const payment = document.querySelector('input[name="bookPayment"]:checked')?.value || "Pending";

  if (!time) {
    showBookingResult("Please pick a valid slot first.", true);
    return;
  }
  if (!isApiConfigured()) {
    showBookingResult(
      `Online booking isn't fully set up yet — please tap WhatsApp to book directly. (Site owner: add your Sheet URL in js/config.js — see README.)`,
      true
    );
    return;
  }

  const bookingId = generateBookingId();
  const submitBtn = document.getElementById("bookSubmitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Checking availability…";

  const params = new URLSearchParams({
    action: "book",
    bookingId, name, phone, date,
    time, price, paymentStatus: payment
  });

  try {
    const res = await fetch(`${API_URL}?${params.toString()}`);
    const result = await res.json();

    if (result.success) {
      showBookingResult(
        `✅ Booking confirmed! Your ID is <strong>${bookingId}</strong> for <strong>${date}, ${time}</strong>. ` +
          `We'll follow up on WhatsApp — please save this ID.`,
        false
      );
      document.getElementById("bookingForm").reset();
      setupDatePicker();

      const waMsg = `Hi! I just booked slot ${time} on ${date} (ID: ${bookingId}, Name: ${name}, Phone: ${phone}). Please confirm.`;
      const waBtn = document.getElementById("bookWhatsappConfirm");
      waBtn.href = waLink(waMsg);
      waBtn.style.display = "inline-flex";
    } else {
      showBookingResult(result.message || "That slot is no longer available. Please pick another.", true);
      loadSlotsForDate(date); // refresh the dropdown so it reflects reality
    }
  } catch (err) {
    showBookingResult("Something went wrong. Please tap WhatsApp to book directly instead.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm Booking";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupDatePicker();
  const form = document.getElementById("bookingForm");
  if (form) form.addEventListener("submit", submitBooking);
});
