# @sdkwork/comments-service

Service facade for the comments capability.

The facade only calls generated app/backend SDK clients supplied by the host. It covers `client.comments.*` for comment workflows and `client.engagement.*` for cross-content likes, favorites, visit history, and target summaries without creating raw HTTP transports or duplicate DTOs.

## SDKWork Documentation Contract

Domain: communication
Capability: comments-service
Package type: node-package
Status: ready

### Public API

Public exports are declared in `specs/component.spec.json` under `contracts.publicExports`.

### Required SDK Surface

- `SdkworkCommentsAppSdkClient`
- `SdkworkCommentsBackendSdkClient`

### Configuration

Configuration keys and runtime entrypoints are declared in `specs/component.spec.json`.

### SaaS/Private/Local Behavior

This module follows the canonical standards linked from `specs/component.spec.json`, including deployment and runtime configuration rules where applicable.

### Security

Do not add secrets, live tokens, manual auth headers, or app-local credential handling to this module.

### Extension Points

Extension points are limited to declared public exports, runtime entrypoints, SDK clients, events, and config keys.

### Verification

- `pnpm --filter @sdkwork/comments-service test`
- `pnpm --filter @sdkwork/comments-service typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
