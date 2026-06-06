import type { CommentStatus } from './comment-status';

export interface Comment {
  id: string;
  threadId: string;
  parentId?: string;
  authorId: string;
  body: string;
  status: CommentStatus;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}
