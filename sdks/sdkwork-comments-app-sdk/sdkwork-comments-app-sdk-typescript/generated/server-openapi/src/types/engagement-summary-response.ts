import type { EngagementSummary } from './engagement-summary';

export interface EngagementSummaryResponse {
  summary: EngagementSummary;
  /** Server-owned request correlation id. */
  requestId: string;
}
