// =========================================================
// ADMIN — BOOKINGS PANEL
// Reads bookings live from your Google Sheet, with a date
// filter so you can clearly see who booked for which day.
// =========================================================

function initBookingsFilter() {
  const dateInput = document.getElementById("bookingsDateFilter");
  if (!dateInput || dateInput.dataset.init) return;
  dateInput.dataset.init = "1";
  dateInput.value = todayId();
  dateInput.addEventListener("change", loadBookings);
  document.getElementById("bookingsShowAllBtn")?.addEventListener("click", () => {
    dateInput.value = "";
    loadBookings();
  });
}

async function loadBookings() {
  initBookingsFilter();
  const tbody = document.getElementById("bookingsTableBody");
  const dateInput = document.getElementById("bookingsDateFilter");
  const date = dateInput ? dateInput.value : "";

  if (!isApiConfigured()) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:var(--text-faint);">Connect your Sheet URL in js/config.js first — see README.md.</td></tr>`;
    setBookingKpis([]);
    return;
  }

  tbody.innerHTML = `<tr><td colspan="8" style="color:var(--text-faint);">Loading…</td></tr>`;

  try {
    const url = date ? `${API_URL}?action=bookings&date=${date}` : `${API_URL}?action=bookings`;
    const res = await fetch(url);
    const data = await res.json();
    renderBookings(Array.isArray(data) ? data : []);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:var(--red);">Couldn't load bookings — check your Sheet connection.</td></tr>`;
    setBookingKpis([]);
  }
}

function renderBookings(bookings) {
  const tbody = document.getElementById("bookingsTableBody");
  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="color:var(--text-faint);">No bookings for this date.</td></tr>`;
    setBookingKpis([]);
    return;
  }
  const sorted = [...bookings].reverse(); // newest first
  tbody.innerHTML = sorted
    .map(
      b => `<tr>
        <td>${b.bookingId || ""}</td>
        <td>${b.name || ""}</td>
        <td>${b.phone || ""}</td>
        <td>${b.date || ""}</td>
        <td>${b.slotTime || ""}</td>
        <td>₹${b.price || ""}</td>
        <td>${paymentTag(b.paymentStatus)}</td>
        <td>${b.bookedAt || ""}</td>
      </tr>`
    )
    .join("");
  setBookingKpis(bookings);
}

function paymentTag(status) {
  if (status === "Prepaid") return `<span class="tag open">Prepaid</span>`;
  return `<span class="tag filling">Pending</span>`;
}

function setBookingKpis(bookings) {
  const total = bookings.length;
  const prepaid = bookings.filter(b => b.paymentStatus === "Prepaid");
  const pending = bookings.filter(b => b.paymentStatus !== "Prepaid");
  const revenue = prepaid.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  document.getElementById("kpiBookTotal").textContent = total;
  document.getElementById("kpiBookPrepaid").textContent = prepaid.length;
  document.getElementById("kpiBookPending").textContent = pending.length;
  document.getElementById("kpiBookRevenue").textContent = revenue.toLocaleString("en-IN");
}

document.getElementById("refreshBookingsBtn")?.addEventListener("click", loadBookings);
