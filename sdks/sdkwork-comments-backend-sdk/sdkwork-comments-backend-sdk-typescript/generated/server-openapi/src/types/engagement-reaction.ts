import type { CommentReactionType } from './comment-reaction-type';
import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementReaction {
  targetKind: EngagementTargetKind;
  targetId: string;
  userId: string;
  reactionType: CommentReactionType;
  createdAt: string;
}
