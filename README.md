# SG92 Box Cricket Arena — Website

A premium, mobile-friendly booking website for a box cricket ground on SG Highway, Ahmedabad. Static site (plain HTML/CSS/JS) + Firebase for the database, admin login, and live slot board — so it can be published for free on GitHub Pages.

## What's included
- `index.html` — public site: live slot board, pricing, facilities, location, reviews, WhatsApp booking button
- `admin.html` + `js/admin.js` — password-protected admin panel to add/edit/delete slots and see live stats
- `js/main.js` — renders the live slot board on the public site and applies dynamic (surge) pricing
- `js/firebase-config.js` — your Firebase project keys + business info (WhatsApp number, ground name) live here
- `css/style.css` — the whole design system (colors, type, layout)

No paid hosting, no server to run — Firebase's free tier covers a single ground comfortably.

---

## 1. Create your free Firebase project (the "database")

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it (e.g. `sg92-arena`) → finish setup.
2. In the left sidebar: **Build → Firestore Database → Create database** → start in **Production mode** → pick a region close to India (e.g. `asia-south1`).
3. In the left sidebar: **Build → Authentication → Get started → Sign-in method → Email/Password → Enable**.
4. Still in Authentication, go to the **Users** tab → **Add user** → enter the admin's email + a password. This is the ID/password you'll use to log into `admin.html`. Add one user per staff member who needs access.
5. Go to **Project settings** (gear icon) → scroll to **Your apps** → click the `</>` (Web) icon → register the app (nickname anything) → copy the `firebaseConfig` object it shows you.
6. Paste those values into `js/firebase-config.js`, replacing the placeholders:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

7. In `js/firebase-config.js`, also update:
```js
export const BUSINESS = {
  name: "SG92 Box Cricket Arena",
  whatsappNumber: "919999999999", // your real WhatsApp number, country code first, no + or spaces
  defaultWhatsappMessage: "Hi! I'd like to check slot availability..."
};
```

### Firestore security rules
In Firebase Console → Firestore Database → **Rules**, replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /slots/{slotId} {
      allow read: if true;                 // anyone can see live availability
      allow write: if request.auth != null; // only logged-in admins can change slots
    }
  }
}
```
Click **Publish**. This lets the public homepage read slots without logging in, while only your admin panel (which requires login) can add, edit, or delete them.

---

## 2. Add today's slots

Once Firebase is connected:
1. Open `admin.html` locally or on your published site.
2. Log in with the email/password you created in step 1.4.
3. Go to **Manage Slots** → fill in Date, Time Range (e.g. `18:00 - 19:00`), Band, Base Price, Status, and Demand % → **Save Slot**.
4. Repeat for each hour of the day you want on the board. The public homepage updates instantly (it listens live — no refresh needed).

**Demand %** is what drives both the "★ Recommended" badge (highest-demand open/filling slot) and surge pricing — once a band crosses its threshold (70% by default), the price shown to visitors automatically increases. Thresholds/multipliers per band are set in `SURGE_RULES` inside `js/main.js`.

You only need to do this once a day, or set up a repeating template — a natural next step is a small script that auto-creates tomorrow's slots at midnight using Firebase's free Cloud Functions, if you want to automate it later.

---

## 3. Publish on GitHub Pages (free hosting)

1. Create a new GitHub repository (e.g. `sg92-box-cricket`), and push this whole folder to it:
```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```
2. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / root → Save**.
3. After a minute, your site is live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`.
4. Back in Firebase Console → **Authentication → Settings → Authorized domains**, add `YOUR_USERNAME.github.io` so login works on the published site.

Want a custom domain (e.g. `sg92arena.in`) instead of the github.io URL? Buy the domain, then in the same GitHub Pages settings add it under "Custom domain" and point your domain's DNS to GitHub's IPs (GitHub shows you exactly what to add).

---

## 4. Customize before you launch

- **Business name / brand**: search-replace "SG92" and "SG Highway" throughout `index.html`, `admin.html`, and `BUSINESS` in `firebase-config.js`.
- **Exact address & phone**: edit the `.addr` block and phone number in the Location section of `index.html`.
- **Google Map**: replace the map query in the `<iframe src="...">` with your exact address, or your ground's Google Maps share link.
- **Photos**: the Gallery section currently has labeled placeholder tiles — replace each `<div>` with an `<img src="assets/your-photo.jpg" alt="...">` once you have real ground photos (drop them in the `assets/` folder).
- **Base pricing table**: the static table on the public page (`#pricingTable` in `index.html`) and the `SURGE_RULES` in `js/main.js` should match — update both if your rates change.
- **WhatsApp number**: one place only — `BUSINESS.whatsappNumber` in `js/firebase-config.js`. Every WhatsApp button on the site pulls from there.

---

## How the "live availability" and dynamic pricing actually work
- Each slot is a document in the Firestore `slots` collection with fields: `date`, `time`, `band`, `basePrice`, `status` (`open` / `filling` / `booked`), `demandPct`.
- The public site subscribes to today's slots in real time (`onSnapshot`), so any change you make in the admin panel appears on the live site within a second — no redeploy needed.
- `js/main.js` computes the displayed price: if a slot's `demandPct` crosses its band's threshold, the price is multiplied by the band's surge multiplier and the original price is shown struck through next to it.
- The slot with the highest `demandPct` among non-booked slots gets the "★ Recommended" badge automatically.
- If Firestore isn't connected yet (e.g. you're previewing before setup), the homepage falls back to sample data defined in `FALLBACK_SLOTS` in `js/main.js`, so the design is always visible.

---

## Local preview before publishing
Any static file server works, e.g. with Python installed:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`. (Opening `index.html` directly by double-click can block Firebase's module imports in some browsers — use a local server instead.)
