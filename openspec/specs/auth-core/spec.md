# Auth Core Specification

## Purpose

Establish the authentication skeleton: NextAuth.js v5 configuration with PrismaAdapter, session provider wrapper, and role-based JWT augmentation. Auth route handlers are deferred to a later module.

## Requirements

### Requirement: Auth Configuration

The system MUST provide a NextAuth.js v5 configuration object with PrismaAdapter and a JWT callback that augments the token with the user's role.

#### Scenario: AuthOptions exported with adapter

- GIVEN the auth config at `src/lib/auth.ts`
- WHEN imported
- THEN it exports a valid AuthOptions object with PrismaAdapter attached

#### Scenario: JWT contains role field

- GIVEN a user with role ADMIN signs in
- WHEN the JWT callback executes
- THEN the resulting token contains `role: "ADMIN"`

### Requirement: Session Provider Wrapper

The system MUST provide a `ClientSessionProvider` component wrapping NextAuth's `SessionProvider`, and the root layout MUST render it so session context is available app-wide.

#### Scenario: Session context available in client components

- GIVEN the root layout wraps children in ClientSessionProvider
- WHEN a client component calls `useSession()` from `next-auth/react`
- THEN it returns a session object without errors

#### Scenario: Provider does not break SSR

- GIVEN the ClientSessionProvider wrapping the app
- WHEN the home page is server-rendered
- THEN no hydration errors occur and the page renders normally
