# 📱 Ramadan 2026 — PWA Setup Guide
**Turn your website into a free installable app (no Play Store / App Store needed)**

---

## 🗂️ GitHub Folder Structure

Put ALL these files in the **root** of your GitHub repo (same folder as index.html):

```
your-github-repo/
│
├── index.html          ← ✅ Updated (use the new version)
├── manifest.json       ← ✅ New file
├── sw.js               ← ✅ New file (Service Worker)
│
└── icons/              ← ✅ New folder
    ├── icon-32.png
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-180.png
    ├── icon-192.png
    └── icon-512.png
```

---

## 🤖 Android — Free APK (No Play Store)

### Option A: PWABuilder.com (Easiest — FREE)
1. Go to → https://www.pwabuilder.com
2. Enter your URL: `https://ramadan-2026-india.netlify.app`
3. Click **"Start"** → it will analyze your PWA
4. Click **"Android"** → **"Download Package"**
5. You get a `.apk` file → share it directly via WhatsApp/Drive
6. Users install by tapping the APK (they need to allow "Install Unknown Apps")

### Option B: Direct Share (No APK needed)
- Share the URL to anyone on Android Chrome
- Chrome shows **"Add to Home Screen"** automatically
- Works exactly like a native app with offline support ✅

---

## 🍎 iPhone — Free (No App Store)

### Safari "Add to Home Screen"
1. Open `https://ramadan-2026-india.netlify.app` in **Safari**
2. Tap the **Share** button (box with arrow)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **"Add"** — done! Icon appears on home screen ✅

> ⚠️ iPhone PWA limitations: No push notifications, must use Safari

---

## ✅ After Uploading to GitHub — Netlify Auto-Deploys

Since your site is on Netlify + GitHub:
1. Commit & push all new files to GitHub
2. Netlify auto-deploys in ~60 seconds
3. Visit your site — PWA is now live!

---

## 🧪 Test Your PWA

Visit: https://web.dev/measure/
Enter your URL and check the **PWA score** — it should be 100% after this setup.

Or in Chrome DevTools → **Application** tab → **Manifest** & **Service Workers**

---

## 📊 What Each File Does

| File | Purpose |
|------|---------|
| `manifest.json` | Tells browser it's an installable app (name, icon, colors) |
| `sw.js` | Service Worker — caches app for offline use |
| `icons/` | App icons for home screen (all sizes for all devices) |

---

*Crafted with love — Ramadan 2026 · Sadqa-e-Jariya for Munira Nazir Shaikh 💜*
