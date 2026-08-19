import type { EngagementVisit } from './engagement-visit';
import type { PageInfo } from './page-info';

export interface EngagementVisitsListResponse {
  code: 0;
  data: unknown & { items: EngagementVisit[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
