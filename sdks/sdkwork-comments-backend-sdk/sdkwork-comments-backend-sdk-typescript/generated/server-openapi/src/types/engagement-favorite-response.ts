import type { EngagementFavorite } from './engagement-favorite';

export interface EngagementFavoriteResponse {
  favorite: EngagementFavorite;
  /** Server-owned request correlation id. */
  requestId: string;
}
