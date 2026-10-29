# 🌙 Tsukuyomi Watch (月読の監視)
### *A Japanese-Samurai-Themed Celestial Guide & Astrophotography Suite*

> *"Even in the deepest shadow, the celestial moon cuts the darkness like a blade."*

Tsukuyomi Watch is a hackathon-ready celestial guide and astrophotography companion built with a **dark Japanese ink-wash (Sumi-e / 墨絵)** aesthetic, honoring Tsukuyomi-no-Mikoto, the ancient Japanese god of the moon.

---

## ⛩️ Architectural Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Plain CSS with unified CSS custom properties (`--ink-*`, `--washi-*`, `--gold-moon`, `--vermilion`), delicate brushed borders, and responsive desktop/mobile shells
- **Icons**: Lucide React
- **Geospatial & Sky Mapping**: Leaflet & React Leaflet
- **Lunar Calculation**: SunCalc (real-time phase, angle, illumination fraction)
- **Backend**: Node.js + Express + TypeScript
- **Execution & Orchestration**: Concurrently + TSX

---

## 📁 Project Structure

```
tsukuyomi-watch/
├── .env.example                       # Environment configuration template
├── .gitignore                          # Excludes node_modules, dist, and .env
├── package.json                        # Monorepo/unified scripts & dependencies
├── tsconfig.json                       # Unified TypeScript compiler configuration
├── vite.config.ts                      # Vite config with /api reverse proxy
├── index.html                          # Root HTML with calligraphy fonts & metadata
├── README.md                           # Documentation & quick start guide
├── src/
│   ├── main.tsx                        # React DOM mounting entry point
│   ├── App.tsx                         # Modular root application shell wrapper
│   ├── types.ts                        # Shared TypeScript types for celestial data
│   ├── components/
│   │   └── AppShell.tsx                # Responsive samurai navigation shell & header
│   ├── features/
│   │   ├── watchtower/
│   │   │   └── Watchtower.tsx          # ISS tracking & Leaflet orbital map
│   │   ├── scroll/
│   │   │   └── CelestialScroll.tsx     # SunCalc lunar ephemeris & samurai chronicles
│   │   ├── spirit-lens/
│   │   │   └── SpiritLens.tsx          # Object vision & clan constellation lore
│   │   └── dojo/
│   │       ├── DojoDashboard.tsx       # Image restoration workspace & metrics
│   │       └── BeforeAfterSlider.tsx   # Interactive katana comparison slider
│   └── styles/
│       └── global.css                  # Sumi-e ink wash color tokens & components
└── server/
    ├── index.ts                        # Express server entry point with middleware
    └── routes/
        ├── iss.ts                      # ISS orbital telemetry & watchpost passes
        └── restore.ts                  # Astrophoto restoration alchemy & presets
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18.0.0 or later, v20+ / v22+ recommended)
- npm (v9.0.0 or later)

### 2. Installation
Navigate into the project directory and install all dependencies:
```bash
cd tsukuyomi-watch
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### 4. Running the Development Environment
Launch both the **Express backend** and **Vite frontend** concurrently with a single command:
```bash
npm run dev
```

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Express API**: [http://localhost:5000](http://localhost:5000)

*The Vite development server is preconfigured to automatically proxy `/api` requests to `http://localhost:5000`.*

---

## 🛠️ Individual Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Launches frontend and backend concurrently |
| `npm run dev:client` | Launches only the Vite frontend (`http://localhost:5173`) |
| `npm run dev:server` | Launches only the Express backend with hot reloading (`http://localhost:5000`) |
| `npm run build` | Compiles TypeScript and builds the production frontend into `/dist` |
| `npm run preview` | Previews the production build locally |

---

## 🏯 Feature Overview

### 1. 望楼 • Watchtower (`/features/watchtower`)
- **Orbital Citadel Tracking**: Real-time Leaflet map displaying current ISS latitude, longitude, and orbital footprint.
- **Watchpost Predictions**: Calculates flyover schedules across ancient Japanese watchtowers (Edo Castle, Mount Fuji, Kyoto Citadel).

### 2. 天巻 • Celestial Scroll (`/features/scroll`)
- **Mathematical Ephemeris**: Calculates real-time lunar illumination percentage, phase angle, and moon age using `suncalc`.
- **Samurai Directives**: Dynamic night tactics (e.g. Shinobi stealth advantage under New Moon vs. open honor under Full Moon).
- **Celestial Alignments**: Chronicle of upcoming meteor showers and planetary conjunctions.

### 3. 霊鏡 • Spirit Lens (`/features/spirit-lens`)
- **Deep-Sky Object Sight**: Interactive astrophotography canvas highlighting nebulae (M42), star clusters (Subaru / Pleiades), and constellations.
- **Clan Crest Lore**: Historic Samurai clan connections (e.g., Orion's Belt / Mitsuboshi as the emblem of the Mōri clan).

### 4. 道場 • Restoration Dojo (`/features/dojo`)
- **Interactive Blade Comparison**: Custom `BeforeAfterSlider` allowing real-time swipe comparison between raw noisy exposures and restored clarity.
- **Sumi-e Image Alchemy**: Controls for noise reduction, blade sharpness, void contrast, and star dehalo.

---

## 📡 Backend API Reference

- `GET /api/health` — Backend status and uptime check
- `GET /api/iss/current` — Current ISS coordinates, velocity, altitude, and sky realm
- `GET /api/iss/passes` — Upcoming watchpost passes and peak elevation
- `GET /api/restore/presets` — List available samurai restoration presets
- `POST /api/restore` — Submit image parameters for simulated denoising & metrics

---

## 📜 License
Developed for Hackathon prototyping under the MIT License.
