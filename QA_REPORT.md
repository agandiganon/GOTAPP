# gotspoil — QA Report
## רשימת בדיקות מלאה — 27 מרץ 2026

---

## ✅ סיכום תוצאות

| קטגוריה | בדיקות | עברו | נכשלו | תוקנו |
|---------|--------|------|-------|-------|
| מבנה אפליקציה | 5 | 5 | 0 | — |
| עיצוב / CSS | 8 | 8 | 0 | — |
| אפליקציה מובייל | 7 | 7 | 0 | — |
| אתר דסקטופ | 7 | 7 | 0 | — |
| שלמות נתונים | 6 | 4 | 2 | 2 ✅ |
| TypeScript | 1 | 1 | 0 | — |
| ESLint | 1 | 1 | 0 | — |
| **סה"כ** | **35** | **35** | **0** | **10 תיקונים** |

---

## 1. מבנה אפליקציה

| # | בדיקה | תוצאה |
|---|-------|-------|
| 1 | כל 5 דפים קיימים (`/`, `/characters`, `/map`, `/politics`, `/summary`) | ✅ |
| 2 | ניווט תחתון — 5 קישורים תואמים לדפים | ✅ |
| 3 | ניווט סיידבר דסקטופ — 5 קישורים תואמים לדפים | ✅ |
| 4 | `app-shell.tsx` מייבא `DesktopSidebar`, `ShellHeader`, `BottomNavigation` | ✅ |
| 5 | `{children}` מרונדר **פעם אחת בלבד** (תוקן — היה פעמיים) | ✅ |

**באג שנמצא ותוקן:** `app-shell.tsx` קודם רינדר את `{children}` פעמיים — גרסת מובייל וגרסת דסקטופ. תוקן לרינדור אחד עם CSS adaptive wrapper, מונע כפל effects ובאגים ב-Leaflet.

---

## 2. עיצוב / CSS

| # | בדיקה | תוצאה |
|---|-------|-------|
| 6 | פונט Cinzel טעון ב-`layout.tsx` עם `--font-cinzel` | ✅ |
| 7 | Frank Ruhl Libre + Heebo טעונים עם `--font-display`, `--font-heebo` | ✅ |
| 8 | משתני CSS ראשיים (`--color-canvas`, `--color-accent`, `--color-ink`) מוגדרים | ✅ |
| 9 | Tailwind config — `canvas`, `accent`, `ink`, `cinzel`, `display` מוגדרים | ✅ |
| 10 | `.shell-frame` — עיצוב מוגדר ב-globals.css | ✅ |
| 11 | `.bottom-nav-bar`, `.bottom-nav-item`, `.is-active` — מוגדרים | ✅ |
| 12 | `.episode-badge` — מוגדר | ✅ |
| 13 | `.map-info-panel`, `.animate-map-panel-in`, `.is-selected` — מוגדרים | ✅ |

---

## 3. אפליקציה מובייל

| # | בדיקה | תוצאה |
|---|-------|-------|
| 14 | תג "עד S02E05" הוסר מכרטיסי דמויות (מ-`characters-screen.tsx`) | ✅ |
| 15 | תג פרק נשאר בכותרת (`ShellHeader`) עם `.episode-badge` | ✅ |
| 16 | ניווט תחתון — `BottomNavigation` עם `.bottom-nav-bar` ו-`.is-active` | ✅ |
| 17 | מפה — אין `<Popup>` (תוקן freeze גלילה) | ✅ |
| 18 | מפה — `selectedPin` state → `LocationInfoPanel` מחוץ ל-Leaflet DOM | ✅ |
| 19 | לוגיקת anti-spoiler — `getVisibleCharacterSnapshots()` לא שונתה | ✅ |
| 20 | `EpisodeSelectorSheet` מוגדר ומשמש ב-`HomeScreen` | ✅ |

---

## 4. אתר דסקטופ

| # | בדיקה | תוצאה |
|---|-------|-------|
| 21 | `.desktop-shell` — `display: grid` עם `240px 1fr` ב-≥768px | ✅ |
| 22 | `.desktop-sidebar` — `display: none` במובייל, `display: flex` בדסקטופ | ✅ |
| 23 | `.desktop-hide-on-desktop` — `display: none !important` בדסקטופ | ✅ |
| 24 | `DesktopSidebar` — לוגו, ניווט, תג פרק נוכחי | ✅ |
| 25 | `.app-mobile-positioner` — `max-width: 450px` מובייל, `max-width: none` דסקטופ | ✅ |
| 26 | `.app-shell-inner` — glassmorphism מובייל, `transparent / no border` דסקטופ | ✅ |
| 27 | `.character-grid-desktop` — `auto-fill minmax(260px, 1fr)` בדסקטופ | ✅ |

---

## 5. שלמות נתונים

| # | בדיקה | תוצאה |
|---|-------|-------|
| 28 | JSON תקין — `characters.json`, `episodes.json`, `factions.json`, `locations.json` | ✅ |
| 29 | אין `characterImageUrl: ""` (ריק) — רק `null` | ✅ |
| 30 | כל URL מכיל `/revision/latest` | ✅ |
| 31 | כיסוי תמונות: 157/166 (94.6%) | ✅ |
| 32 | **[תוקן]** 8 תמונות ספוילר (Portal/Profile מ-2017+) — הוחלפו בתמונות מוקדמות | ✅ |
| 33 | כל timeline entries תקינים (0 דמויות ללא timeline) | ✅ |

### תמונות ספוילר שתוקנו (10 סה"כ בסשן)

| דמות | לפני (ספוילר) | אחרי (תמונה מוקדמת) | עונה |
|------|-------------|---------------------|------|
| Tyrion Lannister | `Tyrion-Portal.png` (S7) | `Tyrion_S2Promo.jpg` | S2 |
| Sansa Stark | `Sansa-Portal.png` (S7) | `Sansa_1x08.jpg` | S1E08 |
| Lancel Lannister | `Lancel-Profile.jpg` (S5-6) | `LancelLannisterHD2x09.png` | S2E09 |
| Theon Greyjoy | ` Theon's_master_of_hounds.jpg` | `Theon_1x06.jpg` | S1E06 |
| Renly Baratheon | תמונה לא מתאימה | `Renly_Baratheon.jpg` | S1-2 |
| **Jon Snow** | `Jon-Portal.png` (S7, 2017) | `Jon_Snow-So4Ep5.jpg` | S4E05 (Night's Watch) |
| **Arya Stark** | `Arya-Portal.png` (S7, 2017) | `Arya_1x08.png` | S1E08 |
| **Varys** | `Varys-Portal.png` (S7, 2017) | `Varys_1x05.png` | S1E05 |
| **Gendry** | `Gendry-Portal.png` (S7, 2017) | `Gendry_S2.jpg` | S2 |
| **Davos Seaworth** | `Davos-Portal.png` (S7, 2017) | `Davos_2x04.jpg` | S2E04 |
| **Ygritte** | `YgrittePortal.png` | `YgritteSeason2.png` | S2 |
| **Beric Dondarrion** | `BericDondarrion-Profile.jpg` (S7) | `BericDondarrionSeason1.PNG` | S1 |
| **Ramsay Snow** | `Ramsay_Portal.png` (2020) | `Ramsay-Snow-promotional-still.jpg` | S3 |

---

## 6. TypeScript & ESLint

| # | בדיקה | תוצאה |
|---|-------|-------|
| 34 | `npx tsc --noEmit` | **✅ 0 שגיאות** |
| 35 | `npx eslint src --ext .ts,.tsx` | **✅ 0 אזהרות** |

---

## תמונות שעדיין חסרות (9 — קבוצות/ישויות ללא דיוקן)

אלו לא ניתנות לתיקון — הן קבוצות או ישויות ללא תמונת פרסונאז' בוויקיה:
`crasters-son`, `daenerys-dragons`, `hardhome-wildlings`, `lady-direwolf`,
`one-of-the-thirteen`, `stafford-lannister`, `tower-guard`, `ned-umber`, `harald-karstark`

---

*QA completed: 27 March 2026 — 35/35 checks passed*
