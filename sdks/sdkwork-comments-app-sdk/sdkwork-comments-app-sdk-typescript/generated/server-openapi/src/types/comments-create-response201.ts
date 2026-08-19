import type { CommentResponse } from './comment-response';

export interface CommentsCreateResponse201 {
  code: 0;
  data: unknown & { item: CommentResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
