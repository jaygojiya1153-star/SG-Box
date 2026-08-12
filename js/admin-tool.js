// =========================================================
// ADMIN TOOL — no database, no server.
// Change ACCESS_CODE below to whatever you want. This only
// keeps casual visitors out of the tool page — it is NOT
// secure (anyone who reads this file can see the code), so
// never use it to protect anything truly sensitive.
// =========================================================
const ACCESS_CODE = "sg92admin";

const loginView = document.getElementById("loginView");
const dashView = document.getElementById("dashView");
const toast = document.getElementById("toast");

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2600);
}

/* ---------------- ACCESS CODE ---------------- */
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const code = document.getElementById("accessCode").value;
  const errEl = document.getElementById("loginError");
  if (code === ACCESS_CODE) {
    sessionStorage.setItem("sg92_admin_ok", "1");
    loginView.style.display = "none";
    dashView.style.display = "grid";
    renderTable();
  } else {
    errEl.textContent = "Wrong code — try again.";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("sg92_admin_ok");
  location.reload();
});

if (sessionStorage.getItem("sg92_admin_ok") === "1") {
  loginView.style.display = "none";
  dashView.style.display = "grid";
}

/* ---------------- PANEL NAV ---------------- */
document.querySelectorAll(".nav-item").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".panel").forEach(p => (p.style.display = "none"));
    document.getElementById(link.dataset.panel).style.display = "block";
  });
});

/* ---------------- SLOT LIST (in-memory, starts from current SLOTS) ---------------- */
// SLOTS is loaded from js/slots-data.js (script tag in admin.html), so the
// builder starts pre-filled with whatever is currently live on the site.
let workingSlots = (typeof SLOTS !== "undefined") ? JSON.parse(JSON.stringify(SLOTS)) : [];

const slotForm = document.getElementById("slotForm");
slotForm.addEventListener("submit", e => {
  e.preventDefault();
  const time = document.getElementById("slotTime").value.trim();
  const band = document.getElementById("slotBand").value;
  const basePrice = Number(document.getElementById("slotBasePrice").value);
  const status = document.getElementById("slotStatus").value;
  const demandPct = Number(document.getElementById("slotDemand").value) || 0;
  const editIndex = Number(document.getElementById("slotEditIndex").value);

  const slot = { time, band, basePrice, status, demandPct };

  if (editIndex >= 0) {
    workingSlots[editIndex] = slot;
  } else {
    workingSlots.push(slot);
  }

  slotForm.reset();
  document.getElementById("slotDemand").value = 20;
  document.getElementById("slotEditIndex").value = -1;
  document.getElementById("slotSubmitBtn").textContent = "Add Slot to List";
  renderTable();
  showToast("Slot added to list — remember to copy the code below into GitHub.");
});

function editSlot(index) {
  const s = workingSlots[index];
  document.getElementById("slotTime").value = s.time;
  document.getElementById("slotBand").value = s.band;
  document.getElementById("slotBasePrice").value = s.basePrice;
  document.getElementById("slotStatus").value = s.status;
  document.getElementById("slotDemand").value = s.demandPct;
  document.getElementById("slotEditIndex").value = index;
  document.getElementById("slotSubmitBtn").textContent = "Update Slot";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function removeSlot(index) {
  if (!confirm("Remove this slot from the list?")) return;
  workingSlots.splice(index, 1);
  renderTable();
}
window.__editSlot = editSlot;
window.__removeSlot = removeSlot;

function statusTag(status) {
  const map = { open: "open", filling: "filling", booked: "booked" };
  const label = { open: "Open", filling: "Filling Fast", booked: "Booked" };
  return `<span class="tag ${map[status] || "open"}">${label[status] || status}</span>`;
}

function renderTable() {
  const body = document.getElementById("slotsTableBody");
  body.innerHTML = workingSlots
    .map(
      (s, i) => `<tr>
        <td>${s.time}</td><td>${s.band}</td><td>₹${s.basePrice}</td><td>${s.demandPct}%</td>
        <td>${statusTag(s.status)}</td>
        <td class="row-actions">
          <button class="icon-btn" onclick="window.__editSlot(${i})">Edit</button>
          <button class="icon-btn" onclick="window.__removeSlot(${i})">Delete</button>
        </td>
      </tr>`
    )
    .join("") || `<tr><td colspan="6" style="color:var(--text-faint);">No slots yet — add one above.</td></tr>`;

  generateCode();
}

function generateCode() {
  const lines = workingSlots
    .map(s => `  { time: "${s.time}", band: "${s.band}", basePrice: ${s.basePrice}, status: "${s.status}", demandPct: ${s.demandPct} },`)
    .join("\n");
  const code = `const SLOTS = [\n${lines}\n];\n`;
  document.getElementById("generatedCode").value = code;
}

document.getElementById("copyCodeBtn").addEventListener("click", () => {
  const box = document.getElementById("generatedCode");
  box.select();
  navigator.clipboard.writeText(box.value)
    .then(() => showToast("Code copied — paste it into js/slots-data.js on GitHub."))
    .catch(() => showToast("Couldn't auto-copy — select the text manually.", true));
});

renderTable();
