import type { CommentsPageInfo } from './comments-page-info';
import type { EngagementVisit } from './engagement-visit';

export interface EngagementVisitListResponse {
  items: EngagementVisit[];
  pageInfo: CommentsPageInfo;
}
