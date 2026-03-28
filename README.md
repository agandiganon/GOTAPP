# GotSpoil 🛡️

**מלווה צפייה נטול ספוילרים | Spoiler-Free Viewing Companion**

A spoiler-free Game of Thrones companion app that lets you explore the world of Westeros at your own pace. Browse characters, explore the interactive map, follow political dynamics, and read episode summaries—all without spoilers beyond your current episode. Built with Hebrew-first RTL design and a copper-gold visual aesthetic.

<!-- Add screenshots here -->

## Features

- **Spoiler-Free Timeline** — Content dynamically adapts to your selected episode, ensuring you never encounter unwanted spoilers
- **Character Encyclopedia** — Detailed character profiles with portraits, biographical information, and status tracking throughout the series
- **Interactive Fantasy Map** — Explore Westeros with location markers and geographical context
- **Political Dynamics** — Track faction relationships, alliances, and the shifting balance of power
- **Episode Summaries** — Read comprehensive summaries and key narrative events for each episode
- **Quiz Mode** — Test your knowledge with spoiler-aware trivia
- **PWA Support** — Installable on mobile devices for offline access
- **Full Hebrew RTL Interface** — Complete right-to-left support with copper-gold design system

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Leaflet** (interactive maps)
- **React Leaflet** (Leaflet integration)
- **Lucide React** (icons)
- **PWA with Service Worker** support

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/gotspoil.git
cd gotspoil
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layout
├── components/       # React components (organized by feature)
├── data/            # JSON data and TypeScript schemas
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helper functions
├── providers/       # React context providers
└── public/          # Static assets
```

### Key Directories

- **`src/components/home`** — Homepage and dashboard components
- **`src/components/layout`** — App shell and navigation
- **`src/data/`** — Character, location, faction, and episode data
- **`src/providers/`** — Episode selection context for spoiler management

## Design System

The app features a copper-gold visual design language optimized for dark mode viewing. Typography uses:

- **Heebo** — Body text and UI (Hebrew-optimized sans-serif)
- **Frank Ruhl Libre** — Display headings (Hebrew-optimized serif)
- **Cinzel** — Ornamental titles and accents (Roman numerals, Latin-only)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

Built with passion for Game of Thrones fans who want to explore Westeros without fear of spoilers.
