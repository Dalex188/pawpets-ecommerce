# Delta for Data Schema

## ADDED Requirements

### Requirement: Banner Model

The Prisma schema MUST add a `Banner` model with these fields:

| Field        | Type     | Constraints                          |
|-------------|----------|--------------------------------------|
| id          | String   | @id @default(cuid())                 |
| title       | String   | —                                    |
| imageUrl    | String   | —                                    |
| linkUrl     | String?  | optional                             |
| displayOrder| Int      | —                                    |
| isActive    | Boolean  | @default(true)                       |
| createdAt   | DateTime | @default(now())                      |
| updatedAt   | DateTime | @updatedAt                           |

The model MUST NOT have relations to other entities. The migration MUST be additive only (new table, no destructive changes).

#### Scenario: Migration creates Banner table

- GIVEN the current Prisma schema
- WHEN `npx prisma migrate dev` runs
- THEN a `Banner` table is created with all 8 columns
- AND existing tables remain unchanged

#### Scenario: Banner has no required relations

- GIVEN a Banner record is inserted
- WHEN querying via Prisma without `include`
- THEN all scalar fields are returned without errors
- AND no foreign key constraints block creation

#### Scenario: Default isActive is true

- GIVEN a new Banner is created without specifying isActive
- WHEN the record is persisted
- THEN `isActive` defaults to `true`
