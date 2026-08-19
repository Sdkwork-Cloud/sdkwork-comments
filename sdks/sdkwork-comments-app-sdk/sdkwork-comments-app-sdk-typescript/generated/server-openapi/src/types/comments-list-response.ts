import type { Comment } from './comment';
import type { CommentsPageInfo } from './comments-page-info';

export interface CommentsListResponse {
  items: Comment[];
  pageInfo: CommentsPageInfo;
}
