import type { EngagementReactionResponse } from './engagement-reaction-response';

export interface EngagementLikesUpdateResponse {
  code: 0;
  data: unknown & { item: EngagementReactionResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
