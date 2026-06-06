import type { CommentModerationCase } from './comment-moderation-case';
import type { CommentsPageInfo } from './comments-page-info';

export interface CommentModerationCaseListResponse {
  items: CommentModerationCase[];
  pageInfo: CommentsPageInfo;
  /** Server-owned request correlation id. */
  requestId: string;
}
