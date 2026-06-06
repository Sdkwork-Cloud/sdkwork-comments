import type { Comment } from './comment';
import type { CommentModerationEvent } from './comment-moderation-event';

export interface CommentModerationResponse {
  comment: Comment;
  moderationEvent: CommentModerationEvent;
  /** Server-owned request correlation id. */
  requestId: string;
}
