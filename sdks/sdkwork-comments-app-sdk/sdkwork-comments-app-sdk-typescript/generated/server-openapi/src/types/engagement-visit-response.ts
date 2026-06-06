import type { EngagementVisit } from './engagement-visit';

export interface EngagementVisitResponse {
  visit: EngagementVisit;
  /** Server-owned request correlation id. */
  requestId: string;
}
