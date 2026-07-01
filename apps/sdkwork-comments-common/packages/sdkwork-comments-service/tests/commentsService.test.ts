import { describe, expect, it } from "vitest";
import { createSdkworkCommentsService } from "../src";
import type {
  SdkworkCommentCreateRequest,
  SdkworkEngagementTargetKind,
  SdkworkEngagementVisitCreateRequest,
} from "@sdkwork/comments-contracts";

function unusedEngagementAppSurface() {
  return {
    favorites: {
      delete: async (targetKind: SdkworkEngagementTargetKind, targetId: string) => ({
        deleted: true,
        requestId: "unused",
        targetId,
        targetKind,
      }),
      upsert: async (targetKind: SdkworkEngagementTargetKind, targetId: string) => ({
        favorite: {
          createdAt: "2026-06-06T02:00:00.000Z",
          targetId,
          targetKind,
          userId: "user-1",
        },
        requestId: "unused",
      }),
    },
    likes: {
      delete: async (targetKind: SdkworkEngagementTargetKind, targetId: string) => ({
        deleted: true,
        reactionType: "like" as const,
        requestId: "unused",
        targetId,
        targetKind,
      }),
      upsert: async (targetKind: SdkworkEngagementTargetKind, targetId: string) => ({
        reaction: {
          createdAt: "2026-06-06T02:00:00.000Z",
          reactionType: "like" as const,
          targetId,
          targetKind,
          userId: "user-1",
        },
        requestId: "unused",
      }),
    },
    targets: {
      summary: async (targetKind: SdkworkEngagementTargetKind, targetId: string) => ({
        requestId: "unused",
        summary: {
          favoriteCount: 0,
          latestActivityAt: "1970-01-01T00:00:00.000Z",
          reactionCounts: {},
          targetId,
          targetKind,
          uniqueVisitorCount: 0,
          visitCount: 0,
        },
      }),
    },
    visits: {
      create: async (
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
        body: SdkworkEngagementVisitCreateRequest,
      ) => ({
        requestId: "unused",
        visit: {
          createdAt: "2026-06-06T02:00:00.000Z",
          source: body.source,
          targetId,
          targetKind,
          userId: "user-1",
          visitId: "visit-unused",
        },
      }),
      list: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
        requestId: "unused",
      }),
    },
  };
}

function unusedEngagementBackendSurface() {
  return {
    targets: unusedEngagementAppSurface().targets,
    visits: unusedEngagementAppSurface().visits,
  };
}

describe("@sdkwork/comments-service", () => {
  it("routes user-facing comment reads and writes through the generated app SDK surface", async () => {
    const calls: string[] = [];
    const service = createSdkworkCommentsService({
      appClient: {
        comments: {
          comments: {
            create: async (threadId, body) => {
              calls.push(`create:${threadId}:${body.body}`);
              return {
                comment: {
                  authorId: "user-1",
                  body: body.body,
                  createdAt: "2026-06-06T02:00:00.000Z",
                  id: "comment-1",
                  status: "published",
                  threadId,
                },
                requestId: "request-1",
              };
            },
            delete: async (commentId) => ({
              commentId,
              deleted: true,
              requestId: "request-delete",
            }),
            list: async (threadId) => {
              calls.push(`list:${threadId}`);
              return {
                items: [],
                pageInfo: {
                  page: 1,
                  pageSize: 20,
                  totalItems: 0,
                  totalPages: 1,
                },
                requestId: "request-2",
              };
            },
            update: async (commentId, body) => ({
              comment: {
                authorId: "user-1",
                body: body.body,
                createdAt: "2026-06-06T02:00:00.000Z",
                id: commentId,
                status: "published",
                threadId: "thread-1",
              },
              requestId: "request-update",
            }),
          },
          reactions: {
            delete: async (commentId, reactionType) => ({
              commentId,
              deleted: true,
              reactionType,
              requestId: "request-reaction-delete",
            }),
            upsert: async (commentId, reactionType) => ({
              reaction: {
                commentId,
                createdAt: "2026-06-06T02:01:00.000Z",
                reactionType,
                userId: "user-1",
              },
              requestId: "request-reaction-upsert",
            }),
          },
          threads: {
            summary: async (threadId) => ({
              requestId: "request-summary",
              summary: {
                hiddenCount: 0,
                latestActivityAt: "2026-06-06T02:00:00.000Z",
                ownerId: "owner-1",
                ownerKind: "social-post",
                pendingReviewCount: 0,
                publishedCount: 1,
                reactionCounts: {},
                replyCount: 0,
                tenantId: "100001",
                threadId,
                totalCount: 1,
              },
            }),
          },
        },
        engagement: unusedEngagementAppSurface(),
      },
    });

    const request: SdkworkCommentCreateRequest = {
      body: "  Keep going. ",
    };

    await expect(service.createComment("thread-1", request)).resolves.toMatchObject({
      comment: {
        body: "Keep going.",
        threadId: "thread-1",
      },
    });
    await expect(service.listComments("thread-1")).resolves.toMatchObject({
      items: [],
      requestId: "request-2",
    });
    expect(calls).toEqual(["create:thread-1:Keep going.", "list:thread-1"]);
  });

  it("routes likes, favorites, and visit history through the generated app SDK engagement surface", async () => {
    const calls: string[] = [];
    const service = createSdkworkCommentsService({
      appClient: {
        comments: {
          comments: {
            create: async () => {
              throw new Error("not used");
            },
            delete: async () => {
              throw new Error("not used");
            },
            list: async () => {
              throw new Error("not used");
            },
            update: async () => {
              throw new Error("not used");
            },
          },
          reactions: {
            delete: async () => {
              throw new Error("not used");
            },
            upsert: async () => {
              throw new Error("not used");
            },
          },
          threads: {
            summary: async () => {
              throw new Error("not used");
            },
          },
        },
        engagement: {
          favorites: {
            delete: async (targetKind, targetId) => {
              calls.push(`favorite:delete:${targetKind}:${targetId}`);
              return {
                deleted: true,
                requestId: "request-favorite-delete",
                targetId,
                targetKind,
              };
            },
            upsert: async (targetKind, targetId) => {
              calls.push(`favorite:upsert:${targetKind}:${targetId}`);
              return {
                favorite: {
                  createdAt: "2026-06-06T02:12:00.000Z",
                  targetId,
                  targetKind,
                  userId: "user-1",
                },
                requestId: "request-favorite-upsert",
              };
            },
          },
          likes: {
            delete: async (targetKind, targetId) => {
              calls.push(`like:delete:${targetKind}:${targetId}`);
              return {
                deleted: true,
                reactionType: "like",
                requestId: "request-like-delete",
                targetId,
                targetKind,
              };
            },
            upsert: async (targetKind, targetId) => {
              calls.push(`like:upsert:${targetKind}:${targetId}`);
              return {
                reaction: {
                  createdAt: "2026-06-06T02:10:00.000Z",
                  reactionType: "like",
                  targetId,
                  targetKind,
                  userId: "user-1",
                },
                requestId: "request-like-upsert",
              };
            },
          },
          targets: {
            summary: async (targetKind, targetId) => {
              calls.push(`summary:${targetKind}:${targetId}`);
              return {
                requestId: "request-summary",
                summary: {
                  favoriteCount: 1,
                  latestActivityAt: "2026-06-06T02:11:00.000Z",
                  reactionCounts: {
                    like: 1,
                  },
                  targetId,
                  targetKind,
                  uniqueVisitorCount: 1,
                  visitCount: 1,
                },
              };
            },
          },
          visits: {
            create: async (targetKind, targetId, body: SdkworkEngagementVisitCreateRequest) => {
              calls.push(`visit:create:${targetKind}:${targetId}:${body.source ?? "none"}`);
              return {
                requestId: "request-visit",
                visit: {
                  createdAt: "2026-06-06T02:11:00.000Z",
                  source: body.source,
                  targetId,
                  targetKind,
                  userId: "user-1",
                  visitId: "visit-1",
                },
              };
            },
            list: async (params) => {
              calls.push(`visit:list:${params?.targetKind ?? "all"}:${params?.targetId ?? "all"}`);
              return {
                items: [],
                pageInfo: {
                  page: 1,
                  pageSize: 20,
                  totalItems: 0,
                  totalPages: 1,
                },
                requestId: "request-visits",
              };
            },
          },
        },
      },
    });

    await expect(service.likeTarget("social-post", "post-launch")).resolves.toMatchObject({
      reaction: {
        reactionType: "like",
        targetId: "post-launch",
        targetKind: "social-post",
      },
    });
    await expect(service.favoriteTarget("social-post", "post-launch")).resolves.toMatchObject({
      favorite: {
        targetId: "post-launch",
        targetKind: "social-post",
      },
    });
    await expect(
      service.recordVisit("social-post", "post-launch", {
        source: "feed",
      }),
    ).resolves.toMatchObject({
      visit: {
        source: "feed",
        visitId: "visit-1",
      },
    });
    await expect(service.summarizeTargetEngagement("social-post", "post-launch")).resolves.toMatchObject({
      summary: {
        favoriteCount: 1,
        visitCount: 1,
      },
    });
    await service.listVisitHistory({
      targetId: "post-launch",
      targetKind: "social-post",
    });
    await service.unlikeTarget("social-post", "post-launch");
    await service.unfavoriteTarget("social-post", "post-launch");

    expect(calls).toEqual([
      "like:upsert:social-post:post-launch",
      "favorite:upsert:social-post:post-launch",
      "visit:create:social-post:post-launch:feed",
      "summary:social-post:post-launch",
      "visit:list:social-post:post-launch",
      "like:delete:social-post:post-launch",
      "favorite:delete:social-post:post-launch",
    ]);
  });

  it("routes moderation decisions through the generated backend SDK surface", async () => {
    const service = createSdkworkCommentsService({
      backendClient: {
        comments: {
          comments: {
            delete: async (commentId) => ({
              commentId,
              deleted: true,
              requestId: "request-delete",
            }),
            list: async () => ({
              items: [],
              pageInfo: {
                page: 1,
                pageSize: 20,
                totalItems: 0,
                totalPages: 1,
              },
              requestId: "request-list",
            }),
          },
          moderation: {
            cases: {
              list: async () => ({
                items: [],
                pageInfo: {
                  page: 1,
                  pageSize: 20,
                  totalItems: 0,
                  totalPages: 1,
                },
                requestId: "request-cases",
              }),
            },
            update: async (commentId, body) => ({
              comment: {
                authorId: "user-1",
                body: "Hidden now",
                createdAt: "2026-06-06T02:00:00.000Z",
                id: commentId,
                status: body.status,
                threadId: "thread-1",
              },
              moderationEvent: {
                actorId: "moderator-1",
                commentId,
                createdAt: "2026-06-06T02:05:00.000Z",
                id: "event-1",
                reason: body.reason,
                status: body.status,
              },
              requestId: "request-3",
            }),
          },
          threads: {
            list: async () => ({
              items: [],
              pageInfo: {
                page: 1,
                pageSize: 20,
                totalItems: 0,
                totalPages: 1,
              },
              requestId: "request-threads",
            }),
            summary: async (threadId) => ({
              requestId: "request-summary",
              summary: {
                hiddenCount: 0,
                latestActivityAt: "2026-06-06T02:00:00.000Z",
                ownerId: "owner-1",
                ownerKind: "social-post",
                pendingReviewCount: 0,
                publishedCount: 1,
                reactionCounts: {},
                replyCount: 0,
                tenantId: "100001",
                threadId,
                totalCount: 1,
              },
            }),
          },
        },
        engagement: unusedEngagementBackendSurface(),
      },
    });

    await expect(
      service.moderateComment("comment-1", {
        reason: "spam",
        status: "hidden",
      }),
    ).resolves.toMatchObject({
      comment: {
        id: "comment-1",
        status: "hidden",
      },
      moderationEvent: {
        reason: "spam",
      },
    });
  });

  it("routes backend engagement inspection through the generated backend SDK surface", async () => {
    const service = createSdkworkCommentsService({
      backendClient: {
        comments: {
          comments: {
            delete: async () => {
              throw new Error("not used");
            },
            list: async () => {
              throw new Error("not used");
            },
          },
          moderation: {
            cases: {
              list: async () => {
                throw new Error("not used");
              },
            },
            update: async () => {
              throw new Error("not used");
            },
          },
          threads: {
            list: async () => {
              throw new Error("not used");
            },
            summary: async () => {
              throw new Error("not used");
            },
          },
        },
        engagement: {
          targets: {
            summary: async (targetKind, targetId) => ({
              requestId: "request-target-summary",
              summary: {
                favoriteCount: 2,
                latestActivityAt: "2026-06-06T03:00:00.000Z",
                reactionCounts: {
                  like: 3,
                },
                targetId,
                targetKind,
                uniqueVisitorCount: 4,
                visitCount: 5,
              },
            }),
          },
          visits: {
            list: async () => ({
              items: [
                {
                  createdAt: "2026-06-06T03:00:00.000Z",
                  targetId: "post-launch",
                  targetKind: "social-post",
                  userId: "user-1",
                  visitId: "visit-1",
                },
              ],
              pageInfo: {
                page: 1,
                pageSize: 20,
                totalItems: 1,
                totalPages: 1,
              },
              requestId: "request-visits",
            }),
          },
        },
      },
    });

    await expect(service.summarizeTargetEngagement("social-post", "post-launch")).resolves.toMatchObject({
      summary: {
        targetId: "post-launch",
        visitCount: 5,
      },
    });
    await expect(service.listVisitHistory()).resolves.toMatchObject({
      items: [
        {
          visitId: "visit-1",
        },
      ],
    });
  });

  it("fails explicitly when a required generated SDK client is not injected", async () => {
    const service = createSdkworkCommentsService();

    await expect(service.listComments("thread-1")).rejects.toThrow("Missing comments app SDK client");
    await expect(service.likeTarget("social-post", "post-launch")).rejects.toThrow("Missing comments app SDK client");
    await expect(service.listVisitHistory()).rejects.toThrow("Missing comments backend SDK client");
    await expect(
      service.moderateComment("comment-1", {
        status: "hidden",
      }),
    ).rejects.toThrow("Missing comments backend SDK client");
  });
});
