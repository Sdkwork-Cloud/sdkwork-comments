import {
  normalizeCommentBody,
  type SdkworkCommentCreateRequest,
  type SdkworkCommentDeleteResponse,
  type SdkworkCommentModerationCaseListResponse,
  type SdkworkCommentModerationRequest,
  type SdkworkCommentModerationResponse,
  type SdkworkCommentReactionDeleteResponse,
  type SdkworkCommentReactionResponse,
  type SdkworkCommentReactionType,
  type SdkworkCommentResponse,
  type SdkworkEngagementReactionDeleteResponse,
  type SdkworkEngagementReactionResponse,
  type SdkworkEngagementSummaryResponse,
  type SdkworkEngagementFavoriteDeleteResponse,
  type SdkworkEngagementFavoriteResponse,
  type SdkworkCommentsListRequest,
  type SdkworkCommentsListResponse,
  type SdkworkEngagementTargetKind,
  type SdkworkCommentsThreadListResponse,
  type SdkworkCommentsThreadSummaryResponse,
  type SdkworkEngagementVisitCreateRequest,
  type SdkworkEngagementVisitListRequest,
  type SdkworkEngagementVisitListResponse,
  type SdkworkEngagementVisitResponse,
  type SdkworkCommentUpdateRequest,
} from "@sdkwork/comments-contracts";

export interface SdkworkCommentsAppSdkClient {
  comments: {
    comments: {
      create(threadId: string, body: SdkworkCommentCreateRequest): Promise<SdkworkCommentResponse>;
      delete(commentId: string): Promise<SdkworkCommentDeleteResponse>;
      list(threadId: string, params?: SdkworkCommentsListRequest): Promise<SdkworkCommentsListResponse>;
      update(commentId: string, body: SdkworkCommentUpdateRequest): Promise<SdkworkCommentResponse>;
    };
    reactions: {
      delete(
        commentId: string,
        reactionType: SdkworkCommentReactionType,
      ): Promise<SdkworkCommentReactionDeleteResponse>;
      upsert(
        commentId: string,
        reactionType: SdkworkCommentReactionType,
      ): Promise<SdkworkCommentReactionResponse>;
    };
    threads: {
      summary(threadId: string): Promise<SdkworkCommentsThreadSummaryResponse>;
    };
  };
  engagement: {
    favorites: {
      delete(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
      ): Promise<SdkworkEngagementFavoriteDeleteResponse>;
      upsert(targetKind: SdkworkEngagementTargetKind, targetId: string): Promise<SdkworkEngagementFavoriteResponse>;
    };
    likes: {
      delete(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
      ): Promise<SdkworkEngagementReactionDeleteResponse>;
      upsert(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
      ): Promise<SdkworkEngagementReactionResponse>;
    };
    targets: {
      summary(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
      ): Promise<SdkworkEngagementSummaryResponse>;
    };
    visits: {
      create(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
        body: SdkworkEngagementVisitCreateRequest,
      ): Promise<SdkworkEngagementVisitResponse>;
      list(params?: SdkworkEngagementVisitListRequest): Promise<SdkworkEngagementVisitListResponse>;
    };
  };
}

export interface SdkworkCommentsBackendSdkClient {
  comments: {
    comments: {
      delete(commentId: string): Promise<SdkworkCommentDeleteResponse>;
      list(threadId: string, params?: SdkworkCommentsListRequest): Promise<SdkworkCommentsListResponse>;
    };
    moderation: {
      cases: {
        list(params?: SdkworkCommentsListRequest): Promise<SdkworkCommentModerationCaseListResponse>;
      };
      update(commentId: string, body: SdkworkCommentModerationRequest): Promise<SdkworkCommentModerationResponse>;
    };
    threads: {
      list(params?: SdkworkCommentsListRequest): Promise<SdkworkCommentsThreadListResponse>;
      summary(threadId: string): Promise<SdkworkCommentsThreadSummaryResponse>;
    };
  };
  engagement: {
    targets: {
      summary(
        targetKind: SdkworkEngagementTargetKind,
        targetId: string,
      ): Promise<SdkworkEngagementSummaryResponse>;
    };
    visits: {
      list(params?: SdkworkEngagementVisitListRequest): Promise<SdkworkEngagementVisitListResponse>;
    };
  };
}

export interface CreateSdkworkCommentsServiceOptions {
  appClient?: SdkworkCommentsAppSdkClient;
  backendClient?: SdkworkCommentsBackendSdkClient;
}

export interface SdkworkCommentsService {
  createComment(threadId: string, request: SdkworkCommentCreateRequest): Promise<SdkworkCommentResponse>;
  deleteComment(commentId: string): Promise<SdkworkCommentDeleteResponse>;
  deleteReaction(
    commentId: string,
    reactionType: SdkworkCommentReactionType,
  ): Promise<SdkworkCommentReactionDeleteResponse>;
  favoriteTarget(targetKind: SdkworkEngagementTargetKind, targetId: string): Promise<SdkworkEngagementFavoriteResponse>;
  unfavoriteTarget(
    targetKind: SdkworkEngagementTargetKind,
    targetId: string,
  ): Promise<SdkworkEngagementFavoriteDeleteResponse>;
  likeTarget(
    targetKind: SdkworkEngagementTargetKind,
    targetId: string,
  ): Promise<SdkworkEngagementReactionResponse>;
  listComments(threadId: string, request?: SdkworkCommentsListRequest): Promise<SdkworkCommentsListResponse>;
  listVisitHistory(request?: SdkworkEngagementVisitListRequest): Promise<SdkworkEngagementVisitListResponse>;
  listModerationCases(request?: SdkworkCommentsListRequest): Promise<SdkworkCommentModerationCaseListResponse>;
  listThreads(request?: SdkworkCommentsListRequest): Promise<SdkworkCommentsThreadListResponse>;
  moderateComment(
    commentId: string,
    request: SdkworkCommentModerationRequest,
  ): Promise<SdkworkCommentModerationResponse>;
  recordVisit(
    targetKind: SdkworkEngagementTargetKind,
    targetId: string,
    request?: SdkworkEngagementVisitCreateRequest,
  ): Promise<SdkworkEngagementVisitResponse>;
  summarizeTargetEngagement(
    targetKind: SdkworkEngagementTargetKind,
    targetId: string,
  ): Promise<SdkworkEngagementSummaryResponse>;
  summarizeThread(threadId: string): Promise<SdkworkCommentsThreadSummaryResponse>;
  unlikeTarget(
    targetKind: SdkworkEngagementTargetKind,
    targetId: string,
  ): Promise<SdkworkEngagementReactionDeleteResponse>;
  updateComment(commentId: string, request: SdkworkCommentUpdateRequest): Promise<SdkworkCommentResponse>;
  upsertReaction(
    commentId: string,
    reactionType: SdkworkCommentReactionType,
  ): Promise<SdkworkCommentReactionResponse>;
}

function requireAppClient(appClient: SdkworkCommentsAppSdkClient | undefined): SdkworkCommentsAppSdkClient {
  if (!appClient) {
    throw new Error("Missing comments app SDK client");
  }

  return appClient;
}

function requireBackendClient(
  backendClient: SdkworkCommentsBackendSdkClient | undefined,
): SdkworkCommentsBackendSdkClient {
  if (!backendClient) {
    throw new Error("Missing comments backend SDK client");
  }

  return backendClient;
}

export function createSdkworkCommentsService({
  appClient,
  backendClient,
}: CreateSdkworkCommentsServiceOptions = {}): SdkworkCommentsService {
  return {
    async createComment(threadId, request) {
      return requireAppClient(appClient).comments.comments.create(threadId, {
        ...request,
        body: normalizeCommentBody(request.body),
      });
    },

    async deleteComment(commentId) {
      if (appClient) {
        return appClient.comments.comments.delete(commentId);
      }

      return requireBackendClient(backendClient).comments.comments.delete(commentId);
    },

    async deleteReaction(commentId, reactionType) {
      return requireAppClient(appClient).comments.reactions.delete(commentId, reactionType);
    },

    async favoriteTarget(targetKind, targetId) {
      return requireAppClient(appClient).engagement.favorites.upsert(targetKind, targetId);
    },

    async unfavoriteTarget(targetKind, targetId) {
      return requireAppClient(appClient).engagement.favorites.delete(targetKind, targetId);
    },

    async likeTarget(targetKind, targetId) {
      return requireAppClient(appClient).engagement.likes.upsert(targetKind, targetId);
    },

    async listComments(threadId, request) {
      return requireAppClient(appClient).comments.comments.list(threadId, request);
    },

    async listVisitHistory(request) {
      if (appClient) {
        return appClient.engagement.visits.list(request);
      }

      return requireBackendClient(backendClient).engagement.visits.list(request);
    },

    async listModerationCases(request) {
      return requireBackendClient(backendClient).comments.moderation.cases.list(request);
    },

    async listThreads(request) {
      return requireBackendClient(backendClient).comments.threads.list(request);
    },

    async moderateComment(commentId, request) {
      return requireBackendClient(backendClient).comments.moderation.update(commentId, request);
    },

    async recordVisit(targetKind, targetId, request = {}) {
      return requireAppClient(appClient).engagement.visits.create(targetKind, targetId, request);
    },

    async summarizeTargetEngagement(targetKind, targetId) {
      if (appClient) {
        return appClient.engagement.targets.summary(targetKind, targetId);
      }

      return requireBackendClient(backendClient).engagement.targets.summary(targetKind, targetId);
    },

    async summarizeThread(threadId) {
      if (appClient) {
        return appClient.comments.threads.summary(threadId);
      }

      return requireBackendClient(backendClient).comments.threads.summary(threadId);
    },

    async unlikeTarget(targetKind, targetId) {
      return requireAppClient(appClient).engagement.likes.delete(targetKind, targetId);
    },

    async updateComment(commentId, request) {
      return requireAppClient(appClient).comments.comments.update(commentId, {
        ...request,
        body: normalizeCommentBody(request.body),
      });
    },

    async upsertReaction(commentId, reactionType) {
      return requireAppClient(appClient).comments.reactions.upsert(commentId, reactionType);
    },
  };
}

export const createCommentsService = createSdkworkCommentsService;
