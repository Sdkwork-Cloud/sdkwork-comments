-- sdkwork:migration
-- id: 0001_organization_id_not_null
-- engine: postgres
-- module: sdkwork-comments
-- purpose: Enforce organization_id NOT NULL DEFAULT on all tables in the
--   consolidated baseline. NULL rows (pre-standard data anomalies) are
--   backfilled with the platform sentinel before NOT NULL is set, and
--   NOT NULL columns without an explicit default receive the sentinel
--   default, keeping existing deployments consistent with fresh baseline
--   installs.
-- reversible: false
-- rollback: forward-fix (sentinel backfill is the canonical fix; NULL
--   organization rows are data anomalies)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 30s

BEGIN;

UPDATE comments_thread SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_thread ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_thread ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_comment SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_comment ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_comment ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_comment_projection SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_comment_projection ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_comment_projection ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_reaction SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_reaction ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_reaction ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_engagement_reaction SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_engagement_reaction ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_engagement_reaction ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_engagement_favorite SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_engagement_favorite ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_engagement_favorite ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_engagement_visit_history SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_engagement_visit_history ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_engagement_visit_history ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_engagement_projection SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_engagement_projection ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_engagement_projection ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_moderation_case SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_moderation_case ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_moderation_case ALTER COLUMN organization_id SET NOT NULL;

UPDATE comments_moderation_event SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE comments_moderation_event ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE comments_moderation_event ALTER COLUMN organization_id SET NOT NULL;

COMMIT;
