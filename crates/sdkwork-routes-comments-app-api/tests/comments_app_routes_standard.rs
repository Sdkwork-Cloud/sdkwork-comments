use sdkwork_routes_comments_app_api::{
    comments_app_api_manifest, COMMENTS_APP_API_AUTHORITY, COMMENTS_APP_API_AUTH_MODE,
    COMMENTS_APP_API_PREFIX, COMMENTS_APP_SDK_FAMILY,
};

#[test]
fn declares_standard_comments_app_api_route_manifest() {
    let manifest = comments_app_api_manifest();

    assert_eq!(manifest.kind, "sdkwork.route.manifest");
    assert_eq!(manifest.package_name, "sdkwork-routes-comments-app-api");
    assert_eq!(manifest.surface, "app-api");
    assert_eq!(manifest.owner, "sdkwork-comments");
    assert_eq!(manifest.domain, "comments");
    assert_eq!(manifest.capability, "comments");
    assert_eq!(manifest.api_authority, COMMENTS_APP_API_AUTHORITY);
    assert_eq!(manifest.sdk_family, COMMENTS_APP_SDK_FAMILY);
    assert_eq!(manifest.prefix, COMMENTS_APP_API_PREFIX);
    assert_eq!(manifest.routes.len(), 14);
}

#[test]
fn comments_app_api_routes_use_app_prefix_and_dual_token_auth() {
    let manifest = comments_app_api_manifest();

    for route in &manifest.routes {
        assert!(route.path.starts_with(COMMENTS_APP_API_PREFIX));
        assert_eq!(route.auth_mode, COMMENTS_APP_API_AUTH_MODE);
        assert_eq!(route.ownership_owner, "sdkwork-comments");
        assert_eq!(route.ownership_api_authority, COMMENTS_APP_API_AUTHORITY);
        assert_eq!(route.source_route_crate, "sdkwork-routes-comments-app-api");
    }

    for operation_id in [
        "comments.threads.summary",
        "comments.comments.list",
        "comments.comments.create",
        "comments.comments.update",
        "comments.comments.delete",
        "comments.reactions.upsert",
        "comments.reactions.delete",
        "engagement.targets.summary",
        "engagement.likes.upsert",
        "engagement.likes.delete",
        "engagement.favorites.upsert",
        "engagement.favorites.delete",
        "engagement.visits.create",
        "engagement.visits.list",
    ] {
        assert!(
            manifest
                .routes
                .iter()
                .any(|route| route.operation_id == operation_id),
            "missing app operation: {operation_id}",
        );
    }

    for route in manifest
        .routes
        .iter()
        .filter(|route| route.operation_id.starts_with("engagement."))
    {
        assert!(
            route.path.starts_with("/app/v3/api/engagement/"),
            "engagement app route must use independent engagement prefix: {}",
            route.path,
        );
        assert!(
            !route.path.contains("/comments/"),
            "target-level engagement route must not be nested under comments: {}",
            route.path,
        );
    }
}
