export interface CommentModerationRequest {
  status: 'hidden' | 'pending-review' | 'published';
  reason?: string;
}
