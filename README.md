# 8-Bit RPG-Style Portfolio

A unique, retro-themed personal portfolio built with React, Vite, and Tailwind CSS. The app features an interactive 8-bit RPG-style Graphical User Interface (GUI) driven by WebGL and CSS scroll snapping, with a fully functional retro command-line terminal hidden as an easter egg for those who explore!

## Features

- **8-Bit Graphical GUI**: Includes CSS `snap-y` scrolling, a dynamic spy-scroll side navigation, and a hidden top taskbar with a live system clock.
- **WebGL Backgrounds**: Uses a custom 2D/3D WebGL background (`PixelWater`) with sprite kinematics.
- **Immersive Boot Sequence**: An authentic, skip-able boot sequence (`StartupIntro`) that sets the retro mood before dropping you into the GUI.
- **Hidden Terminal Easter Egg**: By accessing the top taskbar, you can dive into a secret terminal featuring command history, system stats, Matrix code-rain, and multiple unlockable themes (`cyberpunk`, `hacker`, etc.).

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Raw WebGL / HTML5 Canvas

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

- `src/App.jsx` — Entry point, state router, and the engine for the hidden Terminal easter egg.
- `src/PortfolioGUI.jsx` — The main 8-bit graphical mode featuring CSS scroll snapping and the top taskbar.
- `src/PixelWater.jsx` — Raw WebGL background with animated sprites adjusting to canvas matrices.
- `src/StartupIntro.jsx` — Renders the classic CLI boot sequence screen.
- `src/MatrixRain.jsx` — Provides the canvas-based matrix digital rain effect.
- `src/data/commands.js` — Centralized dictionary for terminal commands and outputs.

## Notes

Designed to emulate a customized vintage operating system (Veol-OS) while still effectively presenting real projects, skills, and contact links through modern web technologies.
