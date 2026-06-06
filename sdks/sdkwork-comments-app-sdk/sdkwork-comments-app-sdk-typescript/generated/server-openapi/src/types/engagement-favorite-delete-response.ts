import type { EngagementTargetKind } from './engagement-target-kind';

export interface EngagementFavoriteDeleteResponse {
  targetKind: EngagementTargetKind;
  targetId: string;
  deleted: boolean;
  /** Server-owned request correlation id. */
  requestId: string;
}
