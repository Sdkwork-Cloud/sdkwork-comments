# @sdkwork/comments-contracts

Shared comments contracts for thread summaries, comment trees, comment reactions, moderation readiness, and cross-content engagement contracts for likes, favorites, visit history, and target summaries.

This package is owned by `sdkwork-comments`; appbase packages must consume it as an external comments and engagement capability instead of keeping local comment, reaction, favorite, or visit-history rules.

## SDKWork Documentation Contract

Domain: communication
Capability: comments-contracts
Package type: node-package
Status: ready

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

- `pnpm --filter @sdkwork/comments-contracts test`
- `pnpm --filter @sdkwork/comments-contracts typecheck`

### Owner And Status

Owner and lifecycle status are tracked in `specs/component.spec.json`.
