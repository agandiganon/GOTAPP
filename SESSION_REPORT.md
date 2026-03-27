# gotspoil — דוח שינויים מקיף
## סיכום סשן עבודה — 27 מרץ 2026

---

## ✅ בדיקות

| בדיקה | תוצאה |
|-------|-------|
| TypeScript (`npx tsc --noEmit`) | **✅ 0 שגיאות** |
| ESLint | **✅ 0 אזהרות** |

---

## 1. תיקון תמונות דמויות (Anti-Spoiler Audit)

### תמונות שתוקנו — מניעת ספוילרים

| דמות | לפני | אחרי | הסבר |
|------|------|------|------|
| **Tyrion Lannister** | `Tyrion-Portal.png` (S7+) | `Tyrion_S2Promo.jpg` | תמונת פרומו עונה 2, Hand of the King |
| **Sansa Stark** | `Sansa-Portal.png` (S7) | `Sansa_1x08.jpg` | S1E08 — ללא ספוילר |
| **Lancel Lannister** | `Lancel-Profile.jpg` (S5-6, sparrow) | `LancelLannisterHD2x09.png` | S2E09 — לפני ההמרה הדתית |
| **Renly Baratheon** | תמונה לא מתאימה | `Renly_Baratheon.jpg` | S1-2 era |
| **Theon Greyjoy** | `Theon's_master_of_hounds.jpg` (לא ברור) | `Theon_1x06.jpg` | S1E06 — תמונה נקייה |
| **Jaime Lannister** | URL חסר `/revision/latest` → 404 | תוקן עם הסיומת הנכונה | תמונה עובדת |
| **Samwell Tarly** | URL חסר `/revision/latest` → 404 | תוקן | תמונה עובדת |
| **Sandor Clegane** | URL חסר `/revision/latest` → 404 | תוקן | תמונה עובדת |

### כיסוי תמונות סופי

```
סה"כ דמויות:  166
יש תמונה:     157  (94.6%)
חסרות תמונה:    9  (5.4%)
```

**9 הדמויות ללא תמונה** הן קבוצות/ישויות ללא דיוקן ייעודי בוויקיה:
`crasters-son`, `daenerys-dragons`, `hardhome-wildlings`, `lady-direwolf`,
`one-of-the-thirteen`, `stafford-lannister`, `tower-guard`, `ned-umber`, `harald-karstark`

---

## 2. הסרת תג פרק מכרטיסי דמויות

**בוצע:** הוסר תג "עד S02E05" שהופיע בפינה שמאל-עליונה של כל תמונת דמות.

הפוטר עם "עד פרק X" נשמר ומוצג בצורה עדינה בתחתית הכרטיס — ללא תג גדול מסיח דעת על התמונה עצמה.

```tsx
// הוסר מ-characters-screen.tsx:
{/* Top-left episode badge */}
<div className="absolute left-3.5 top-3.5 rounded-full border ...">
  עד {currentEpisode.code}
</div>
```

---

## 3. עיצוב חדש — "THE REALM" Design System v3

### פלטת צבעים חדשה

| משתנה | ערך RGB | תיאור |
|-------|---------|-------|
| `--color-canvas` | `8 10 16` | Deep slate-navy obsidian (רקע ראשי) |
| `--color-canvas-soft` | `14 17 26` | רקע רך |
| `--color-panel` | `20 24 36` | פאנלים |
| `--color-panel-strong` | `28 33 50` | פאנלים חזקים |
| `--color-accent` | `210 168 90` | זהב בוהק — נחושת מוצהבת |
| `--color-ink` | `232 228 220` | טקסט ראשי — לבן חמים |
| `--color-ice` | `130 160 195` | כחול קרח — Night's Watch |

**שינוי מהותי:** מ-"near-black amber" (`5 4 3`) → "deep slate-navy obsidian" (`8 10 16`) עם גוון כחול.

### פונטים

| פונט | שימוש | משתנה |
|------|-------|-------|
| **Cinzel** | כותרות, תגיות, טקסט נוי (Latin) | `--font-cinzel` |
| **Frank Ruhl Libre** | שמות דמויות, כותרות ראשיות | `--font-display` |
| **Heebo** | גוף טקסט כללי | `--font-heebo` |

### CSS Classes חדשים

- `.shell-frame` — מסגרת ראשית עם border זהוב עדין ו-backdrop blur
- `.panel-surface` — פאנל כהה עם גרדיאנט ו-glassmorphism
- `.got-divider` — מפריד זהוב דקורטיבי
- `.got-input` — שדה חיפוש עם עיצוב GOT
- `.got-pill` — כפתור pill לסינון/מיון
- `.bottom-nav-bar` / `.bottom-nav-item` / `.is-active` — ניווט תחתון
- `.text-caption` — Cinzel font קטן, letter-spacing רחב

---

## 4. גרסת אתר דסקטופ

### ארכיטקטורה

הוספה תמיכה מלאה בדסקטופ עם CSS Grid responsive:

```
מובייל (< 768px):          דסקטופ (≥ 768px):
┌──────────────────┐        ┌──────────┬─────────────────────┐
│   shell-frame    │        │ sidebar  │  desktop-content    │
│  ┌─────────────┐ │        │  (240px) │  (1fr)              │
│  │ ShellHeader │ │   →    │          │                     │
│  │  children   │ │        │  לוגו    │  children           │
│  └─────────────┘ │        │  ניווט   │                     │
│ [bottom-nav-bar] │        │  פרק     │                     │
└──────────────────┘        └──────────┴─────────────────────┘
```

### קבצים חדשים / מעודכנים

**`src/components/layout/desktop-sidebar.tsx`** *(חדש)*
- לוגו + wordmark "gotspoil" עם Cinzel font
- רשימת ניווט עם אייקונים + שמות בעברית + תרגום קצר באנגלית
- תג פרק נוכחי בתחתית הסיידבר
- hover/active states עם צבעי זהב

**`src/components/layout/app-shell.tsx`** *(מעודכן)*
- Wrapper עם className `desktop-shell`
- מציג `DesktopSidebar` — נסתר על מובייל (`display: none` → `display: flex` ב-768px+)
- `desktop-hide-on-desktop`: mobile frame + BottomNavigation — נסתרים בדסקטופ
- `desktop-show-on-desktop`: area תוכן דסקטופ — מוצגת רק ב-768px+

**`src/app/globals.css`** *(מעודכן — CSS חדש)*
```css
@media (min-width: 768px) {
  .desktop-shell {
    display: grid;
    grid-template-columns: 240px 1fr;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
  }
  .desktop-sidebar { display: flex; flex-direction: column; ... }
  .desktop-nav-item { ... }
  .desktop-content-area { padding: 2.5rem 2rem; }
  .character-grid-desktop { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}
@media (min-width: 1100px) {
  .desktop-shell { grid-template-columns: 260px 1fr; max-width: 1400px; }
}
```

**`src/components/characters/characters-screen.tsx`** *(מעודכן)*
- Grid תמונות דמויות קיבל class `character-grid-desktop` — בדסקטופ, עמודות אוטומטיות `minmax(260px, 1fr)` במקום 2 עמודות קבועות

---

## 5. נתוני Timeline — הוספות

הוספו **20 ערכי timeline** חדשים לדמויות:

| דמות | ערכים שנוספו |
|------|-------------|
| Daario Naharis | S04E01, S05E09, S06E10 |
| Podrick Payne | S05E03, S07E07, S08E04, S08E06 |
| Tormund Giantsbane | S06E01, S07E06, S08E03, S08E06 |
| Lancel Lannister | S06E01 (Faith Militant), S06E10 (מת) |
| Hizdahr zo Loraq | S05E08, S05E09 (מת) |
| Edmure Tully | S03E09 (שבוי), S06E08, S08E06 |
| Jaqen H'ghar | S05E10, S06E08 |

---

## 6. תיקון מפה (Fantasy Map Canvas)

- **הוסר `<Popup>` של Leaflet** — גרם לקיפאון בגלילה
- **נוסף state `selectedPin`** ב-React — מציג `LocationInfoPanel` מחוץ לעץ Leaflet
- **תוקנו tooltip directions** — חישוב סטטי לפי אחוזי מיקום על המפה
- **CSS classes** `.map-info-panel`, `.animate-map-panel-in`, `.is-selected` — הוספו ל-globals.css

---

## 7. רשימת כל הקבצים שנשתנו

```
src/app/globals.css                              ← ריאיצוב מלא (Design System v3)
src/app/layout.tsx                               ← הוסף Cinzel font
tailwind.config.ts                               ← הוסף cinzel fontFamily + iron-glow
src/components/layout/app-shell.tsx              ← תמיכת desktop grid
src/components/layout/bottom-navigation.tsx      ← CSS classes חדשים
src/components/layout/shell-header.tsx           ← עיצוב חדש עם Cinzel
src/components/layout/desktop-sidebar.tsx        ← קובץ חדש (!)
src/components/characters/characters-screen.tsx  ← הסרת תג פרק + עיצוב + desktop grid
src/components/map/fantasy-map-canvas.tsx        ← תיקון panning freeze
src/data/json/characters.json                    ← 63 תמונות חדשות + תיקון 8 ספוילרים + 20 timeline entries
```

---

*Generated: 27 March 2026*
