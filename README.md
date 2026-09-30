# 8-Bit RPG-Style Portfolio

A unique, retro-themed personal portfolio built with React 19, Vite, and Tailwind CSS v4. The app features an interactive 8-bit RPG-style Graphical User Interface (GUI) driven by custom WebGL physics, CSS scroll snapping, draggable bulletin boards, and a secret mini-game easter egg!

## Features

- **8-Bit RPG Interface**: Vintage fantasy OS styling with CSS `snap-y` full-page scrolling, smooth section navigation, and an interactive taskbar with a live system clock.
- **Custom WebGL Background (`PixelWater`)**: An interactive 2D/3D WebGL water simulation with sprite kinematics, dynamic wave physics, and cursor splash interactions (with toggle in system settings).
- **Draggable Skills Bulletin Board**: Interactive wooden corkboard with freely draggable and pinnable parchment notes for technical skills and toolsets.
- **Town Ledger (Projects Showcase)**: Paginated fantasy ledger presenting projects, descriptions, and live GitHub/demo links.
- **Interactive Mini-Game Easter Egg**: Secret arcade mini-game accessible via the Konami-style secret sequence (type `veol` anywhere on the page) to shoot bugs and debug the matrix.
- **Retro Audio/Visual Flourishes**: Pixelated typography, animated water droplets, immersion loading screen, and retro-themed UI buttons.

## Tech Stack

- **Framework**: React 19 (`react` & `react-dom` 19.3)
- **Bundler & Tooling**: Vite 8 (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`, PostCSS, Autoprefixer)
- **Graphics**: Raw WebGL (GLSL Shaders) & HTML5 2D Canvas
- **Analytics**: `@vercel/analytics`
- **Linting**: ESLint 10

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/portfolio.git
cd portfolio
npm install
```

### Development

Run the local Vite development server:

```bash
npm run dev
```

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Linting

Check code quality with ESLint:

```bash
npm run lint
```

## Project Structure

```text
portfolio/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Pixel art sprites, textures, and images
│   ├── components/
│   │   ├── AboutSection.jsx    # Character profile, bio, and social/contact links
│   │   ├── HeroSection.jsx     # Landing hero title banner and splash typography
│   │   ├── LoadingScreen.jsx   # World generation / loading sequence screen
│   │   ├── MiniGame.jsx        # Canvas-based bug shooter mini-game easter egg
│   │   ├── ProjectLedger.jsx   # Paginated fantasy project ledger
│   │   ├── SkillsBoard.jsx     # Draggable bulletin board with parchment skill notes
│   │   └── Taskbar.jsx         # Top system bar with real-time clock and settings
│   ├── data/
│   │   └── projects.js     # Project data and repository links
│   ├── hooks/
│   │   └── useVeolCode.js  # Keyboard listener hook triggering secret easter eggs
│   ├── App.jsx             # Root component and Vercel Analytics integration
│   ├── index.css           # Tailwind CSS imports and global styles
│   ├── main.jsx            # React root mount
│   ├── PixelWater.jsx      # WebGL canvas water simulation and splash physics
│   └── StartupIntro.jsx    # Optional retro boot intro sequence
├── eslint.config.js        # ESLint flat config
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite and Tailwind configuration
```

## Easter Eggs

- **Secret Mini-Game**: Type `v` `e` `o` `l` on your keyboard anywhere on the page to launch the hidden bug-blasting mini-game.
- **Water Physics Toggle**: Open the **Settings** menu on the top-left of the taskbar to toggle the WebGL water simulation on or off.
