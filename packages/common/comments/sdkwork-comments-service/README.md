# @sdkwork/comments-service

Service facade for the comments capability.

The facade only calls generated app/backend SDK clients supplied by the host. It covers `client.comments.*` for comment workflows and `client.engagement.*` for cross-content likes, favorites, visit history, and target summaries without creating raw HTTP transports or duplicate DTOs.
