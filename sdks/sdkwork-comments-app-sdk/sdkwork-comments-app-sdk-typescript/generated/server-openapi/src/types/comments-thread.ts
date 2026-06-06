import type { CommentOwnerKind } from './comment-owner-kind';

export interface CommentsThread {
  id: string;
  tenantId: string;
  ownerId: string;
  ownerKind: CommentOwnerKind;
  title?: string;
  locked?: boolean;
  closedAt?: string;
}
