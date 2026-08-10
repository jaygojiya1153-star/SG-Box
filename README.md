# SG92 Box Cricket Arena — Website (Free, No Card, No Database)

A premium, mobile-friendly website for a box cricket ground on SG Highway, Ahmedabad. This version has **no Firebase, no database, no card required, ₹0 cost, forever** — it's plain HTML/CSS/JS hosted free on GitHub Pages.

## What's included
- `index.html` — public site: slot board, pricing, facilities, location, reviews, WhatsApp booking button
- `admin.html` + `js/admin-tool.js` — a simple access-code-gated tool that helps you build today's slot list and generates the code to paste into GitHub
- `js/slots-data.js` — **this is your "database."** A plain list of today's slots. Edit it directly on GitHub (or via the admin tool) to update what visitors see.
- `js/config.js` — your WhatsApp number and ground name
- `js/main.js` — renders the slot board and applies dynamic (surge) pricing
- `css/style.css` — the whole design system

## How it works (important — read this)
There is no live database and no real login system. Instead:
- **`js/slots-data.js`** holds today's slots as plain code. Your homepage reads this file directly.
- To change a slot's status/price, you edit that file on GitHub (tap the file → pencil/edit icon → change the numbers → commit). Your live site updates automatically within about a minute.
- **`admin.html`** is a convenience tool, not a real backend. It lets you build/edit the slot list in a friendly form, then click **Copy Code** — you paste that code into `js/slots-data.js` on GitHub yourself. Nothing on that page saves by itself.
- The "access code" on `admin.html` (default: `sg92admin`, change it in `js/admin-tool.js`) just keeps casual visitors from opening the tool — it is **not** secure, since anyone can view the page's source code and see it. Don't rely on it to protect anything sensitive.

This trade-off means: zero cost, zero setup, nothing that can ever bill you — but updating slots takes a manual copy-paste into GitHub instead of happening automatically. For a single ground, updating once a day (or whenever a booking comes in) takes about a minute.

---

## 1. Customize before you launch
- **WhatsApp number & ground name**: edit `BUSINESS` in `js/config.js`
- **Today's slots**: edit the `SLOTS` list in `js/slots-data.js` directly, or use `admin.html`
- **Admin access code**: change `ACCESS_CODE` in `js/admin-tool.js`
- **Exact address & phone**: edit the `.addr` block in the Location section of `index.html`
- **Google Map**: replace the map query in the `<iframe src="...">` in `index.html` with your exact address
- **Photos**: replace the placeholder tiles in the Gallery section of `index.html` with `<img src="assets/your-photo.jpg">` once you have real ground photos (put them in the `assets/` folder)
- **Base pricing table**: keep the static table in `index.html` (`#pricingTable`) and the `SURGE_RULES` in `js/main.js` in sync if your rates change

## 2. Publish on GitHub Pages (free hosting)
1. Push/upload this whole folder's contents to a GitHub repo (root level: `index.html`, `admin.html`, `README.md`, plus the `css/` and `js/` folders)
2. In the repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / root → Save**
3. After about a minute, your site is live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 3. Update slots day to day
**Option A — directly on GitHub (fastest for small changes):**
1. Open `js/slots-data.js` in your repo → pencil (edit) icon
2. Change a slot's `status`, `basePrice`, or `demandPct` → commit changes
3. Site updates within ~1 minute

**Option B — using the admin tool (better for rebuilding the whole day):**
1. Open `yoursite.github.io/admin.html` → enter your access code
2. Add/edit/remove slots in the form — the table and the code box below update live
3. Tap **Copy Code**
4. Go to `js/slots-data.js` on GitHub → edit → select all → paste → commit

---

## Local preview before publishing
Any static file server works, e.g. with Python installed:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## If you ever want the fully live version later
A real-time database (so the board updates instantly for every visitor without you touching GitHub, plus real password-protected admin login) is possible with Firebase's free tier — but Google now requires a linked billing card even for the free tier, which is why this version skips it. If that changes, or you're comfortable adding a card later (you stay free unless you get very high traffic), that upgrade path is straightforward — just ask.
