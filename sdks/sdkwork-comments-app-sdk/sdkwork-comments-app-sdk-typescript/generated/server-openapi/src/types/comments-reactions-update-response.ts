import type { CommentReactionResponse } from './comment-reaction-response';

export interface CommentsReactionsUpdateResponse {
  code: 0;
  data: unknown & { item: CommentReactionResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
