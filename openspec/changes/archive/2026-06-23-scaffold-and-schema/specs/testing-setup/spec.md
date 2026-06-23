# Testing Setup Specification

## Purpose

Configure Vitest as the test runner with React plugin support and provide one passing smoke test to verify the setup works end-to-end.

## Requirements

### Requirement: Vitest Configuration

The project MUST provide a `vitest.config.ts` using `@vitejs/plugin-react` and a `test` script in `package.json` that runs `vitest run`.

#### Scenario: Test script passes

- GIVEN Vitest is configured with plugin-react
- WHEN `npm run test` is executed
- THEN all tests pass with exit code 0

### Requirement: Basic Smoke Test

The project MUST include at least one test file with a basic assertion that verifies the test runner functions correctly.

#### Scenario: Smoke test runs

- GIVEN a test file at `__tests__/setup.test.ts`
- WHEN Vitest executes it
- THEN the test asserts `true === true` and reports as passed

#### Scenario: Module resolution works in tests

- GIVEN a test file imports a utility via `@/` alias
- WHEN Vitest executes the test
- THEN the import resolves without errors
