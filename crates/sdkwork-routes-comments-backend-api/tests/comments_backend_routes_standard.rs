use sdkwork_routes_comments_backend_api::{
    comments_backend_api_manifest, COMMENTS_BACKEND_API_AUTHORITY, COMMENTS_BACKEND_API_AUTH_MODE,
    COMMENTS_BACKEND_API_PREFIX, COMMENTS_BACKEND_SDK_FAMILY,
};

#[test]
fn declares_standard_comments_backend_api_route_manifest() {
    let manifest = comments_backend_api_manifest();

    assert_eq!(manifest.kind, "sdkwork.route.manifest");
    assert_eq!(manifest.package_name, "sdkwork-routes-comments-backend-api");
    assert_eq!(manifest.surface, "backend-api");
    assert_eq!(manifest.owner, "sdkwork-comments");
    assert_eq!(manifest.domain, "comments");
    assert_eq!(manifest.capability, "comments");
    assert_eq!(manifest.api_authority, COMMENTS_BACKEND_API_AUTHORITY);
    assert_eq!(manifest.sdk_family, COMMENTS_BACKEND_SDK_FAMILY);
    assert_eq!(manifest.prefix, COMMENTS_BACKEND_API_PREFIX);
    assert_eq!(manifest.routes.len(), 8);
}

#[test]
fn comments_backend_api_routes_use_backend_prefix_and_dual_token_auth() {
    let manifest = comments_backend_api_manifest();

    for route in &manifest.routes {
        assert!(route.path.starts_with(COMMENTS_BACKEND_API_PREFIX));
        assert_eq!(route.auth_mode, COMMENTS_BACKEND_API_AUTH_MODE);
        assert_eq!(route.ownership_owner, "sdkwork-comments");
        assert_eq!(
            route.ownership_api_authority,
            COMMENTS_BACKEND_API_AUTHORITY
        );
        assert_eq!(
            route.source_route_crate,
            "sdkwork-routes-comments-backend-api"
        );
    }

    for operation_id in [
        "comments.threads.list",
        "comments.threads.summary",
        "comments.comments.list",
        "comments.comments.delete",
        "comments.moderation.cases.list",
        "comments.moderation.update",
        "engagement.targets.summary",
        "engagement.visits.list",
    ] {
        assert!(
            manifest
                .routes
                .iter()
                .any(|route| route.operation_id == operation_id),
            "missing backend operation: {operation_id}",
        );
    }

    for route in manifest
        .routes
        .iter()
        .filter(|route| route.operation_id.starts_with("engagement."))
    {
        assert!(
            route.path.starts_with("/backend/v3/api/engagement/"),
            "engagement backend route must use independent engagement prefix: {}",
            route.path,
        );
        assert!(
            !route.path.contains("/comments/"),
            "target-level engagement route must not be nested under comments: {}",
            route.path,
        );
    }
}
