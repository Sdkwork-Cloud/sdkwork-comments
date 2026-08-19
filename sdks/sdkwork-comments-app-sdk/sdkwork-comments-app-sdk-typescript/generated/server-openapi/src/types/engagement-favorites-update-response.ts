import type { EngagementFavoriteResponse } from './engagement-favorite-response';

export interface EngagementFavoritesUpdateResponse {
  code: 0;
  data: unknown & { item: EngagementFavoriteResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
