mod bootstrap;

pub use bootstrap::{
    bootstrap_comments_database, bootstrap_comments_database_from_env,
    connect_and_bootstrap_comments_database_from_env, connect_comments_database_pool_from_env,
    CommentsDatabaseHost, CommentsDatabasePool,
};

pub const COMMENTS_STORAGE_MIGRATION: &str = "0001_comments_storage.sql";

const COMMENTS_INITIAL_MIGRATION_SQL: &str =
    include_str!("../migrations/0001_comments_storage.sql");

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommentsRepositoryBinding {
    pub domain: &'static str,
    pub repository_name: &'static str,
    pub tables: Vec<&'static str>,
    pub requires_transaction: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommentsStorageCapabilityManifest {
    pub name: &'static str,
    pub schema_version: &'static str,
    pub tables: Vec<&'static str>,
    pub thread_tables: Vec<&'static str>,
    pub reaction_tables: Vec<&'static str>,
    pub engagement_tables: Vec<&'static str>,
    pub moderation_tables: Vec<&'static str>,
    pub migrations: Vec<&'static str>,
    pub repository_bindings: Vec<CommentsRepositoryBinding>,
}

pub fn comments_thread_tables() -> Vec<&'static str> {
    vec![
        "comments_thread",
        "comments_comment",
        "comments_comment_projection",
    ]
}

pub fn comments_reaction_tables() -> Vec<&'static str> {
    vec!["comments_reaction"]
}

pub fn engagement_tables() -> Vec<&'static str> {
    vec![
        "engagement_reaction",
        "engagement_favorite",
        "engagement_visit_history",
        "engagement_projection",
    ]
}

pub fn comments_moderation_tables() -> Vec<&'static str> {
    vec!["comments_moderation_case", "comments_moderation_event"]
}

pub fn comments_database_tables() -> Vec<&'static str> {
    let mut tables = comments_thread_tables();
    tables.extend(comments_reaction_tables());
    tables.extend(engagement_tables());
    tables.extend(comments_moderation_tables());
    tables
}

pub fn comments_initial_migration_sql() -> &'static str {
    COMMENTS_INITIAL_MIGRATION_SQL
}

pub fn comments_storage_capability_manifest() -> CommentsStorageCapabilityManifest {
    CommentsStorageCapabilityManifest {
        name: "comments-storage",
        schema_version: "2026-06-06",
        tables: comments_database_tables(),
        thread_tables: comments_thread_tables(),
        reaction_tables: comments_reaction_tables(),
        engagement_tables: engagement_tables(),
        moderation_tables: comments_moderation_tables(),
        migrations: vec![COMMENTS_STORAGE_MIGRATION],
        repository_bindings: vec![
            CommentsRepositoryBinding {
                domain: "comments",
                repository_name: "CommentsThreadRepository",
                tables: comments_thread_tables(),
                requires_transaction: true,
            },
            CommentsRepositoryBinding {
                domain: "comments",
                repository_name: "CommentsReactionRepository",
                tables: comments_reaction_tables(),
                requires_transaction: true,
            },
            CommentsRepositoryBinding {
                domain: "comments",
                repository_name: "EngagementRepository",
                tables: engagement_tables(),
                requires_transaction: true,
            },
            CommentsRepositoryBinding {
                domain: "comments",
                repository_name: "CommentsModerationRepository",
                tables: comments_moderation_tables(),
                requires_transaction: true,
            },
        ],
    }
}
