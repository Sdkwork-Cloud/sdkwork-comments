import type { CommentsThreadSummaryResponse } from './comments-thread-summary-response';

export interface CommentsThreadsRetrieveResponse {
  code: 0;
  data: unknown & { item: CommentsThreadSummaryResponse; };
  /** Server-owned request correlation id. */
  traceId: string;
}
