import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementReactionDeleteResponse {
  targetKind: EngagementTargetKind;
  targetId: string;
  reactionType: 'like';
  deleted: boolean;
}
