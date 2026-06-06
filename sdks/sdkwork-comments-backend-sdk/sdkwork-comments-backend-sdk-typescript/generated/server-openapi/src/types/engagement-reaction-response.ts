import type { EngagementReaction } from './engagement-reaction';

export interface EngagementReactionResponse {
  reaction: EngagementReaction;
  /** Server-owned request correlation id. */
  requestId: string;
}
