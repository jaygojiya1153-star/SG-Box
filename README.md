# SG92 Box Cricket Arena — Website (Real-Time Booking, Free, No Card)

A premium, mobile-friendly booking website for a box cricket ground on SG Highway, Ahmedabad. Real-time slot locking (like a movie/bus ticket site), booking up to 15 days ahead, and a live admin panel — all running on GitHub Pages + one free Google Sheet. No card, no monthly cost.

## What's included
- `index.html` — public site: live slot board, **date-aware online booking**, pricing, facilities, location, reviews, WhatsApp button
- `admin.html` + `js/admin-tool.js` + `js/admin-bookings.js` — access-code-gated dashboard: manage slots for any date, and see every booking with a date filter
- `js/config.js` — your WhatsApp number, ground name, Sheet connection, and how many days ahead people can book
- `js/booking.js` — the on-site booking form: loads live slots for the chosen date, checks availability at the moment of booking, prevents double-booking
- `js/main.js` — homepage board, shows today's live availability
- `google-apps-script.gs` — code you paste into Google Sheets to turn it into your live database (not uploaded to GitHub — pasted directly into Google's script editor)
- `css/style.css` — the whole design system

## How it works
Your Google Sheet has **two tabs**, and this is your entire database:
- **Slots** — columns: `date`, `time`, `band`, `basePrice`, `status`, `demandPct`. One row per bookable hour, per date.
- **Bookings** — columns: `bookingId`, `name`, `phone`, `date`, `slotTime`, `price`, `paymentStatus`, `bookedAt`. One row per confirmed booking.

When a visitor picks a date and slot and taps **Confirm Booking**, the site asks the Sheet "is this still open?" at that exact moment. If yes, it's marked `booked` and the booking is saved — all in one step. If someone else grabbed it a second earlier, the visitor is told immediately and shown to pick another slot. This is exactly how ticket-booking sites prevent double-booking.

The admin panel reads and writes to the same Sheet live — no manual GitHub editing needed for day-to-day slot/price management.

---

## 1. Set up your Google Sheet (one-time, ~15 minutes, no card)

1. Open **sheets.google.com** → **+** to create a blank sheet → rename it **SG92 Bookings**
2. Rename the first tab (bottom) from "Sheet1" to **Slots**. In row 1, add these headers exactly: `date`, `time`, `band`, `basePrice`, `status`, `demandPct`
3. Tap **+** at the bottom to add a second tab → rename it **Bookings**. In row 1, add these headers exactly: `bookingId`, `name`, `phone`, `date`, `slotTime`, `price`, `paymentStatus`, `bookedAt`
4. From the **Slots** tab, add a few starting rows for today, e.g.:
   ```
   date         time            band      basePrice   status   demandPct
   2026-08-11   06:00 - 07:00   morning   700         open     20
   2026-08-11   18:00 - 19:00   evening   1000        open     60
   ```
   (You can also add slots later from the admin panel — this is just to have something to test with.)

## 2. Add the script

1. Tap **Extensions → Apps Script** (switch to "Desktop site" in your browser menu first if you don't see Extensions on mobile)
2. Delete the default code shown
3. Open `google-apps-script.gs` from this project, copy all of it, paste it into the editor
4. Near the top, find `const ADMIN_CODE = "sg92admin";` — change `"sg92admin"` to whatever access code you want, and **remember it exactly**
5. Tap **Save** (disk icon)

## 3. Publish it as a Web App

1. Tap **Deploy → New deployment**
2. Gear icon next to "Select type" → **Web app**
3. "Execute as": **Me**. "Who has access": **Anyone**
4. Tap **Deploy**
5. Tap **Authorize access** → pick your Google account → if you see "Google hasn't verified this app", tap **Advanced → Go to (your project) (unsafe) → Allow** (normal for your own scripts)
6. Copy the **Web app URL** (starts with `https://script.google.com/macros/...`)

## 4. Connect your website
1. On GitHub, open `js/config.js` → pencil (edit) icon
2. Replace `PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied → also set your real `whatsappNumber`
3. Commit changes
4. Open `js/admin-tool.js` → pencil icon → set `ACCESS_CODE` to the **exact same** code you set in step 2.4 → commit

## 5. Publish on GitHub Pages
1. Push/upload this folder's contents to your GitHub repo root (`index.html`, `admin.html`, `README.md`, `css/`, `js/` — do **not** upload `google-apps-script.gs`, that one only goes in Google Sheets)
2. **Settings → Pages → Source: Deploy from a branch → main / root → Save**
3. Live at `https://YOUR_USERNAME.github.io/YOUR_REPO/` within about a minute

## 6. Test it end to end
1. Open your live site → **Book your slot** → fill in a test booking for today → **Confirm Booking**
2. You should see a green confirmation with a Booking ID
3. Check your Google Sheet: a new row in **Bookings**, and that slot's `status` in **Slots** should now say `booked`
4. Refresh the homepage — that slot should now show as **Booked** on the live board
5. Try booking the same slot again — it should be rejected with "already booked"
6. Open `admin.html` → enter your access code → **Bookings** tab → you should see the same booking, with the date filter defaulting to today

---

## Day-to-day use
- **Add slots for upcoming days**: `admin.html` → Slot Builder → pick a date (today up to 15 days ahead) → fill the form → Save. Do this once for each day you're open, ideally a few days in advance.
- **Check bookings**: `admin.html` → Bookings tab → pick any date to see who's booked, or "Show All Dates"
- **Change prices/demand**: same Slot Builder — pick the date, load slots, edit, save
- You never need to touch GitHub for daily operations — only for design/copy changes.

## Customize
- **WhatsApp number & ground name**: `js/config.js`
- **How many days ahead bookings open**: `MAX_BOOKING_DAYS_AHEAD` in `js/config.js`
- **Admin access code**: `ACCESS_CODE` in `js/admin-tool.js` — keep matching `ADMIN_CODE` in the Apps Script
- **Exact address, phone, map**: Location section in `index.html`
- **Photos**: replace placeholder tiles in the Gallery section with `<img src="assets/your-photo.jpg">`

## A note on security
The admin access code and the booking system are lightweight by design (no paid backend), matching the "no card, ₹0" constraint. They keep out casual visitors and prevent accidental double-booking, but a technically determined person could theoretically find ways around them (e.g. reading the access code from the page source). For a single local ground this is a reasonable trade-off; if you ever want bank-grade security and instant, no-manual-step live sync, that would mean moving to a paid backend later — not necessary to start.

## Local preview before publishing
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.
