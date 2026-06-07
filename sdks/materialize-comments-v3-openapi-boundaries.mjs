import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GENERATOR_PATH = path.resolve(ROOT, "../sdkwork-sdk-generator/bin/sdkgen.js");
const VERSION = "1.0.0";
const OWNER = "sdkwork-comments";
const DOMAIN = "comments";
const TAG = "comments";
const ENGAGEMENT_TAG = "engagement";

const LANGUAGE_MATRIX = {
  typescript: {
    appPackage: "@sdkwork/comments-app-sdk",
    backendPackage: "@sdkwork/comments-backend-sdk",
    manifest: "package.json",
  },
};

async function ensureDir(filePath) {
  await mkdir(path.dirname(filePath), { recursive: true });
}

async function writeJson(filePath, value) {
  await ensureDir(filePath);
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeText(filePath, value) {
  await ensureDir(filePath);
  await writeFile(filePath, value, "utf8");
}

function problemResponses() {
  const response = (description) => ({
    description,
    content: {
      "application/problem+json": {
        schema: { $ref: "#/components/schemas/ProblemDetail" },
      },
    },
  });

  return {
    400: response("Bad request"),
    401: response("Unauthorized"),
    403: response("Forbidden"),
    404: response("Not found"),
    409: response("Conflict"),
    500: response("Internal server error"),
  };
}

function jsonResponse(schemaRef) {
  return {
    description: "Success",
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` },
      },
    },
  };
}

function security() {
  return [{ AuthToken: [], AccessToken: [] }];
}

function pageQueryParameters() {
  return [
    {
      name: "page",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, default: 1 },
    },
    {
      name: "page_size",
      in: "query",
      required: false,
      schema: { type: "integer", minimum: 1, maximum: 200, default: 20 },
    },
  ];
}

function statusQueryParameter() {
  return {
    name: "status",
    in: "query",
    required: false,
    schema: { $ref: "#/components/schemas/CommentStatus" },
  };
}

function targetKindQueryParameter() {
  return {
    name: "target_kind",
    in: "query",
    required: false,
    schema: { $ref: "#/components/schemas/EngagementTargetKind" },
  };
}

function targetIdQueryParameter() {
  return {
    name: "target_id",
    in: "query",
    required: false,
    schema: { type: "string" },
  };
}

function userIdQueryParameter() {
  return {
    name: "user_id",
    in: "query",
    required: false,
    schema: { type: "string" },
  };
}

function pathParameter(name, schema = { type: "string" }) {
  return {
    name,
    in: "path",
    required: true,
    schema,
  };
}

function requestBody(schemaRef) {
  return {
    required: true,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaRef}` },
      },
    },
  };
}

function tagForOperation(operationId) {
  return operationId.startsWith("engagement.") ? ENGAGEMENT_TAG : TAG;
}

function operation({
  method,
  path: routePath,
  operationId,
  summary,
  resource,
  permission,
  auditEvent,
  apiAuthority,
  sourceRouteCrate,
  requestSchema,
  responseSchema,
  parameters = [],
  idempotent = false,
  requestContext,
}) {
  const op = {
    tags: [tagForOperation(operationId)],
    summary,
    operationId,
    parameters,
    responses: {
      200: jsonResponse(responseSchema),
      ...problemResponses(),
    },
    security: security(),
    "x-sdkwork-owner": OWNER,
    "x-sdkwork-api-authority": apiAuthority,
    "x-sdkwork-domain": DOMAIN,
    "x-sdkwork-resource": resource,
    "x-sdkwork-permission": permission,
    "x-sdkwork-tenant-scope": "tenant",
    "x-sdkwork-data-scope": "organization",
    "x-sdkwork-audit-event": auditEvent,
    "x-sdkwork-idempotent": idempotent,
    "x-sdkwork-deployment": "all",
    "x-sdkwork-request-context": requestContext,
    "x-sdkwork-source": `packages/native-rust/routes/${apiAuthority.endsWith("app-api") ? "app-api" : "backend-api"}/${sourceRouteCrate}`,
    "x-sdkwork-source-route-crate": sourceRouteCrate,
    "x-sdkwork-server-request-id": true,
  };

  if (requestSchema) {
    op.requestBody = requestBody(requestSchema);
  }

  return [method.toLowerCase(), routePath, op];
}

function manifestRoute({
  method,
  routePath,
  operationId,
  requestSchema = null,
  responseSchema,
  apiAuthority,
  sourceRouteCrate,
  permission,
  auditEvent,
  requestContext,
}) {
  return {
    method,
    path: routePath,
    operationId,
    tags: [tagForOperation(operationId)],
    auth: {
      mode: "dual-token",
      required: true,
      permission,
      tenantScope: "tenant",
      dataScope: "organization",
    },
    handler: {
      module: "crate::handlers",
      name: operationId.replaceAll(".", "_"),
    },
    schemas: {
      request: requestSchema,
      response: responseSchema,
      problem: "ProblemDetail",
    },
    ownership: {
      owner: OWNER,
      apiAuthority,
    },
    source: {
      file: "src/lib.rs",
      routeCrate: sourceRouteCrate,
    },
    extensions: {
      "x-sdkwork-audit-event": auditEvent,
      "x-sdkwork-request-context": requestContext,
    },
  };
}

function schemas() {
  const requestId = {
    type: "string",
    format: "uuid",
    description: "Server-owned request correlation id.",
  };

  const pageInfo = {
    type: "object",
    additionalProperties: false,
    required: ["page", "pageSize", "totalItems", "totalPages"],
    properties: {
      page: { type: "integer", format: "int32", minimum: 1 },
      pageSize: { type: "integer", format: "int32", minimum: 1, maximum: 200 },
      totalItems: { type: "integer", format: "int32", minimum: 0 },
      totalPages: { type: "integer", format: "int32", minimum: 1 },
    },
  };

  return {
    ProblemDetail: {
      type: "object",
      additionalProperties: true,
      required: ["type", "title", "status"],
      properties: {
        type: { type: "string", format: "uri-reference" },
        title: { type: "string" },
        status: { type: "integer", minimum: 100, maximum: 599 },
        detail: { type: "string" },
        instance: { type: "string" },
        code: { type: "string" },
        traceId: { type: "string" },
        requestId,
        errors: {
          type: "array",
          items: { $ref: "#/components/schemas/FieldError" },
        },
      },
    },
    FieldError: {
      type: "object",
      additionalProperties: false,
      required: ["field", "message"],
      properties: {
        field: { type: "string" },
        message: { type: "string" },
        code: { type: "string" },
      },
    },
    CommentOwnerKind: {
      type: "string",
      enum: ["article", "course-lesson", "market-item", "news-item", "social-post", "video"],
    },
    CommentStatus: {
      type: "string",
      enum: ["deleted", "hidden", "pending-review", "published"],
    },
    CommentReactionType: {
      type: "string",
      enum: ["dislike", "flag", "heart", "like"],
    },
    EngagementTargetKind: {
      type: "string",
      enum: ["article", "comment", "course-lesson", "market-item", "news-item", "social-post", "thread", "video"],
    },
    CommentsThread: {
      type: "object",
      additionalProperties: false,
      required: ["id", "ownerId", "ownerKind", "tenantId"],
      properties: {
        id: { type: "string" },
        tenantId: { type: "string" },
        ownerId: { type: "string" },
        ownerKind: { $ref: "#/components/schemas/CommentOwnerKind" },
        title: { type: "string" },
        locked: { type: "boolean", default: false },
        closedAt: { type: "string", format: "date-time" },
      },
    },
    Comment: {
      type: "object",
      additionalProperties: false,
      required: ["id", "threadId", "authorId", "body", "status", "createdAt"],
      properties: {
        id: { type: "string" },
        threadId: { type: "string" },
        parentId: { type: "string" },
        authorId: { type: "string" },
        body: { type: "string" },
        status: { $ref: "#/components/schemas/CommentStatus" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
        deletedAt: { type: "string", format: "date-time" },
      },
    },
    CommentReaction: {
      type: "object",
      additionalProperties: false,
      required: ["commentId", "userId", "reactionType", "createdAt"],
      properties: {
        commentId: { type: "string" },
        userId: { type: "string" },
        reactionType: { $ref: "#/components/schemas/CommentReactionType" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    EngagementReaction: {
      type: "object",
      additionalProperties: false,
      required: ["targetKind", "targetId", "userId", "reactionType", "createdAt"],
      properties: {
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        userId: { type: "string" },
        reactionType: { $ref: "#/components/schemas/CommentReactionType" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    EngagementFavorite: {
      type: "object",
      additionalProperties: false,
      required: ["targetKind", "targetId", "userId", "createdAt"],
      properties: {
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        userId: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    EngagementVisit: {
      type: "object",
      additionalProperties: false,
      required: ["visitId", "targetKind", "targetId", "userId", "createdAt"],
      properties: {
        visitId: { type: "string" },
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        userId: { type: "string" },
        source: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    CommentReactionCounts: {
      type: "object",
      additionalProperties: {
        type: "integer",
        format: "int32",
        minimum: 0,
      },
      properties: {
        dislike: { type: "integer", format: "int32", minimum: 0 },
        flag: { type: "integer", format: "int32", minimum: 0 },
        heart: { type: "integer", format: "int32", minimum: 0 },
        like: { type: "integer", format: "int32", minimum: 0 },
      },
    },
    EngagementSummary: {
      type: "object",
      additionalProperties: false,
      required: [
        "targetKind",
        "targetId",
        "reactionCounts",
        "favoriteCount",
        "visitCount",
        "uniqueVisitorCount",
        "latestActivityAt",
      ],
      properties: {
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        reactionCounts: { $ref: "#/components/schemas/CommentReactionCounts" },
        favoriteCount: { type: "integer", format: "int32", minimum: 0 },
        visitCount: { type: "integer", format: "int32", minimum: 0 },
        uniqueVisitorCount: { type: "integer", format: "int32", minimum: 0 },
        latestActivityAt: { type: "string", format: "date-time" },
      },
    },
    CommentsThreadSummary: {
      type: "object",
      additionalProperties: false,
      required: [
        "threadId",
        "tenantId",
        "ownerId",
        "ownerKind",
        "totalCount",
        "publishedCount",
        "pendingReviewCount",
        "hiddenCount",
        "replyCount",
        "reactionCounts",
        "latestActivityAt",
      ],
      properties: {
        threadId: { type: "string" },
        tenantId: { type: "string" },
        ownerId: { type: "string" },
        ownerKind: { $ref: "#/components/schemas/CommentOwnerKind" },
        title: { type: "string" },
        totalCount: { type: "integer", format: "int32", minimum: 0 },
        publishedCount: { type: "integer", format: "int32", minimum: 0 },
        pendingReviewCount: { type: "integer", format: "int32", minimum: 0 },
        hiddenCount: { type: "integer", format: "int32", minimum: 0 },
        replyCount: { type: "integer", format: "int32", minimum: 0 },
        reactionCounts: { $ref: "#/components/schemas/CommentReactionCounts" },
        latestActivityAt: { type: "string", format: "date-time" },
      },
    },
    CommentsPageInfo: pageInfo,
    CommentCreateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["body"],
      properties: {
        body: { type: "string", minLength: 1, maxLength: 20000 },
        parentId: { type: "string" },
      },
    },
    CommentUpdateRequest: {
      type: "object",
      additionalProperties: false,
      required: ["body"],
      properties: {
        body: { type: "string", minLength: 1, maxLength: 20000 },
      },
    },
    CommentModerationRequest: {
      type: "object",
      additionalProperties: false,
      required: ["status"],
      properties: {
        status: {
          type: "string",
          enum: ["hidden", "pending-review", "published"],
        },
        reason: { type: "string" },
      },
    },
    CommentResponse: {
      type: "object",
      additionalProperties: false,
      required: ["comment", "requestId"],
      properties: {
        comment: { $ref: "#/components/schemas/Comment" },
        requestId,
      },
    },
    CommentDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["commentId", "deleted", "requestId"],
      properties: {
        commentId: { type: "string" },
        deleted: { type: "boolean" },
        requestId,
      },
    },
    CommentReactionResponse: {
      type: "object",
      additionalProperties: false,
      required: ["reaction", "requestId"],
      properties: {
        reaction: { $ref: "#/components/schemas/CommentReaction" },
        requestId,
      },
    },
    CommentReactionDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["commentId", "reactionType", "deleted", "requestId"],
      properties: {
        commentId: { type: "string" },
        reactionType: { $ref: "#/components/schemas/CommentReactionType" },
        deleted: { type: "boolean" },
        requestId,
      },
    },
    EngagementReactionResponse: {
      type: "object",
      additionalProperties: false,
      required: ["reaction", "requestId"],
      properties: {
        reaction: { $ref: "#/components/schemas/EngagementReaction" },
        requestId,
      },
    },
    EngagementReactionDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["targetKind", "targetId", "reactionType", "deleted", "requestId"],
      properties: {
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        reactionType: {
          type: "string",
          enum: ["like"],
        },
        deleted: { type: "boolean" },
        requestId,
      },
    },
    EngagementFavoriteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["favorite", "requestId"],
      properties: {
        favorite: { $ref: "#/components/schemas/EngagementFavorite" },
        requestId,
      },
    },
    EngagementFavoriteDeleteResponse: {
      type: "object",
      additionalProperties: false,
      required: ["targetKind", "targetId", "deleted", "requestId"],
      properties: {
        targetKind: { $ref: "#/components/schemas/EngagementTargetKind" },
        targetId: { type: "string" },
        deleted: { type: "boolean" },
        requestId,
      },
    },
    EngagementVisitCreateRequest: {
      type: "object",
      additionalProperties: false,
      properties: {
        source: { type: "string", maxLength: 128 },
      },
    },
    EngagementVisitResponse: {
      type: "object",
      additionalProperties: false,
      required: ["visit", "requestId"],
      properties: {
        visit: { $ref: "#/components/schemas/EngagementVisit" },
        requestId,
      },
    },
    EngagementSummaryResponse: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "requestId"],
      properties: {
        summary: { $ref: "#/components/schemas/EngagementSummary" },
        requestId,
      },
    },
    CommentsListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/Comment" },
        },
        pageInfo: { $ref: "#/components/schemas/CommentsPageInfo" },
        requestId,
      },
    },
    EngagementVisitListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/EngagementVisit" },
        },
        pageInfo: { $ref: "#/components/schemas/CommentsPageInfo" },
        requestId,
      },
    },
    CommentsThreadSummaryResponse: {
      type: "object",
      additionalProperties: false,
      required: ["summary", "requestId"],
      properties: {
        summary: { $ref: "#/components/schemas/CommentsThreadSummary" },
        requestId,
      },
    },
    CommentsThreadListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/CommentsThread" },
        },
        pageInfo: { $ref: "#/components/schemas/CommentsPageInfo" },
        requestId,
      },
    },
    CommentModerationCase: {
      type: "object",
      additionalProperties: false,
      required: ["id", "threadId", "commentId", "status", "createdAt"],
      properties: {
        id: { type: "string" },
        threadId: { type: "string" },
        commentId: { type: "string" },
        status: {
          type: "string",
          enum: ["closed", "open"],
        },
        reason: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    CommentModerationCaseListResponse: {
      type: "object",
      additionalProperties: false,
      required: ["items", "pageInfo", "requestId"],
      properties: {
        items: {
          type: "array",
          items: { $ref: "#/components/schemas/CommentModerationCase" },
        },
        pageInfo: { $ref: "#/components/schemas/CommentsPageInfo" },
        requestId,
      },
    },
    CommentModerationEvent: {
      type: "object",
      additionalProperties: false,
      required: ["id", "commentId", "actorId", "status", "createdAt"],
      properties: {
        id: { type: "string" },
        commentId: { type: "string" },
        actorId: { type: "string" },
        status: {
          type: "string",
          enum: ["hidden", "pending-review", "published"],
        },
        reason: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
    CommentModerationResponse: {
      type: "object",
      additionalProperties: false,
      required: ["comment", "moderationEvent", "requestId"],
      properties: {
        comment: { $ref: "#/components/schemas/Comment" },
        moderationEvent: { $ref: "#/components/schemas/CommentModerationEvent" },
        requestId,
      },
    },
  };
}

function buildOpenApi({ title, description, apiAuthority, sdkFamily, routes, requestContext }) {
  const paths = {};

  for (const route of routes) {
    const [method, routePath, op] = operation({
      method: route.method,
      path: route.path,
      operationId: route.operationId,
      summary: route.summary,
      resource: route.resource,
      permission: route.permission,
      auditEvent: route.auditEvent,
      apiAuthority,
      sourceRouteCrate: route.sourceRouteCrate,
      requestSchema: route.requestSchema,
      responseSchema: route.responseSchema,
      parameters: route.parameters,
      idempotent: route.idempotent,
      requestContext,
    });

    paths[routePath] = {
      ...(paths[routePath] ?? {}),
      [method]: op,
    };
  }

  return {
    openapi: "3.1.2",
    info: {
      title,
      version: VERSION,
      description,
      "x-sdkwork-api-authority": apiAuthority,
      "x-sdkwork-sdk-family": sdkFamily,
      "x-sdkwork-audience": apiAuthority.endsWith("app-api")
        ? "App, desktop, mobile, H5, and user-facing clients"
        : "Backend console, operators, control plane, and admin integrations",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local sdkwork-comments runtime",
      },
    ],
    tags: [
      {
        name: TAG,
        description: "Comments thread, comment, reaction, and moderation resources.",
        "x-sdk-nested-resource-surface": true,
      },
      {
        name: ENGAGEMENT_TAG,
        description: "Cross-content likes, favorites, visit history, and engagement summary resources.",
        "x-sdk-nested-resource-surface": true,
      },
    ],
    security: security(),
    paths,
    components: {
      securitySchemes: {
        AuthToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "SDKWork auth token carried as Authorization: Bearer <auth_token>.",
        },
        AccessToken: {
          type: "apiKey",
          in: "header",
          name: "Access-Token",
          description: "SDKWork access isolation token.",
        },
      },
      schemas: schemas(),
    },
    "x-sdkwork-materialized-from": [
      {
        owner: OWNER,
        path: `packages/native-rust/routes/${apiAuthority.endsWith("app-api") ? "app-api" : "backend-api"}/${routes[0].sourceRouteCrate}`,
      },
    ],
    "x-sdkwork-request-context": {
      contextObject: requestContext,
      serverRequestId: "server-owned",
      clientRequestIdHeader: "forbidden",
      tenantSource: "AuthToken + AccessToken",
      organizationSource: "AuthToken + AccessToken",
      userSource: "AuthToken + AccessToken",
    },
  };
}

function buildAssembly({ family, title, apiAuthority, prefix, sdkType, packageName }) {
  return {
    workspace: family,
    title,
    apiVersion: VERSION,
    openapiVersion: "3.1.2",
    authoritySpec: `openapi/${apiAuthority}.openapi.yaml`,
    generationInputSpec: `openapi/${apiAuthority}.sdkgen.yaml`,
    derivedSpecs: {
      default: `openapi/${apiAuthority}.sdkgen.yaml`,
    },
    sdkOwner: OWNER,
    apiAuthority,
    sdkDependencies: [],
    discoverySurface: {
      sdkTarget: sdkType,
      apiPrefix: prefix,
      schemaUrl: `${prefix.replace(/\/api$/, "")}/openapi.json`,
      generatedProtocols: ["http-openapi"],
      manualTransports: [],
    },
    languages: Object.entries(LANGUAGE_MATRIX).map(([language, meta]) => ({
      language,
      workspace: `${family}-${language}`,
      generationState: "ready",
      releaseState: "not_published",
      packagePath: `${family}-${language}/generated/server-openapi`,
      manifestPath: `${family}-${language}/generated/server-openapi/${meta.manifest}`,
      name: packageName,
      version: VERSION,
      description: `Generator-owned ${language} transport SDK for ${title}.`,
      generatedPath: `${family}-${language}/generated/server-openapi`,
    })),
    metadata: {
      managedBy: "sdks/materialize-comments-v3-openapi-boundaries.mjs",
      standardVersion: "2026-06-06",
    },
  };
}

function buildComponentSpec({ family, apiAuthority, prefix, sdkType }) {
  return {
    schemaVersion: 1,
    name: family,
    type: "sdk-family",
    domain: DOMAIN,
    apiAuthority,
    apiPrefix: prefix,
    sdkType,
    languages: Object.keys(LANGUAGE_MATRIX),
    generator: {
      package: "@sdkwork/sdk-generator",
      entrypoint: GENERATOR_PATH,
      standardProfile: "sdkwork-v3",
    },
    contracts: {
      sdkDependencies: [],
    },
    auth: {
      mode: "dual-token",
      authTokenHeader: "Authorization",
      accessTokenHeader: "Access-Token",
      requestIdOwnership: "server",
    },
    requestContextFramework: {
      apiSurface: sdkType === "app" ? "app-api" : "backend-api",
      contextType: sdkType === "app" ? "AppRequestContext" : "BackendRequestContext",
      resolver: "AuthTokenParser + AccessTokenParser",
    },
  };
}

function buildRouteManifest({ apiAuthority, prefix, sdkFamily, surface, routes }) {
  return {
    kind: "sdkwork.route.manifest",
    packageName: `sdkwork-routes-comments-${surface}`,
    surface,
    owner: OWNER,
    domain: DOMAIN,
    capability: DOMAIN,
    apiAuthority,
    sdkFamily,
    prefix,
    routes: routes.map((route) =>
      manifestRoute({
        method: route.method,
        routePath: route.path,
        operationId: route.operationId,
        requestSchema: route.requestSchema,
        responseSchema: route.responseSchema,
        apiAuthority,
        sourceRouteCrate: route.sourceRouteCrate,
        permission: route.permission,
        auditEvent: route.auditEvent,
        requestContext: surface === "app-api" ? "AppRequestContext" : "BackendRequestContext",
      }),
    ),
  };
}

function generateScript({ sdkName, authority, sdkType, packagePrefix, apiPrefix }) {
  return `param(
    [string[]]$Languages = @("typescript"),
    [string]$BaseUrl = "http://localhost:8080",
    [string]$SdkVersion = "1.0.0"
)

$ErrorActionPreference = "Stop"

function Resolve-PackageName {
    param([string]$Language)

    switch ($Language) {
        "typescript" { return "@sdkwork/${packagePrefix}" }
        default { return "${sdkName}-$Language" }
    }
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FamilyRoot = (Get-Item $ScriptDir).Parent.FullName
$CommentsRoot = (Get-Item $FamilyRoot).Parent.Parent.FullName
$GeneratorPath = "${GENERATOR_PATH}"
$InputPath = Join-Path $FamilyRoot "openapi\\${authority}.sdkgen.yaml"
$SdkName = "${sdkName}"
$ApiPrefix = "${apiPrefix}"

if (-not (Test-Path $GeneratorPath)) {
    throw "Canonical SDK generator not found: $GeneratorPath"
}
if (-not (Test-Path $InputPath)) {
    & node (Join-Path $CommentsRoot "sdks\\materialize-comments-v3-openapi-boundaries.mjs")
}
if (-not (Test-Path $InputPath)) {
    throw "OpenAPI sdkgen input not found: $InputPath"
}

foreach ($LanguageValue in $Languages) {
    foreach ($LanguagePart in "$LanguageValue".Split(",")) {
        $Language = $LanguagePart.Trim()
        if ([string]::IsNullOrWhiteSpace($Language)) {
            continue
        }

        $LanguageWorkspace = Join-Path $FamilyRoot "$SdkName-$Language"
        $OutputPath = Join-Path $LanguageWorkspace "generated\\server-openapi"
        $PackageName = Resolve-PackageName $Language
        $ResolvedLanguageWorkspace = [System.IO.Path]::GetFullPath($LanguageWorkspace)
        $ResolvedOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
        $LanguageWorkspacePrefix = $ResolvedLanguageWorkspace.TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar

        if (-not $ResolvedOutputPath.StartsWith($LanguageWorkspacePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
            throw "Refusing to clean SDK output outside language workspace: $ResolvedOutputPath"
        }

        if (Test-Path $OutputPath) {
            Remove-Item -LiteralPath $OutputPath -Recurse -Force
        }
        Write-Host "Generating $Language SDK at $OutputPath" -ForegroundColor Cyan
        & node $GeneratorPath generate \`
            -i $InputPath \`
            -o $OutputPath \`
            -n $SdkName \`
            -t ${sdkType} \`
            -l $Language \`
            --fixed-sdk-version $SdkVersion \`
            --base-url $BaseUrl \`
            --api-prefix $ApiPrefix \`
            --package-name $PackageName \`
            --standard-profile sdkwork-v3 \`
            --sdk-root $FamilyRoot \`
            --sdk-name $SdkName \`
            --no-sync-published-version

        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }
}
`;
}

async function materializeFamily({ family, title, description, apiAuthority, prefix, sdkType, packageName, routes }) {
  const requestContext = sdkType === "app" ? "AppRequestContext" : "BackendRequestContext";
  const openApi = buildOpenApi({
    title,
    description,
    apiAuthority,
    sdkFamily: family,
    routes,
    requestContext,
  });
  const sdkgen = {
    ...openApi,
    "x-sdkwork-derived-from": `openapi/${apiAuthority}.openapi.yaml`,
  };
  const assembly = buildAssembly({ family, title, apiAuthority, prefix, sdkType, packageName });
  const component = buildComponentSpec({ family, apiAuthority, prefix, sdkType });
  const routeManifest = buildRouteManifest({
    apiAuthority,
    prefix,
    sdkFamily: family,
    surface: sdkType === "app" ? "app-api" : "backend-api",
    routes,
  });

  await writeText(
    path.join(ROOT, "sdks", family, "README.md"),
    `# ${family}

Generated ${sdkType} SDK family for sdkwork-comments.

Run \`bin/generate-sdk.ps1 -Languages typescript\` after materializing OpenAPI inputs.
`,
  );
  await writeJson(path.join(ROOT, "sdks", family, ".sdkwork-assembly.json"), assembly);
  await writeJson(path.join(ROOT, "sdks", family, "specs", "component.spec.json"), component);
  await writeJson(path.join(ROOT, "sdks", family, "openapi", `${apiAuthority}.openapi.yaml`), openApi);
  await writeJson(path.join(ROOT, "sdks", family, "openapi", `${apiAuthority}.sdkgen.yaml`), sdkgen);
  await writeText(
    path.join(ROOT, "sdks", family, "bin", "generate-sdk.ps1"),
    generateScript({
      sdkName: family,
      authority: apiAuthority,
      sdkType,
      packagePrefix: packageName.replace(/^@sdkwork\//u, ""),
      apiPrefix: prefix,
    }),
  );
  await writeJson(
    path.join(
      ROOT,
      "sdks",
      "_route-manifests",
      sdkType === "app" ? "app-api" : "backend-api",
      `sdkwork-routes-comments-${sdkType === "app" ? "app-api" : "backend-api"}.route-manifest.json`,
    ),
    routeManifest,
  );
}

async function main() {
  const threadId = pathParameter("threadId");
  const commentId = pathParameter("commentId");
  const reactionType = pathParameter("reactionType", { $ref: "#/components/schemas/CommentReactionType" });
  const targetKind = pathParameter("targetKind", { $ref: "#/components/schemas/EngagementTargetKind" });
  const targetId = pathParameter("targetId");
  const appRouteCrate = "sdkwork-routes-comments-app-api";
  const backendRouteCrate = "sdkwork-routes-comments-backend-api";

  const appRoutes = [
    {
      method: "GET",
      path: "/app/v3/api/comments/threads/{threadId}/summary",
      operationId: "comments.threads.summary",
      summary: "Get a comments thread summary.",
      resource: "comments.threads",
      permission: "comments.threads.read",
      auditEvent: "comments.thread.summary",
      responseSchema: "CommentsThreadSummaryResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [threadId],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/app/v3/api/comments/threads/{threadId}/comments",
      operationId: "comments.comments.list",
      summary: "List comments in a thread.",
      resource: "comments.comments",
      permission: "comments.comments.read",
      auditEvent: "comments.comment.list",
      responseSchema: "CommentsListResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [threadId, ...pageQueryParameters(), statusQueryParameter()],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/app/v3/api/comments/threads/{threadId}/comments",
      operationId: "comments.comments.create",
      summary: "Create a comment in a thread.",
      resource: "comments.comments",
      permission: "comments.comments.write",
      auditEvent: "comments.comment.create",
      requestSchema: "CommentCreateRequest",
      responseSchema: "CommentResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [threadId],
      idempotent: false,
    },
    {
      method: "PATCH",
      path: "/app/v3/api/comments/comments/{commentId}",
      operationId: "comments.comments.update",
      summary: "Update an existing comment.",
      resource: "comments.comments",
      permission: "comments.comments.write",
      auditEvent: "comments.comment.update",
      requestSchema: "CommentUpdateRequest",
      responseSchema: "CommentResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [commentId],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/app/v3/api/comments/comments/{commentId}",
      operationId: "comments.comments.delete",
      summary: "Delete an existing comment.",
      resource: "comments.comments",
      permission: "comments.comments.write",
      auditEvent: "comments.comment.delete",
      responseSchema: "CommentDeleteResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [commentId],
      idempotent: true,
    },
    {
      method: "PUT",
      path: "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}",
      operationId: "comments.reactions.upsert",
      summary: "Create or replace a comment reaction.",
      resource: "comments.reactions",
      permission: "comments.reactions.write",
      auditEvent: "comments.reaction.upsert",
      responseSchema: "CommentReactionResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [commentId, reactionType],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}",
      operationId: "comments.reactions.delete",
      summary: "Delete a comment reaction.",
      resource: "comments.reactions",
      permission: "comments.reactions.write",
      auditEvent: "comments.reaction.delete",
      responseSchema: "CommentReactionDeleteResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [commentId, reactionType],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/summary",
      operationId: "engagement.targets.summary",
      summary: "Get cross-content engagement summary for a target.",
      resource: "engagement.targets",
      permission: "engagement.read",
      auditEvent: "engagement.target.summary",
      responseSchema: "EngagementSummaryResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "PUT",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes",
      operationId: "engagement.likes.upsert",
      summary: "Like any supported content target.",
      resource: "engagement.likes",
      permission: "engagement.write",
      auditEvent: "engagement.like.upsert",
      responseSchema: "EngagementReactionResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes",
      operationId: "engagement.likes.delete",
      summary: "Remove a like from any supported content target.",
      resource: "engagement.likes",
      permission: "engagement.write",
      auditEvent: "engagement.like.delete",
      responseSchema: "EngagementReactionDeleteResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "PUT",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites",
      operationId: "engagement.favorites.upsert",
      summary: "Favorite any supported content target.",
      resource: "engagement.favorites",
      permission: "engagement.write",
      auditEvent: "engagement.favorite.upsert",
      responseSchema: "EngagementFavoriteResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites",
      operationId: "engagement.favorites.delete",
      summary: "Remove a favorite from any supported content target.",
      resource: "engagement.favorites",
      permission: "engagement.write",
      auditEvent: "engagement.favorite.delete",
      responseSchema: "EngagementFavoriteDeleteResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "POST",
      path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/visits",
      operationId: "engagement.visits.create",
      summary: "Record a visit for any supported content target.",
      resource: "engagement.visits",
      permission: "engagement.write",
      auditEvent: "engagement.visit.create",
      requestSchema: "EngagementVisitCreateRequest",
      responseSchema: "EngagementVisitResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: false,
    },
    {
      method: "GET",
      path: "/app/v3/api/engagement/visits",
      operationId: "engagement.visits.list",
      summary: "List the current user's cross-content visit history.",
      resource: "engagement.visits",
      permission: "engagement.read",
      auditEvent: "engagement.visit.list",
      responseSchema: "EngagementVisitListResponse",
      sourceRouteCrate: appRouteCrate,
      parameters: [...pageQueryParameters(), targetKindQueryParameter(), targetIdQueryParameter()],
      idempotent: true,
    },
  ];

  const backendRoutes = [
    {
      method: "GET",
      path: "/backend/v3/api/comments/threads",
      operationId: "comments.threads.list",
      summary: "List comments threads for backend administration.",
      resource: "comments.threads",
      permission: "comments.threads.read",
      auditEvent: "comments.thread.list",
      responseSchema: "CommentsThreadListResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: pageQueryParameters(),
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/comments/threads/{threadId}/summary",
      operationId: "comments.threads.summary",
      summary: "Get a backend comments thread summary.",
      resource: "comments.threads",
      permission: "comments.threads.read",
      auditEvent: "comments.thread.summary",
      responseSchema: "CommentsThreadSummaryResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [threadId],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/comments/threads/{threadId}/comments",
      operationId: "comments.comments.list",
      summary: "List comments in a thread for backend administration.",
      resource: "comments.comments",
      permission: "comments.comments.read",
      auditEvent: "comments.comment.list",
      responseSchema: "CommentsListResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [threadId, ...pageQueryParameters(), statusQueryParameter()],
      idempotent: true,
    },
    {
      method: "DELETE",
      path: "/backend/v3/api/comments/comments/{commentId}",
      operationId: "comments.comments.delete",
      summary: "Delete a comment as a backend operator.",
      resource: "comments.comments",
      permission: "comments.comments.moderate",
      auditEvent: "comments.comment.delete",
      responseSchema: "CommentDeleteResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [commentId],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/comments/moderation/cases",
      operationId: "comments.moderation.cases.list",
      summary: "List comments moderation cases.",
      resource: "comments.moderation",
      permission: "comments.moderation.read",
      auditEvent: "comments.moderation.case.list",
      responseSchema: "CommentModerationCaseListResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [...pageQueryParameters(), statusQueryParameter()],
      idempotent: true,
    },
    {
      method: "PATCH",
      path: "/backend/v3/api/comments/comments/{commentId}/moderation",
      operationId: "comments.moderation.update",
      summary: "Apply a moderation decision to a comment.",
      resource: "comments.moderation",
      permission: "comments.moderation.write",
      auditEvent: "comments.moderation.update",
      requestSchema: "CommentModerationRequest",
      responseSchema: "CommentModerationResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [commentId],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/engagement/targets/{targetKind}/{targetId}/summary",
      operationId: "engagement.targets.summary",
      summary: "Get backend cross-content engagement summary for a target.",
      resource: "engagement.targets",
      permission: "engagement.read",
      auditEvent: "engagement.target.summary",
      responseSchema: "EngagementSummaryResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [targetKind, targetId],
      idempotent: true,
    },
    {
      method: "GET",
      path: "/backend/v3/api/engagement/visits",
      operationId: "engagement.visits.list",
      summary: "List cross-content visit history for backend inspection.",
      resource: "engagement.visits",
      permission: "engagement.read",
      auditEvent: "engagement.visit.list",
      responseSchema: "EngagementVisitListResponse",
      sourceRouteCrate: backendRouteCrate,
      parameters: [
        ...pageQueryParameters(),
        targetKindQueryParameter(),
        targetIdQueryParameter(),
        userIdQueryParameter(),
      ],
      idempotent: true,
    },
  ];

  await materializeFamily({
    family: "sdkwork-comments-app-sdk",
    title: "SDKWork Comments App API",
    description: "User-facing comments API for threads, comments, reactions, likes, favorites, and visit history.",
    apiAuthority: "sdkwork-comments-app-api",
    prefix: "/app/v3/api",
    sdkType: "app",
    packageName: "@sdkwork/comments-app-sdk",
    routes: appRoutes,
  });

  await materializeFamily({
    family: "sdkwork-comments-backend-sdk",
    title: "SDKWork Comments Backend API",
    description: "Backend comments API for moderation, thread inspection, administrative deletion, and engagement inspection.",
    apiAuthority: "sdkwork-comments-backend-api",
    prefix: "/backend/v3/api",
    sdkType: "backend",
    packageName: "@sdkwork/comments-backend-sdk",
    routes: backendRoutes,
  });
}

await main();
