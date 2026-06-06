export interface CommentModerationCase {
  id: string;
  threadId: string;
  commentId: string;
  status: 'closed' | 'open';
  reason?: string;
  createdAt: string;
  updatedAt?: string;
}
