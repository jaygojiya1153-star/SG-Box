import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginView = document.getElementById("loginView");
const dashView = document.getElementById("dashView");
const toast = document.getElementById("toast");

function showToast(msg, isError = false) {
  toast.textContent = msg;
  toast.className = "toast" + (isError ? " error" : "");
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2600);
}

function todayId() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------------- AUTH ---------------- */
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    errEl.textContent = "Invalid email or password.";
    console.error(err);
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, user => {
  if (user) {
    loginView.style.display = "none";
    dashView.style.display = "grid";
    document.getElementById("adminEmailTag").textContent = user.email;
    startSlotListener();
  } else {
    loginView.style.display = "flex";
    dashView.style.display = "none";
  }
});

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

/* ---------------- SLOTS: form defaults ---------------- */
document.getElementById("slotDate").value = todayId();

const slotForm = document.getElementById("slotForm");
slotForm.addEventListener("submit", async e => {
  e.preventDefault();
  const date = document.getElementById("slotDate").value;
  const time = document.getElementById("slotTime").value.trim();
  const band = document.getElementById("slotBand").value;
  const basePrice = Number(document.getElementById("slotBasePrice").value);
  const status = document.getElementById("slotStatus").value;
  const demandPct = Number(document.getElementById("slotDemand").value) || 0;
  const editId = document.getElementById("slotEditId").value;

  const docId = editId || `${date}_${time.replace(/[^0-9]/g, "")}`;

  try {
    await setDoc(doc(db, "slots", docId), {
      date, time, band, basePrice, status, demandPct
    });
    showToast("Slot saved.");
    slotForm.reset();
    document.getElementById("slotDate").value = todayId();
    document.getElementById("slotEditId").value = "";
  } catch (err) {
    console.error(err);
    showToast("Could not save slot — check Firestore setup.", true);
  }
});

function fillFormForEdit(slot, id) {
  document.getElementById("slotDate").value = slot.date;
  document.getElementById("slotTime").value = slot.time;
  document.getElementById("slotBand").value = slot.band;
  document.getElementById("slotBasePrice").value = slot.basePrice;
  document.getElementById("slotStatus").value = slot.status;
  document.getElementById("slotDemand").value = slot.demandPct || 0;
  document.getElementById("slotEditId").value = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function removeSlot(id) {
  if (!confirm("Delete this slot?")) return;
  try {
    await deleteDoc(doc(db, "slots", id));
    showToast("Slot deleted.");
  } catch (err) {
    console.error(err);
    showToast("Could not delete slot.", true);
  }
}
window.__removeSlot = removeSlot; // used by inline onclick below

/* ---------------- LIVE LISTENER: today's slots ---------------- */
function startSlotListener() {
  const q = query(collection(db, "slots"), where("date", "==", todayId()), orderBy("time"));
  onSnapshot(
    q,
    snap => {
      const slots = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderOverview(slots);
      renderSlotsTable(slots);
    },
    err => {
      console.warn("Slot listener error:", err.message);
      showToast("Connect Firestore to see live data (see README).", true);
    }
  );
}

function statusTag(status) {
  const map = { open: "open", filling: "filling", booked: "booked" };
  const label = { open: "Open", filling: "Filling Fast", booked: "Booked" };
  return `<span class="tag ${map[status] || "open"}">${label[status] || status}</span>`;
}

function renderOverview(slots) {
  document.getElementById("kpiTotal").textContent = slots.length;
  document.getElementById("kpiOpen").textContent = slots.filter(s => s.status === "open").length;
  document.getElementById("kpiFilling").textContent = slots.filter(s => s.status === "filling").length;
  document.getElementById("kpiBooked").textContent = slots.filter(s => s.status === "booked").length;

  document.getElementById("overviewTableBody").innerHTML = slots
    .map(
      s => `<tr>
        <td>${s.time}</td><td>${s.band}</td><td>${s.demandPct || 0}%</td>
        <td>${statusTag(s.status)}</td><td>₹${s.basePrice}</td>
      </tr>`
    )
    .join("") || `<tr><td colspan="5" style="color:var(--text-faint);">No slots yet — add one above.</td></tr>`;
}

function renderSlotsTable(slots) {
  document.getElementById("slotsTableBody").innerHTML = slots
    .map(
      s => `<tr>
        <td>${s.time}</td><td>${s.band}</td><td>₹${s.basePrice}</td><td>${s.demandPct || 0}%</td>
        <td>${statusTag(s.status)}</td>
        <td class="row-actions">
          <button class="icon-btn" data-edit='${JSON.stringify(s).replace(/'/g, "&#39;")}'>Edit</button>
          <button class="icon-btn" onclick="window.__removeSlot('${s.id}')">Delete</button>
        </td>
      </tr>`
    )
    .join("") || `<tr><td colspan="6" style="color:var(--text-faint);">No slots yet.</td></tr>`;

  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const slot = JSON.parse(btn.getAttribute("data-edit"));
      fillFormForEdit(slot, slot.id);
    });
  });
}

