import type { CommentReactionCounts } from './comment-reaction-counts';
import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementSummary {
  targetKind: EngagementTargetKind;
  targetId: string;
  reactionCounts: CommentReactionCounts;
  favoriteCount: number;
  visitCount: number;
  uniqueVisitorCount: number;
  latestActivityAt: string;
}
