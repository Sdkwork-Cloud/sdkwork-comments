# sdkwork-comments

`sdkwork-comments` owns SDKWork comments plus cross-content engagement contracts, service facades, Rust storage, Rust route manifests, OpenAPI authority contracts, and generated SDK workspaces.

Comments and engagement code lives here so `sdkwork-appbase` can consume the capability externally instead of owning local comment contracts, persistence, moderation rules, reactions, likes, favorites, visit history, or SDK generation inputs.

## Packages

- `@sdkwork/comments-contracts`: shared comments contracts plus cross-content engagement contracts for likes, favorites, visit history, and target summaries.
- `@sdkwork/comments-service`: service facade using injected generated app/backend SDK clients.
- `sdkwork-comments-engagement-repository-sqlx`: Rust SQL storage contracts and migrations for comments, reactions, cross-content engagement, favorites, visits, and moderation.
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
..\sdkwork-sdk-generator\bin\sdkgen.js
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

## SDKWork Documentation Contract

Domain: comments
Capability: comments-workspace
Package type: rust-crate
Status: standard

### Public API

Public exports are declared in `specs/component.spec.json` under `contracts.publicExports`.

### Required SDK Surface

- None declared in `specs/component.spec.json`.

### Configuration

Configuration keys and runtime entrypoints are declared in `specs/component.spec.json`.

### SaaS/Private/Local Behavior

This module follows the canonical standards linked from `specs/component.spec.json`, including deployment and runtime configuration rules where applicable.

### Security

Do not add secrets, live tokens, manual auth headers, or app-local credential handling to this module.

### Extension Points

Extension points are limited to declared public exports, runtime entrypoints, SDK clients, events, and config keys.

### Verification

- `pnpm typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.

## Documentation Canon

- [docs/README.md](docs/README.md)
- [docs/product/prd/PRD.md](docs/product/prd/PRD.md)
- [docs/architecture/tech/TECH_ARCHITECTURE.md](docs/architecture/tech/TECH_ARCHITECTURE.md)

## Application Roots

- [apps directory index](apps/README.md)
