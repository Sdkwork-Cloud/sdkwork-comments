import type { CommentOwnerKind } from './comment-owner-kind';
import type { CommentReactionCounts } from './comment-reaction-counts';

export interface CommentsThreadSummary {
  threadId: string;
  tenantId: string;
  ownerId: string;
  ownerKind: CommentOwnerKind;
  title?: string;
  totalCount: number;
  publishedCount: number;
  pendingReviewCount: number;
  hiddenCount: number;
  replyCount: number;
  reactionCounts: CommentReactionCounts;
  latestActivityAt: string;
}
