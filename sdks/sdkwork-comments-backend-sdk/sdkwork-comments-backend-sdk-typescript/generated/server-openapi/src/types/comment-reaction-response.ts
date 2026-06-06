import type { CommentReaction } from './comment-reaction';

export interface CommentReactionResponse {
  reaction: CommentReaction;
  /** Server-owned request correlation id. */
  requestId: string;
}
