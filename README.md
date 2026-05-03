# Terminal Portfolio

A terminal-themed personal portfolio built with React, Vite, and Tailwind CSS. The app opens with a boot-style intro, then drops into a retro command-line experience with an optional graphical portfolio mode, animated effects, and project highlights.

## Features

- Boot sequence intro with skip support
- Interactive terminal UI with command history
- Commands for `whoami`, `skills`, `projects`, `help`, `clear`, `theme`, `matrix`, and `startx`
- Graphical portfolio mode with a full-screen space exploration scene
- Matrix-style visual effect for the terminal view
- Responsive layout and custom styling built for a portfolio presentation

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- Canvas-based animations

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

Run linting:

```bash
npm run lint
```

## Project Structure

- `src/App.jsx` handles the terminal experience and app flow
- `src/StartupIntro.jsx` renders the boot screen
- `src/PortfolioGUI.jsx` renders the graphical portfolio mode
- `src/MatrixRain.jsx` provides the matrix animation effect
- `src/index.css` contains global styling

## Notes

The portfolio is designed to feel like a fictional operating system while still presenting real projects, skills, and contact links.
