import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementFavorite {
  targetKind: EngagementTargetKind;
  targetId: string;
  userId: string;
  createdAt: string;
}
