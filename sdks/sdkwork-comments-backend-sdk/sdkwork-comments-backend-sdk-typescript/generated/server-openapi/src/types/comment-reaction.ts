import type { CommentReactionType } from './comment-reaction-type';

export interface CommentReaction {
  commentId: string;
  userId: string;
  reactionType: CommentReactionType;
  createdAt: string;
}
