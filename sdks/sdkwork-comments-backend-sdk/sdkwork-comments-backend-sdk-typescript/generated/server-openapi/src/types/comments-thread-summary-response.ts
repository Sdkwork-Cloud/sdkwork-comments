import type { CommentsThreadSummary } from './comments-thread-summary';

export interface CommentsThreadSummaryResponse {
  summary: CommentsThreadSummary;
  /** Server-owned request correlation id. */
  requestId: string;
}
