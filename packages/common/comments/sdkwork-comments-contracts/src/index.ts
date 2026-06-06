export type SdkworkCommentOwnerKind =
  | "article"
  | "course-lesson"
  | "market-item"
  | "news-item"
  | "social-post"
  | "video";

export type SdkworkCommentStatus = "deleted" | "hidden" | "pending-review" | "published";
export type SdkworkCommentReactionType = "dislike" | "flag" | "heart" | "like";
export type SdkworkEngagementTargetKind = SdkworkCommentOwnerKind | "comment" | "thread";
export type SdkworkEngagementReactionType = SdkworkCommentReactionType;
export type SdkworkCommentCommandAction = "create" | "delete" | "moderate" | "reaction" | "update";
export type SdkworkCommentCommandIssue =
  | "empty-body"
  | "locked-thread"
  | "missing-moderation-permission"
  | "missing-write-permission";

export interface SdkworkCommentsThread {
  closedAt?: Date | number | string | null;
  id: string;
  locked?: boolean;
  ownerId: string;
  ownerKind: SdkworkCommentOwnerKind;
  tenantId: string;
  title?: string;
}

export interface SdkworkComment {
  authorId: string;
  body: string;
  createdAt: Date | number | string;
  deletedAt?: Date | number | string | null;
  id: string;
  parentId?: string;
  status: SdkworkCommentStatus;
  threadId: string;
  updatedAt?: Date | number | string | null;
}

export interface SdkworkCommentReaction {
  commentId: string;
  createdAt: Date | number | string;
  reactionType: SdkworkCommentReactionType;
  userId: string;
}

export interface SdkworkEngagementReaction {
  createdAt: Date | number | string;
  reactionType: SdkworkEngagementReactionType;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
  userId: string;
}

export interface SdkworkEngagementFavorite {
  createdAt: Date | number | string;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
  userId: string;
}

export interface SdkworkEngagementVisit {
  createdAt: Date | number | string;
  source?: string;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
  userId: string;
  visitId: string;
}

export interface SdkworkCommentTreeNode {
  comment: SdkworkComment;
  depth: number;
  reactionCounts: Partial<Record<SdkworkCommentReactionType, number>>;
  replies: SdkworkCommentTreeNode[];
}

export interface SdkworkEngagementSummary {
  favoriteCount: number;
  latestActivityAt: string;
  reactionCounts: Partial<Record<SdkworkEngagementReactionType, number>>;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
  uniqueVisitorCount: number;
  visitCount: number;
}

export interface SdkworkCommentsThreadSummary {
  hiddenCount: number;
  latestActivityAt: string;
  ownerId: string;
  ownerKind: SdkworkCommentOwnerKind;
  pendingReviewCount: number;
  publishedCount: number;
  reactionCounts: Partial<Record<SdkworkCommentReactionType, number>>;
  replyCount: number;
  tenantId: string;
  threadId: string;
  title?: string;
  totalCount: number;
}

export interface SdkworkCommentsPageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SdkworkCommentsListRequest {
  page?: number;
  pageSize?: number;
  status?: SdkworkCommentStatus;
}

export interface SdkworkCommentCreateRequest {
  body: string;
  parentId?: string;
}

export interface SdkworkCommentUpdateRequest {
  body: string;
}

export interface SdkworkCommentModerationRequest {
  reason?: string;
  status: Extract<SdkworkCommentStatus, "hidden" | "pending-review" | "published">;
}

export interface SdkworkCommentReactionUpsertRequest {
  reactionType: SdkworkCommentReactionType;
}

export interface SdkworkEngagementVisitCreateRequest {
  source?: string;
}

export interface SdkworkEngagementVisitListRequest {
  page?: number;
  pageSize?: number;
  targetId?: string;
  targetKind?: SdkworkEngagementTargetKind;
  userId?: string;
}

export interface SdkworkCommentResponse {
  comment: SdkworkComment;
  requestId: string;
}

export interface SdkworkCommentDeleteResponse {
  commentId: string;
  deleted: boolean;
  requestId: string;
}

export interface SdkworkCommentReactionResponse {
  reaction: SdkworkCommentReaction;
  requestId: string;
}

export interface SdkworkCommentReactionDeleteResponse {
  commentId: string;
  deleted: boolean;
  reactionType: SdkworkCommentReactionType;
  requestId: string;
}

export interface SdkworkEngagementReactionResponse {
  reaction: SdkworkEngagementReaction;
  requestId: string;
}

export interface SdkworkEngagementReactionDeleteResponse {
  deleted: boolean;
  reactionType: Extract<SdkworkEngagementReactionType, "like">;
  requestId: string;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
}

export interface SdkworkEngagementFavoriteResponse {
  favorite: SdkworkEngagementFavorite;
  requestId: string;
}

export interface SdkworkEngagementFavoriteDeleteResponse {
  deleted: boolean;
  requestId: string;
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
}

export interface SdkworkEngagementVisitResponse {
  requestId: string;
  visit: SdkworkEngagementVisit;
}

export interface SdkworkEngagementSummaryResponse {
  requestId: string;
  summary: SdkworkEngagementSummary;
}

export interface SdkworkCommentsListResponse {
  items: SdkworkComment[];
  pageInfo: SdkworkCommentsPageInfo;
  requestId: string;
}

export interface SdkworkEngagementVisitListResponse {
  items: SdkworkEngagementVisit[];
  pageInfo: SdkworkCommentsPageInfo;
  requestId: string;
}

export interface SdkworkCommentsThreadSummaryResponse {
  requestId: string;
  summary: SdkworkCommentsThreadSummary;
}

export interface SdkworkCommentsThreadListResponse {
  items: SdkworkCommentsThread[];
  pageInfo: SdkworkCommentsPageInfo;
  requestId: string;
}

export interface SdkworkCommentModerationEvent {
  actorId: string;
  commentId: string;
  createdAt: Date | number | string;
  id: string;
  reason?: string;
  status: SdkworkCommentModerationRequest["status"];
}

export interface SdkworkCommentModerationCase {
  commentId: string;
  createdAt: Date | number | string;
  id: string;
  reason?: string;
  status: "closed" | "open";
  threadId: string;
  updatedAt?: Date | number | string | null;
}

export interface SdkworkCommentModerationCaseListResponse {
  items: SdkworkCommentModerationCase[];
  pageInfo: SdkworkCommentsPageInfo;
  requestId: string;
}

export interface SdkworkCommentModerationResponse {
  comment: SdkworkComment;
  moderationEvent: SdkworkCommentModerationEvent;
  requestId: string;
}

export interface EvaluateCommentCommandReadinessOptions {
  action: SdkworkCommentCommandAction;
  body?: string;
  canModerate?: boolean;
  canWrite?: boolean;
  threadLocked?: boolean;
}

export interface SdkworkCommentCommandReadiness {
  issues: SdkworkCommentCommandIssue[];
  normalizedBody: string;
  ready: boolean;
}

function toTimestamp(value: Date | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function toIsoTimestamp(value: number): string {
  return new Date(value || 0).toISOString();
}

function incrementReactionCount(
  counts: Partial<Record<SdkworkEngagementReactionType, number>>,
  reactionType: SdkworkEngagementReactionType,
): void {
  counts[reactionType] = (counts[reactionType] ?? 0) + 1;
}

function toUniqueIssues(issues: readonly SdkworkCommentCommandIssue[]): SdkworkCommentCommandIssue[] {
  return Array.from(new Set(issues));
}

export function normalizeCommentBody(value: string): string {
  const lines = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "));

  while (lines.length > 0 && lines[0] === "") {
    lines.shift();
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
}

export function createCommentsTree(
  comments: readonly SdkworkComment[],
  reactions: readonly SdkworkCommentReaction[] = [],
): SdkworkCommentTreeNode[] {
  const reactionCountsByComment = new Map<string, Partial<Record<SdkworkCommentReactionType, number>>>();
  for (const reaction of reactions) {
    const counts = reactionCountsByComment.get(reaction.commentId) ?? {};
    incrementReactionCount(counts, reaction.reactionType);
    reactionCountsByComment.set(reaction.commentId, counts);
  }

  const nodesById = new Map<string, SdkworkCommentTreeNode>();
  for (const comment of comments) {
    nodesById.set(comment.id, {
      comment,
      depth: 0,
      reactionCounts: reactionCountsByComment.get(comment.id) ?? {},
      replies: [],
    });
  }

  const roots: SdkworkCommentTreeNode[] = [];
  for (const comment of comments) {
    const node = nodesById.get(comment.id);
    if (!node) {
      continue;
    }

    const parent = comment.parentId ? nodesById.get(comment.parentId) : undefined;
    if (!parent) {
      roots.push(node);
      continue;
    }

    node.depth = parent.depth + 1;
    parent.replies.push(node);
  }

  return roots;
}

function matchesTarget(
  targetKind: SdkworkEngagementTargetKind,
  targetId: string,
  value: { targetId: string; targetKind: SdkworkEngagementTargetKind },
): boolean {
  return value.targetKind === targetKind && value.targetId === targetId;
}

export interface BuildEngagementSummaryOptions {
  favorites?: readonly SdkworkEngagementFavorite[];
  reactions?: readonly SdkworkEngagementReaction[];
  targetId: string;
  targetKind: SdkworkEngagementTargetKind;
  visits?: readonly SdkworkEngagementVisit[];
}

export function buildEngagementSummary({
  favorites = [],
  reactions = [],
  targetId,
  targetKind,
  visits = [],
}: BuildEngagementSummaryOptions): SdkworkEngagementSummary {
  const reactionCounts: Partial<Record<SdkworkEngagementReactionType, number>> = {};
  const visitorIds = new Set<string>();
  let favoriteCount = 0;
  let visitCount = 0;
  let latestActivityAt = 0;

  for (const reaction of reactions) {
    if (!matchesTarget(targetKind, targetId, reaction)) {
      continue;
    }

    incrementReactionCount(reactionCounts, reaction.reactionType);
    latestActivityAt = Math.max(latestActivityAt, toTimestamp(reaction.createdAt));
  }

  for (const favorite of favorites) {
    if (!matchesTarget(targetKind, targetId, favorite)) {
      continue;
    }

    favoriteCount += 1;
    latestActivityAt = Math.max(latestActivityAt, toTimestamp(favorite.createdAt));
  }

  for (const visit of visits) {
    if (!matchesTarget(targetKind, targetId, visit)) {
      continue;
    }

    visitCount += 1;
    visitorIds.add(visit.userId);
    latestActivityAt = Math.max(latestActivityAt, toTimestamp(visit.createdAt));
  }

  return {
    favoriteCount,
    latestActivityAt: toIsoTimestamp(latestActivityAt),
    reactionCounts,
    targetId,
    targetKind,
    uniqueVisitorCount: visitorIds.size,
    visitCount,
  };
}

export function buildCommentsThreadSummary(
  thread: SdkworkCommentsThread,
  comments: readonly SdkworkComment[],
  reactions: readonly SdkworkCommentReaction[] = [],
): SdkworkCommentsThreadSummary {
  const reactionCounts: Partial<Record<SdkworkCommentReactionType, number>> = {};
  let latestActivityAt = toTimestamp(thread.closedAt);

  for (const comment of comments) {
    latestActivityAt = Math.max(
      latestActivityAt,
      toTimestamp(comment.createdAt),
      toTimestamp(comment.updatedAt),
      toTimestamp(comment.deletedAt),
    );
  }

  for (const reaction of reactions) {
    incrementReactionCount(reactionCounts, reaction.reactionType);
    latestActivityAt = Math.max(latestActivityAt, toTimestamp(reaction.createdAt));
  }

  return {
    hiddenCount: comments.filter((comment) => comment.status === "hidden").length,
    latestActivityAt: toIsoTimestamp(latestActivityAt),
    ownerId: thread.ownerId,
    ownerKind: thread.ownerKind,
    pendingReviewCount: comments.filter((comment) => comment.status === "pending-review").length,
    publishedCount: comments.filter((comment) => comment.status === "published").length,
    reactionCounts,
    replyCount: comments.filter((comment) => Boolean(comment.parentId)).length,
    tenantId: thread.tenantId,
    threadId: thread.id,
    ...(thread.title ? { title: thread.title } : {}),
    totalCount: comments.length,
  };
}

export function evaluateCommentCommandReadiness(
  options: EvaluateCommentCommandReadinessOptions,
): SdkworkCommentCommandReadiness {
  const normalizedBody = normalizeCommentBody(options.body ?? "");
  const writesBody = options.action === "create" || options.action === "update";
  const issues = toUniqueIssues([
    ...(!options.canWrite && options.action !== "moderate" ? ["missing-write-permission" as const] : []),
    ...(options.threadLocked && options.action !== "moderate" ? ["locked-thread" as const] : []),
    ...(writesBody && !normalizedBody ? ["empty-body" as const] : []),
    ...(options.action === "moderate" && !options.canModerate
      ? ["missing-moderation-permission" as const]
      : []),
  ]);

  return {
    issues,
    normalizedBody,
    ready: issues.length === 0,
  };
}
