import type { CommentReactionType } from './comment-reaction-type';

export interface CommentReactionDeleteResponse {
  commentId: string;
  reactionType: CommentReactionType;
  deleted: boolean;
  /** Server-owned request correlation id. */
  requestId: string;
}
