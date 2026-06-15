use sdkwork_comments_engagement_repository_sqlx::{
    comments_database_tables, comments_initial_migration_sql, comments_moderation_tables,
    comments_reaction_tables, comments_storage_capability_manifest, comments_thread_tables,
    engagement_tables,
};

#[test]
fn exposes_comments_table_catalog() {
    let tables = comments_database_tables();

    for table in [
        "comments_thread",
        "comments_comment",
        "comments_comment_projection",
        "comments_reaction",
        "engagement_reaction",
        "engagement_favorite",
        "engagement_visit_history",
        "engagement_projection",
        "comments_moderation_case",
        "comments_moderation_event",
    ] {
        assert!(tables.contains(&table), "missing comments table: {table}");
    }

    for table in tables {
        assert!(
            table.starts_with("comments_") || table.starts_with("engagement_"),
            "comments storage must expose only comments or engagement tables: {table}",
        );
    }
}

#[test]
fn splits_thread_reaction_and_moderation_tables() {
    assert_eq!(
        comments_thread_tables(),
        vec![
            "comments_thread",
            "comments_comment",
            "comments_comment_projection"
        ],
    );
    assert_eq!(comments_reaction_tables(), vec!["comments_reaction"]);
    assert_eq!(
        engagement_tables(),
        vec![
            "engagement_reaction",
            "engagement_favorite",
            "engagement_visit_history",
            "engagement_projection",
        ],
    );
    assert_eq!(
        comments_moderation_tables(),
        vec!["comments_moderation_case", "comments_moderation_event"],
    );
}

#[test]
fn initial_migration_declares_comments_tables_and_indexes() {
    let sql = comments_initial_migration_sql();

    for expected in [
        "CREATE TABLE IF NOT EXISTS comments_thread",
        "CREATE TABLE IF NOT EXISTS comments_comment",
        "CREATE TABLE IF NOT EXISTS comments_comment_projection",
        "CREATE TABLE IF NOT EXISTS comments_reaction",
        "CREATE TABLE IF NOT EXISTS engagement_reaction",
        "CREATE TABLE IF NOT EXISTS engagement_favorite",
        "CREATE TABLE IF NOT EXISTS engagement_visit_history",
        "CREATE TABLE IF NOT EXISTS engagement_projection",
        "CREATE TABLE IF NOT EXISTS comments_moderation_case",
        "CREATE TABLE IF NOT EXISTS comments_moderation_event",
        "id BIGINT PRIMARY KEY",
        "uuid VARCHAR(64) NOT NULL UNIQUE",
        "tenant_id BIGINT NOT NULL DEFAULT 0",
        "organization_id BIGINT NOT NULL DEFAULT 0",
        "thread_id BIGINT NOT NULL",
        "parent_comment_id BIGINT",
        "body_text TEXT NOT NULL",
        "reaction_type VARCHAR(64) NOT NULL",
        "target_kind VARCHAR(128) NOT NULL",
        "target_id VARCHAR(160) NOT NULL",
        "visit_source VARCHAR(128)",
        "favorite_count INTEGER NOT NULL DEFAULT 0",
        "visit_count INTEGER NOT NULL DEFAULT 0",
        "unique_visitor_count INTEGER NOT NULL DEFAULT 0",
        "moderation_status VARCHAR(64) NOT NULL",
        "payload_json JSONB NOT NULL DEFAULT '{}'::jsonb",
        "CREATE INDEX IF NOT EXISTS idx_comments_comment_thread_created",
        "CREATE INDEX IF NOT EXISTS idx_comments_reaction_comment_type",
        "CREATE INDEX IF NOT EXISTS idx_engagement_reaction_target_type",
        "CREATE INDEX IF NOT EXISTS idx_engagement_favorite_target_created",
        "CREATE INDEX IF NOT EXISTS idx_engagement_visit_history_target_created",
        "CREATE INDEX IF NOT EXISTS idx_engagement_projection_target",
        "CREATE INDEX IF NOT EXISTS idx_comments_moderation_case_status",
        "CREATE INDEX IF NOT EXISTS idx_comments_moderation_event_case_created",
    ] {
        assert!(
            sql.contains(expected),
            "comments migration must contain `{expected}`",
        );
    }
}

#[test]
fn manifest_declares_comments_storage_contract() {
    let manifest = comments_storage_capability_manifest();

    assert_eq!(manifest.name, "comments-storage");
    assert_eq!(manifest.schema_version, "2026-06-06");
    assert_eq!(manifest.tables, comments_database_tables());
    assert_eq!(manifest.thread_tables, comments_thread_tables());
    assert_eq!(manifest.reaction_tables, comments_reaction_tables());
    assert_eq!(manifest.engagement_tables, engagement_tables());
    assert_eq!(manifest.moderation_tables, comments_moderation_tables());
    assert_eq!(manifest.migrations, vec!["0001_comments_storage.sql"]);
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "CommentsThreadRepository"));
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "CommentsModerationRepository"));
    assert!(manifest
        .repository_bindings
        .iter()
        .any(|binding| binding.repository_name == "EngagementRepository"));
}
