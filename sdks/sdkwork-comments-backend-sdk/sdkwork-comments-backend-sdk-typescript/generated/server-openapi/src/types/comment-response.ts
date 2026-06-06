import type { Comment } from './comment';

export interface CommentResponse {
  comment: Comment;
  /** Server-owned request correlation id. */
  requestId: string;
}
