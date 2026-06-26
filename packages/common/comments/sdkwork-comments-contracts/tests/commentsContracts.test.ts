import { describe, expect, it } from "vitest";
import {
  buildEngagementSummary,
  buildCommentsThreadSummary,
  createCommentsTree,
  evaluateCommentCommandReadiness,
  normalizeCommentBody,
  type SdkworkComment,
  type SdkworkEngagementFavorite,
  type SdkworkEngagementReaction,
  type SdkworkCommentReaction,
  type SdkworkCommentsThread,
  type SdkworkEngagementVisit,
} from "../src";

const thread: SdkworkCommentsThread = {
  id: "thread-product-launch",
  ownerId: "post-launch",
  ownerKind: "social-post",
  tenantId: "100001",
  title: "Launch discussion",
};

const comments: SdkworkComment[] = [
  {
    authorId: "user-a",
    body: "First comment",
    createdAt: "2026-06-06T01:00:00.000Z",
    id: "comment-a",
    status: "published",
    threadId: thread.id,
  },
  {
    authorId: "user-b",
    body: "Reply comment",
    createdAt: "2026-06-06T01:05:00.000Z",
    id: "comment-b",
    parentId: "comment-a",
    status: "pending-review",
    threadId: thread.id,
  },
  {
    authorId: "user-c",
    body: "Hidden comment",
    createdAt: "2026-06-06T01:10:00.000Z",
    id: "comment-c",
    status: "hidden",
    threadId: thread.id,
  },
];

const reactions: SdkworkCommentReaction[] = [
  {
    commentId: "comment-a",
    createdAt: "2026-06-06T01:06:00.000Z",
    reactionType: "like",
    userId: "user-b",
  },
  {
    commentId: "comment-a",
    createdAt: "2026-06-06T01:07:00.000Z",
    reactionType: "like",
    userId: "user-c",
  },
  {
    commentId: "comment-c",
    createdAt: "2026-06-06T01:08:00.000Z",
    reactionType: "flag",
    userId: "user-a",
  },
];

const targetReactions: SdkworkEngagementReaction[] = [
  {
    createdAt: "2026-06-06T01:12:00.000Z",
    reactionType: "like",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-a",
  },
  {
    createdAt: "2026-06-06T01:13:00.000Z",
    reactionType: "heart",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-b",
  },
  {
    createdAt: "2026-06-06T01:14:00.000Z",
    reactionType: "like",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-c",
  },
];

const favorites: SdkworkEngagementFavorite[] = [
  {
    createdAt: "2026-06-06T01:15:00.000Z",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-a",
  },
  {
    createdAt: "2026-06-06T01:16:00.000Z",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-b",
  },
];

const visits: SdkworkEngagementVisit[] = [
  {
    createdAt: "2026-06-06T01:17:00.000Z",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-a",
    visitId: "visit-a",
  },
  {
    createdAt: "2026-06-06T01:18:00.000Z",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-a",
    visitId: "visit-b",
  },
  {
    createdAt: "2026-06-06T01:19:00.000Z",
    targetId: "post-launch",
    targetKind: "social-post",
    userId: "user-c",
    visitId: "visit-c",
  },
];

describe("@sdkwork/comments-contracts", () => {
  it("normalizes comment bodies before persistence or transport", () => {
    expect(normalizeCommentBody("  Keep\n\nshipping\tthis   direction.  ")).toBe(
      "Keep\n\nshipping this direction.",
    );
    expect(normalizeCommentBody("   ")).toBe("");
  });

  it("builds a moderation-aware tree with reaction counts", () => {
    expect(createCommentsTree(comments, reactions)).toEqual([
      {
        comment: comments[0],
        depth: 0,
        reactionCounts: {
          like: 2,
        },
        replies: [
          {
            comment: comments[1],
            depth: 1,
            reactionCounts: {},
            replies: [],
          },
        ],
      },
      {
        comment: comments[2],
        depth: 0,
        reactionCounts: {
          flag: 1,
        },
        replies: [],
      },
    ]);
  });

  it("summarizes published, pending, hidden, and reaction state for thread APIs", () => {
    expect(buildCommentsThreadSummary(thread, comments, reactions)).toEqual({
      hiddenCount: 1,
      latestActivityAt: "2026-06-06T01:10:00.000Z",
      ownerId: "post-launch",
      ownerKind: "social-post",
      pendingReviewCount: 1,
      publishedCount: 1,
      reactionCounts: {
        flag: 1,
        like: 2,
      },
      replyCount: 1,
      tenantId: "100001",
      threadId: "thread-product-launch",
      title: "Launch discussion",
      totalCount: 3,
    });
  });

  it("summarizes target-level likes, favorites, and visit history across content APIs", () => {
    expect(
      buildEngagementSummary({
        favorites,
        reactions: targetReactions,
        targetId: "post-launch",
        targetKind: "social-post",
        visits,
      }),
    ).toEqual({
      favoriteCount: 2,
      latestActivityAt: "2026-06-06T01:19:00.000Z",
      reactionCounts: {
        heart: 1,
        like: 2,
      },
      targetId: "post-launch",
      targetKind: "social-post",
      uniqueVisitorCount: 2,
      visitCount: 3,
    });
  });

  it("evaluates create/update/delete/reaction readiness without product-local comment rules", () => {
    expect(
      evaluateCommentCommandReadiness({
        action: "create",
        body: "  Looks useful. ",
        canModerate: false,
        canWrite: true,
        threadLocked: false,
      }),
    ).toEqual({
      issues: [],
      normalizedBody: "Looks useful.",
      ready: true,
    });

    expect(
      evaluateCommentCommandReadiness({
        action: "create",
        body: "",
        canModerate: false,
        canWrite: true,
        threadLocked: false,
      }),
    ).toEqual({
      issues: ["empty-body"],
      normalizedBody: "",
      ready: false,
    });

    expect(
      evaluateCommentCommandReadiness({
        action: "moderate",
        canModerate: false,
        canWrite: true,
        threadLocked: false,
      }),
    ).toEqual({
      issues: ["missing-moderation-permission"],
      normalizedBody: "",
      ready: false,
    });
  });
});
