# sdkwork-comments

`sdkwork-comments` owns SDKWork comments plus cross-content engagement contracts, service facades, Rust storage, Rust route manifests, OpenAPI authority contracts, and generated SDK workspaces.

Comments and engagement code lives here so `sdkwork-appbase` can consume the capability externally instead of owning local comment contracts, persistence, moderation rules, reactions, likes, favorites, visit history, or SDK generation inputs.

## Packages

- `@sdkwork/comments-contracts`: shared comments contracts plus cross-content engagement contracts for likes, favorites, visit history, and target summaries.
- `@sdkwork/comments-service`: service facade using injected generated app/backend SDK clients.
- `sdkwork_comments_storage_sqlx`: Rust SQL storage contracts and migrations for comments, reactions, cross-content engagement, favorites, visits, and moderation.
- `sdkwork-routes-comments-app-api`: Rust app-api route manifest for `/app/v3/api/comments/*` and `/app/v3/api/engagement/*`.
- `sdkwork-routes-comments-backend-api`: Rust backend-api route manifest for `/backend/v3/api/comments/*` and `/backend/v3/api/engagement/*`.

## SDKs

- `sdks/sdkwork-comments-app-sdk`: app/client SDK family generated from `sdkwork-comments-app-api`.
- `sdks/sdkwork-comments-backend-sdk`: backend/admin SDK family generated from `sdkwork-comments-backend-api`.

Generated TypeScript SDKs expose two business roots:

- `client.comments.*` for comment threads, comments, comment reactions, and moderation workflows.
- `client.engagement.*` for cross-content likes, favorites, visit history, and target engagement summaries.

Both SDK families use the canonical generator:

```text
D:\javasource\spring-ai-plus\sdk\sdkwork-sdk-generator\bin\sdkgen.js
```

## Verification

Run from this directory:

```powershell
node .\sdks\materialize-comments-v3-openapi-boundaries.mjs
pnpm test
pnpm typecheck
pnpm test:governance
cargo test
```

Generate TypeScript SDKs:

```powershell
.\sdks\sdkwork-comments-app-sdk\bin\generate-sdk.ps1 -Languages typescript
.\sdks\sdkwork-comments-backend-sdk\bin\generate-sdk.ps1 -Languages typescript
```
