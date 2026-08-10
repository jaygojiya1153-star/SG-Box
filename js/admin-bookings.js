// =========================================================
// ADMIN — BOOKINGS PANEL
// Reads bookings from the same Google Sheet the public booking
// form writes to (via the Apps Script Web App URL in js/config.js).
// =========================================================

async function loadBookings() {
  const tbody = document.getElementById("bookingsTableBody");
  const notConfigured = !BOOKING_API_URL || BOOKING_API_URL.includes("PASTE_YOUR");

  if (notConfigured) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--text-faint);">Connect your Google Sheet URL in js/config.js first — see README.md.</td></tr>`;
    setBookingKpis([]);
    return;
  }

  tbody.innerHTML = `<tr><td colspan="7" style="color:var(--text-faint);">Loading…</td></tr>`;

  try {
    const res = await fetch(BOOKING_API_URL);
    const data = await res.json();
    renderBookings(Array.isArray(data) ? data : []);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--red);">Couldn't load bookings — check the Apps Script URL is correct and deployed with "Anyone" access.</td></tr>`;
    setBookingKpis([]);
  }
}

function renderBookings(bookings) {
  const tbody = document.getElementById("bookingsTableBody");
  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--text-faint);">No bookings yet.</td></tr>`;
    setBookingKpis([]);
    return;
  }
  // Newest first
  const sorted = [...bookings].reverse();
  tbody.innerHTML = sorted
    .map(
      b => `<tr>
        <td>${b.bookingId || ""}</td>
        <td>${b.name || ""}</td>
        <td>${b.phone || ""}</td>
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

// Load once the Bookings tab is first opened
document.querySelector('[data-panel="panelBookings"]')?.addEventListener("click", loadBookings);
