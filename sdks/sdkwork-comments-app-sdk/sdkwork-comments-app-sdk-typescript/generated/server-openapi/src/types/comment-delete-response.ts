export interface CommentDeleteResponse {
  commentId: string;
  deleted: boolean;
  /** Server-owned request correlation id. */
  requestId: string;
}
