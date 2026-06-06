import type { Comment } from './comment';
import type { CommentsPageInfo } from './comments-page-info';

export interface CommentsListResponse {
  items: Comment[];
  pageInfo: CommentsPageInfo;
  /** Server-owned request correlation id. */
  requestId: string;
}
