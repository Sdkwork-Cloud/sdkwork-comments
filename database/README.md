# COMMENTS Database Module

Canonical lifecycle assets for `sdkwork-comments` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `comments`
- serviceCode: `COMMENTS`
- tablePrefix: `comments_` (plus `engagement_` tables)

## Commands

```bash
pnpm run db:materialize:contract
pnpm run db:validate
```

Legacy SQL: `crates/sdkwork-comments-engagement-repository-sqlx/migrations/0001_comments_storage.sql` → `database/ddl/baseline/postgres/0001_comments_legacy_baseline.sql`

Runtime bootstrap: `sdkwork-comments-database-host` / `connect_and_bootstrap_comments_database_from_env()`.
