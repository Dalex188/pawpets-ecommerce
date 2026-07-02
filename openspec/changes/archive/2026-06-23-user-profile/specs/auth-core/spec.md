# Delta for Auth Core

## ADDED Requirements

### Requirement: Auth Guard for Protected Pages

Protected server components MUST call `auth()` and redirect to `/login` when the session is null. The redirect SHALL use Next.js `redirect()` from `next/navigation`.

#### Scenario: Authenticated access

- GIVEN a protected page like `/perfil`
- WHEN `auth()` returns a valid session
- THEN the page continues rendering normally

#### Scenario: Unauthenticated redirect

- GIVEN a protected page like `/perfil`
- WHEN `auth()` returns null
- THEN the page calls `redirect("/login")` and never renders
