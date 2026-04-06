# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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
