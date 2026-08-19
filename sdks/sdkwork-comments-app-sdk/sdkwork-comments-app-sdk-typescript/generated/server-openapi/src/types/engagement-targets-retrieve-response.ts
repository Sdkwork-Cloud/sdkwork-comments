import type { EngagementSummaryResponse } from './engagement-summary-response';

export interface EngagementTargetsRetrieveResponse {
  code: 0;
  data: unknown & { item: EngagementSummaryResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
