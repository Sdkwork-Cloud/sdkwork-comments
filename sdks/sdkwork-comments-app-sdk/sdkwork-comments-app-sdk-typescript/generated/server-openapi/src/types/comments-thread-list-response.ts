import type { CommentsPageInfo } from './comments-page-info';
import type { CommentsThread } from './comments-thread';

export interface CommentsThreadListResponse {
  items: CommentsThread[];
  pageInfo: CommentsPageInfo;
}
