//! SDKWork Comments database pool bootstrap via `sdkwork-database`.

use sdkwork_database_config::DatabaseConfig;
use sdkwork_database_sqlx::{create_pool_from_config, DatabasePool, PoolError};

pub use sdkwork_comments_database_host::{
    bootstrap_comments_database, bootstrap_comments_database_from_env, CommentsDatabaseHost,
};

pub type CommentsDatabasePool = DatabasePool;

pub async fn connect_comments_database_pool_from_env() -> Result<CommentsDatabasePool, PoolError> {
    let config = DatabaseConfig::from_env("COMMENTS")?;
    create_pool_from_config(config).await
}

pub async fn connect_and_bootstrap_comments_database_from_env(
) -> Result<CommentsDatabaseHost, String> {
    let pool = connect_comments_database_pool_from_env()
        .await
        .map_err(|error| error.to_string())?;
    bootstrap_comments_database(pool).await
}
