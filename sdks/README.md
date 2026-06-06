# sdkwork-comments SDKs

The comments SDK families are generated from SDKWork v3 OpenAPI authority specs.

- `sdkwork-comments-app-sdk`: user-facing app SDK for thread summaries, comment CRUD, and reactions.
- `sdkwork-comments-backend-sdk`: backend/admin SDK for thread inspection and moderation.

Run `node sdks/materialize-comments-v3-openapi-boundaries.mjs` before generation to refresh OpenAPI and route manifests from the comments route catalog.
