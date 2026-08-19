import type { Comment } from './comment';
import type { PageInfo } from './page-info';

export interface CommentsListGetResponse {
  code: 0;
  data: unknown & { items: Comment[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
