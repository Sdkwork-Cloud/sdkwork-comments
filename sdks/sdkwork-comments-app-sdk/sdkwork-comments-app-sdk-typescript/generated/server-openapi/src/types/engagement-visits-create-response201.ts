import type { EngagementVisitResponse } from './engagement-visit-response';

export interface EngagementVisitsCreateResponse201 {
  code: 0;
  data: unknown & { item: EngagementVisitResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
