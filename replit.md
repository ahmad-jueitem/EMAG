# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Includes the **EMag Ultimate Command Center** — a professional-grade electromagnetics study app for Princess Sumaya University Electromagnetics I.

## EMag Command Center (`artifacts/emag-command-center`)

**Stack:** React + Vite, Tailwind CSS, KaTeX, Framer Motion, React Three Fiber / Three.js  
**Port:** 18109 | **Preview:** `/`

### Features
- **Universal Solver** — 12 problem types with physics guardrails, step-by-step KaTeX solutions, Framer Motion layout transitions. After each solution, a **live 3D field visualization** appears (React Three Fiber): point charge flux lines, Gaussian sphere with radial arrows, Ampere line current with circular H-field rings, toroid with coil windings, capacitor with animated field particles, wave propagation scene, generic field grid.
- **3D Field Visualizer** — React Three Fiber: dedicated tab with point charge E-field, electric dipole, magnetic wire B-field with vector arrows, orbit controls
- **Coordinate Transformer** — Cartesian ↔ Cylindrical ↔ Spherical point and vector transforms with full math
- **Exam Mode** — 20-min timed mock exam, dot progress bar, chapter breakdown, mistake review with PDF references
- **Knowledge Base** — 8 chapters with KaTeX equations, searchable
- **Flashcards** — shuffle, chapter filter
- **Pro Quiz** — 160 questions (20/chapter × 8 chapters: 5 Theory/10 Calculation/5 Edge), KaTeX solution reveal, retry-wrong, localStorage mastery tracking (`emag-quiz-mastery-v2`)
- **Constants & Unit Converter** — 6 constants, 5 converters
- **Learning Analytics** — Recharts dashboard: Bar chart of chapter mastery (color-coded green/yellow/grey), Radar chart of skill dimensions (Theory/Calculation/Edge/Consistency/Speed), adaptive weakness cards with one-click navigation to solver/flashcards/quiz
- **Resource Vault** — 8 worksheets × 4 problems = 32 total problems covering Ch1–Ch8, each with expandable KaTeX step-by-step solution, difficulty badges, and "Solve with Visualization" button linking to the Universal Solver
- **Sidebar** — Glassmorphism (backdrop-blur-2xl), Mastery Ring SVG, overall mastery pill, per-chapter mastery bars, Recently Used Solvers tracker; three nav sections: Core Modules / Advanced Tools / Study Intelligence

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### EMag Ultimate Command Center (`artifacts/emag-command-center`)

A high-performance electromagnetics study and calculation web app. Frontend-only (no backend needed).

**Stack**: React + Vite, Tailwind CSS, KaTeX, Framer Motion, Lucide React icons

**Theme**: Academic Dark Mode (deep blues/slates)

**Modules**:
1. **Universal Solver** — 12 problem types (Coulomb's Law, Gauss's Law, Ampere's Law for line/toroid, capacitance, energy density, skin depth, phase velocity, VSWR, Lorentz force). Step-by-step LaTeX solutions.
2. **Knowledge Base** — All 8 chapters from the EMag textbook (Princess Sumaya University) with key equations rendered in KaTeX, searchable, clickable chapter detail view.
3. **Flashcards** — 20 cards covering every major law and theorem. Flip to reveal, shuffle, chapter filter, known/unknown tracking.
4. **Auto-Quiz** — 12 multiple-choice questions with detailed explanations. Score tracking, chapter filter, graded results.
5. **Constants & Units** — All 6 fundamental EMag constants with copy-to-clipboard, plus 5-category unit converter (charge, length, B-field, frequency, E-field).

**Key files**:
- `src/data/formulas.ts` — all formulas, chapter data, solver problems, flashcards, quiz questions
- `src/lib/katex-utils.ts` — KaTeX rendering utility
- `src/components/Sidebar.tsx` — navigation sidebar
- `src/components/KatexRenderer.tsx` — KaTeX wrapper component
- `src/pages/SolverPage.tsx` — Universal Solver
- `src/pages/KnowledgePage.tsx` — Knowledge Base
- `src/pages/FlashcardsPage.tsx` — Flashcard system
- `src/pages/QuizPage.tsx` — Auto-Quiz
- `src/pages/ConstantsPage.tsx` — Constants & Unit Converter
