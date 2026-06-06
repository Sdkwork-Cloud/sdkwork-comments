export interface CommentModerationEvent {
  id: string;
  commentId: string;
  actorId: string;
  status: 'hidden' | 'pending-review' | 'published';
  reason?: string;
  createdAt: string;
}
