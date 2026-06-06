import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementVisit {
  visitId: string;
  targetKind: EngagementTargetKind;
  targetId: string;
  userId: string;
  source?: string;
  createdAt: string;
}
