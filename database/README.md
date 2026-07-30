# COMMENTS Database Module

Canonical lifecycle assets for `sdkwork-comments` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `comments`
- serviceCode: `COMMENTS`
- tablePrefix: `comments_`; engagement storage uses `comments_engagement_*` table names.

## Initialization state

This module is in **initialization state** for greenfield deployments:

1. **Baseline** - `database/ddl/baseline/postgres/0001_comments_baseline.sql` contains the authoritative DDL snapshot.
2. **Migrations** - `database/migrations/postgres/` is reserved for post-GA incremental schema changes only. It is intentionally empty at initialization.
3. **Drift** — run `pnpm db:drift:check` before release.

## Commands

```bash
pnpm run db:validate
pnpm run db:materialize:contract
pnpm run db:plan
pnpm run db:init
pnpm run db:migrate
pnpm run db:seed
pnpm run db:status
pnpm run db:drift:check
```
