pub const COMMENTS_APP_API_PREFIX: &str = "/app/v3/api";
pub const COMMENTS_APP_API_AUTHORITY: &str = "sdkwork-comments-app-api";
pub const COMMENTS_APP_SDK_FAMILY: &str = "sdkwork-comments-app-sdk";
pub const COMMENTS_APP_API_AUTH_MODE: &str = "dual-token";

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommentsRouteManifest {
    pub kind: &'static str,
    pub package_name: &'static str,
    pub surface: &'static str,
    pub owner: &'static str,
    pub domain: &'static str,
    pub capability: &'static str,
    pub api_authority: &'static str,
    pub sdk_family: &'static str,
    pub prefix: &'static str,
    pub routes: Vec<CommentsRoute>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommentsRoute {
    pub method: &'static str,
    pub path: &'static str,
    pub operation_id: &'static str,
    pub tag: &'static str,
    pub auth_mode: &'static str,
    pub handler_module: &'static str,
    pub handler_name: &'static str,
    pub request_schema: Option<&'static str>,
    pub response_schema: &'static str,
    pub ownership_owner: &'static str,
    pub ownership_api_authority: &'static str,
    pub source_route_crate: &'static str,
}

fn route(
    method: &'static str,
    path: &'static str,
    operation_id: &'static str,
    request_schema: Option<&'static str>,
    response_schema: &'static str,
) -> CommentsRoute {
    let tag = if operation_id.starts_with("engagement.") {
        "engagement"
    } else {
        "comments"
    };

    CommentsRoute {
        method,
        path,
        operation_id,
        tag,
        auth_mode: COMMENTS_APP_API_AUTH_MODE,
        handler_module: "crate::handlers",
        handler_name: operation_id,
        request_schema,
        response_schema,
        ownership_owner: "sdkwork-comments",
        ownership_api_authority: COMMENTS_APP_API_AUTHORITY,
        source_route_crate: "sdkwork-routes-comments-app-api",
    }
}

pub fn comments_app_api_manifest() -> CommentsRouteManifest {
    CommentsRouteManifest {
        kind: "sdkwork.route.manifest",
        package_name: "sdkwork-routes-comments-app-api",
        surface: "app-api",
        owner: "sdkwork-comments",
        domain: "comments",
        capability: "comments",
        api_authority: COMMENTS_APP_API_AUTHORITY,
        sdk_family: COMMENTS_APP_SDK_FAMILY,
        prefix: COMMENTS_APP_API_PREFIX,
        routes: vec![
            route(
                "GET",
                "/app/v3/api/comments/threads/{threadId}/summary",
                "comments.threads.summary",
                None,
                "CommentsThreadSummaryResponse",
            ),
            route(
                "GET",
                "/app/v3/api/comments/threads/{threadId}/comments",
                "comments.comments.list",
                None,
                "CommentsListResponse",
            ),
            route(
                "POST",
                "/app/v3/api/comments/threads/{threadId}/comments",
                "comments.comments.create",
                Some("CommentCreateRequest"),
                "CommentResponse",
            ),
            route(
                "PATCH",
                "/app/v3/api/comments/comments/{commentId}",
                "comments.comments.update",
                Some("CommentUpdateRequest"),
                "CommentResponse",
            ),
            route(
                "DELETE",
                "/app/v3/api/comments/comments/{commentId}",
                "comments.comments.delete",
                None,
                "CommentDeleteResponse",
            ),
            route(
                "PUT",
                "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}",
                "comments.reactions.upsert",
                None,
                "CommentReactionResponse",
            ),
            route(
                "DELETE",
                "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}",
                "comments.reactions.delete",
                None,
                "CommentReactionDeleteResponse",
            ),
            route(
                "GET",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/summary",
                "engagement.targets.summary",
                None,
                "EngagementSummaryResponse",
            ),
            route(
                "PUT",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes",
                "engagement.likes.upsert",
                None,
                "EngagementReactionResponse",
            ),
            route(
                "DELETE",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes",
                "engagement.likes.delete",
                None,
                "EngagementReactionDeleteResponse",
            ),
            route(
                "PUT",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites",
                "engagement.favorites.upsert",
                None,
                "EngagementFavoriteResponse",
            ),
            route(
                "DELETE",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites",
                "engagement.favorites.delete",
                None,
                "EngagementFavoriteDeleteResponse",
            ),
            route(
                "POST",
                "/app/v3/api/engagement/targets/{targetKind}/{targetId}/visits",
                "engagement.visits.create",
                Some("EngagementVisitCreateRequest"),
                "EngagementVisitResponse",
            ),
            route(
                "GET",
                "/app/v3/api/engagement/visits",
                "engagement.visits.list",
                None,
                "EngagementVisitListResponse",
            ),
        ],
    }
}

pub fn gateway_route_manifest() -> CommentsRouteManifest {
    comments_app_api_manifest()
}

pub fn gateway_mount() -> axum::Router {
    axum::Router::new()
}
