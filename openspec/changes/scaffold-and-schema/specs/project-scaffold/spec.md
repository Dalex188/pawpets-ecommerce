# Project Scaffold Specification

## Purpose

Initialize a Next.js 14+ App Router project with TypeScript strict mode, Tailwind CSS, path aliases, and a standardized folder structure. This is the foundation all other modules build on.

## Requirements

### Requirement: Project Initialization

The project MUST initialize with Next.js 14+ (App Router), TypeScript strict mode, and Tailwind CSS.

#### Scenario: Dev server starts clean

- GIVEN a freshly scaffolded project with all dependencies installed
- WHEN `npm run dev` is executed
- THEN the dev server starts on port 3000 without compilation errors

#### Scenario: TypeScript strict mode

- GIVEN the project's tsconfig.json
- WHEN inspected
- THEN `compilerOptions.strict` MUST be `true`

### Requirement: Path Aliases and Folder Structure

The project SHALL configure `@/` as a path alias mapping to `./src/*` and SHALL use a convention: `src/app/` for routes, `src/components/` for UI, `src/lib/` for utilities, `src/types/` for shared types.

#### Scenario: Alias resolution works

- GIVEN a file importing `@/components/Button`
- WHEN the project compiles
- THEN it resolves to `./src/components/Button`

#### Scenario: Folder convention exists

- GIVEN the src directory
- WHEN inspected
- THEN `src/app`, `src/components`, `src/lib`, and `src/types` directories exist
