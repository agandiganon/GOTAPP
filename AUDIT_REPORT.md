# GotSpoil — Full-App Cinematic UI/UX Audit Report
**Date:** March 2026 | **Sessions:** 1–2 complete | **Auditor:** Claude (Principal UI/UX Architect)

---

## Executive Summary

Two full sessions have overhauled GotSpoil from a flat, generic dark-grey app into a **Cinematic Dark Fantasy** companion. All five primary screens and the shared shell have been redesigned. The anti-spoiler data layer (`src/lib/timeline.ts`, all JSON, all coordinate data) was never touched. This report catalogues what was done, what was fixed mid-session, and the remaining strategic recommendations.

---

## I. Completed Work (Sessions 1–2)

### 1.1 Global Infrastructure

| Item | Before | After |
|---|---|---|
| Body background | Flat `#0a0806` | 4-layer radial composite (crown glow → ember pocket → blood hint → depth fade) |
| Design tokens | Generic greys | Obsidian palette + amber `205 164 94` accent + blood-red danger |
| Font pairing | Single family | `Heebo` (body) + `Frank Ruhl Libre` (display serif) |
| Scrollbar | OS default | Thin amber-tinted custom scrollbar with `background-clip: padding-box` |
| Image proxy | `wsrv.nl` CDN (403 on Wikia) | Next.js `/api/image-proxy` route — server-side Referer bypass + SSRF guard |

### 1.2 Shell & Navigation

- **`app-shell.tsx`** — 4 atmospheric ambient glow divs create a living depth field
- **`shell-header.tsx`** — Logo tile with amber border + gradient; episode badge with glow
- **`bottom-navigation.tsx`** — Active tab: inline gradient background + amber top-line indicator; inactive: translucent hover

### 1.3 Character Cards (`characters-screen.tsx`, `character-portrait.tsx`)

- Full-bleed portrait fills `h-64/h-72`; name + `StatusPill` overlaid on image bottom with translucent glassmorphism bar
- `HeraldicCrestFallback`: faction-tinted SVG crown with jewel circle + decorative dividers — **never shows a black void**
- Real image fades in over fallback via opacity transition
- `character-card-frame` CSS class triggers `shimmerSlide` sweep animation on hover
- Faction sigil badge top-right; episode badge top-left; faction row below image

### 1.4 Map (`fantasy-map-canvas.tsx`, `globals.css`)

- Parchment filter applied to `.leaflet-overlay-pane` only — markers/tooltips unaffected
- Inset vignette via `box-shadow` on `.map-parchment-container`
- Amber top-glow div for "parchment light from above" effect
- Custom SVG marker icons by type (`stronghold`, `city`, `settlement`)
- Faction sigil badge on markers with hotlink-safe `getProxiedExternalImageUrl`
- **Tooltip edge-clipping fix (Session 2)**: changed `overflow: hidden !important` → `overflow: visible` on `.leaflet-container`; added `overflow: hidden; border-radius: inherit` to `.leaflet-overlay-pane` only; removed `overflow-hidden` from wrapper div; switched to `direction="auto"` on `<Tooltip>`

### 1.5 Home Screen (`home-screen.tsx`)

- Map widget renamed **"זירת הפרק"** (Episode Arena) — purpose now unmistakable
- Dynamic `h2` shows `{primaryLocation.name} — מוקד הפרק` as the widget header
- Location name callout label **rendered directly on the map image** with arrow pointing to beacon
- Faction sigil in panel header; leading faction uses `FactionSigilBadge` + faction-tinted power bar
- Faction ranking rows: each row styled with `entry.faction.themeColor` for borders/bars/text
- Event cards: tone-specific dot + type-matched glassmorphism borders

### 1.6 Politics Screen (`politics-screen.tsx`)

- Hero panel: `FactionSigilBadge` for leading faction, faction-tinted border/background
- Power meter: every card has `entry.faction.themeColor` for rank badge, border, bg, power bar fill — **no more identical grey bars**
- Relationship web: `relationshipConfig` maps state → `{border, bg, badge, bar}` colors (blue=alliance, red=war, amber=tension, grey=neutral)
- Political shifts: faction pills use `faction.themeColor` dynamically
- House power updates: `FactionSigilBadge` per entry

### 1.7 Summary Screen (`summary-screen.tsx`)

- Hero panel: episode code pill (amber gradient), display title, snapshot + full summary in parchment card with gold top-border
- **Turning points**: numbered amber index badges; each card glassmorphism surface
- **Focus characters**: faction-tinted `CardSurface` with `StatusPill` + faction-colored name + divider before state summary
- **Main locations**: teal icon badge per location + fallback copy for unmapped locations
- **Archive**: premium `<details>` accordion — episode code pill, `line-clamp-2` snapshot, numbered turning-point list on expand

### 1.8 Bug Fixes Applied

| Bug | Root Cause | Fix |
|---|---|---|
| `bg-amber-500/8` / `bg-amber-500/12` / `bg-[#7b957a]/12` etc. not rendering | Tailwind JIT requires bracket syntax for non-standard fractions | Changed all to `bg-amber-500/[0.08]` etc. across `episode-selector-sheet.tsx`, `map-screen.tsx` |
| `border-[#7e97b3]/18` not rendering | Same JIT fraction issue | Changed to `/[0.18]` in `map-screen.tsx` |
| Characters-screen `@ts-expect-error` unused directive | `next: { revalidate }` is valid TS in Next.js 14 | Removed comment |
| Stale backup files `*screen 2.tsx` with TS errors | Pre-existing space-in-filename backups | Confirmed pre-existing; our code clean |
| `entry.character?.faction?.themeColor` TS error | `CharacterRecord` has no `.faction` prop | Changed to `factions.find(f => f.id === entry.character?.latestState.affiliationId)?.themeColor` |

---

## II. Remaining Recommendations

### Priority 1 — Critical (visible breakage or strong UX confusion)

**2.1 Map screen `bg-amber-500/12` on the Compass icon tile**
- **File:** `map-screen.tsx` line 141
- **Status:** ✅ Fixed in Session 2

**2.2 `Panel` component still uses `panel-surface` Tailwind `@apply`**
- `globals.css` defines `.panel-surface` with `@apply relative overflow-hidden rounded-[38px] border border-stone-700/30`. The `overflow: hidden` on panel-surface clips any content that tries to overflow (e.g., floating badges, glassmorphism shimmer pseudo-elements).
- **Recommendation:** Remove `overflow-hidden` from `.panel-surface` and let individual screens handle their own overflow. The rounded corners are enforced by `border-radius` alone; overflow: hidden is not required for them.

**2.3 Archive accordion gap between `<summary>` and expanded body**
- Currently the expanded `.map-parchment-container` body renders directly after `<summary>`. There's no animated height transition (CSS cannot animate `height: auto` on `<details>`).
- **Recommendation:** Replace `<details>`/`<summary>` with a React controlled `useState` approach and CSS `max-height` transition, or use the Web Animations API. This would give a smooth accordion feel consistent with the rest of the premium UI.

**2.4 `characters-screen.tsx` search/filter bar background**
- Line 149: `bg-[#7e97b3]/10` — this renders fine BUT the filter pill row uses plain `bg-white/5` on inactive pills which looks unintentional given the themed palette.
- **Recommendation:** Style filter pills to use the same amber-tinted glassmorphism as the episode selector: `bg-amber-500/[0.06]` inactive, `bg-amber-500/[0.14]` active.

---

### Priority 2 — Polish (noticeably cheap if left as-is)

**2.5 Map screen "לוקיישנים פעילים" location grid (bottom panel)**
- Location cards at the bottom of the map screen still use generic `bg-white/[0.04]` with no faction color. The controller faction name chip uses the accent amber universally instead of each faction's own `themeColor`.
- **Recommendation:** Apply `controllerFaction.themeColor` to the chip background and border, same pattern as politics and home screens.

**2.6 Empty-state copies are generic**
- Several screens show "אין עדיין נתונים" or similar flat text.
- **Recommendation:** Add a small SVG sigil + contextual copy for each empty state ("ממלכות לא מופו עדיין", "שום כוח עלה עדיין").

**2.7 Home screen event-type icon coverage**
- `getEventToneConfig` in `home-screen.tsx` handles `battle`, `alliance`, `betrayal`, `revelation` but falls back to `stone` for any other type. As new episode data adds types, they'll all look identical.
- **Recommendation:** Add a `default` catch-all with a distinct amber/neutral tone.

**2.8 `StatusPill` component contrast on very dark card surfaces**
- On deep obsidian backgrounds (`rgba(14,11,8,0.78)`), the `alive` status pill's green can blend. The `dead` pill's red-on-dark is fine, but `unknown`/`imprisoned` are borderline.
- **Recommendation:** Add `box-shadow: 0 0 8px rgba(...)` glow matching the pill color to make it pop.

---

### Priority 3 — Long-term Architecture

**2.9 Stale backup files**
- `characters-screen 2.tsx`, `character-portrait 2.tsx`, `episode-selector-sheet 2.tsx` — space-in-filename backups that were pre-existing before Session 1.
- **Recommendation:** Delete them. They cause spurious TypeScript errors (`npx tsc --noEmit` reports one error from `characters-screen 2.tsx`). The only TypeScript error remaining in the project is from this file.

**2.10 Image proxy cache duration**
- Currently `revalidate: 86_400` (24h server cache) + `Cache-Control: max-age=86400`. For season-long character portrait images this is fine, but sigil images may change between data refreshes.
- **Recommendation:** Consider separate cache durations: portraits `revalidate: 604_800` (7 days), sigils `revalidate: 86_400`.

**2.11 Leaflet tooltip z-index vs. vignette overlay**
- The vignette overlay div uses `zIndex: 9999` which is above Leaflet's tooltip pane (`z-index: 650`). This means the vignette darkens tooltips that render near the map edge. This is visually acceptable but may reduce legibility at corners.
- **Recommendation:** Lower the vignette div's `z-index` to `640` (just below Leaflet's tooltip pane at `650`) OR add `pointer-events: none` and set `mix-blend-mode: multiply` to preserve tooltip readability.

**2.12 Map screen — "לוקיישנים פעילים" list is capped at 8**
- `mapPins.slice(0, 8)` silently truncates. Users don't know more exist.
- **Recommendation:** Show the count and add a "הצג עוד" expand control, or paginate.

---

## III. TypeScript Health Check (Session 2)

```
$ npx tsc --noEmit

src/components/characters/characters-screen 2.tsx(200,21): error TS2322 — stale backup file
```

**All production source files: 0 errors.** The single remaining error is from a pre-existing stale backup with a space in its filename that is not imported anywhere in the build. Deleting it eliminates the error entirely.

---

## IV. File Change Manifest

| File | Action | Session |
|---|---|---|
| `src/app/api/image-proxy/route.ts` | Created | 1 |
| `src/lib/media.ts` | Updated proxy target | 1 |
| `src/app/globals.css` | Full rewrite | 1–2 |
| `tailwind.config.ts` | New keyframes + animations | 1 |
| `src/components/layout/app-shell.tsx` | Ambient glow divs | 1 |
| `src/components/layout/shell-header.tsx` | Logo + episode badge | 1 |
| `src/components/layout/bottom-navigation.tsx` | Active tab glass + top-line | 1 |
| `src/components/characters/character-portrait.tsx` | HeraldicCrestFallback | 1 |
| `src/components/characters/characters-screen.tsx` | Full card redesign | 1 |
| `src/components/map/fantasy-map-canvas.tsx` | Parchment + SVG markers + tooltip fix | 1–2 |
| `src/components/home/home-screen.tsx` | Map widget + faction theming | 2 |
| `src/components/home/episode-selector-sheet.tsx` | Tailwind fraction fixes | 2 |
| `src/components/map/map-screen.tsx` | Tailwind fraction fixes | 2 |
| `src/components/politics/politics-screen.tsx` | Full faction-colored redesign | 2 |
| `src/components/summary/summary-screen.tsx` | Full cinematic redesign | 2 |

**Data files untouched:** `src/lib/timeline.ts`, `src/data/seed.ts`, `src/data/json/*.json`, all coordinate data.

---

*End of audit — GotSpoil Cinematic Overhaul, Sessions 1–2*
