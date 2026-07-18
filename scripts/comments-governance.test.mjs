import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APPBASE_ROOT = path.resolve(ROOT, "..", "sdkwork-appbase");
const GENERATOR_PATH = path.resolve(ROOT, "../sdkwork-sdk-generator/bin/sdkgen.js");

const failures = [];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid or missing JSON-compatible file ${relativePath}: ${error.message}`);
    return null;
  }
}

function walkFiles(root) {
  if (!existsSync(root)) {
    return [];
  }
  if (statSync(root).isFile()) {
    return [root];
  }

  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "target", ".git", "dist", "build", "coverage"].includes(entry.name)) {
          continue;
        }
        stack.push(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  return files;
}

function toRelative(filePath, root = ROOT) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

function assertFile(relativePath) {
  if (!existsSync(path.join(ROOT, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    fail(`${label}: expected ${expected}, got ${actual}`);
  }
}

function operations(openApi) {
  const result = [];
  for (const [routePath, pathItem] of Object.entries(openApi.paths ?? {})) {
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      if (pathItem?.[method]) {
        result.push({ path: routePath, method, operation: pathItem[method] });
      }
    }
  }
  return result;
}

function checkComponentSpec({ relativePath, name }) {
  assertFile(relativePath);
  assertFile(path.join(path.dirname(relativePath), "README.md"));

  const spec = readJson(relativePath);
  if (!spec) {
    return;
  }

  assertEqual(spec.schemaVersion, 1, `${name} component spec schema version`);
  assertEqual(spec.kind, "sdkwork.component.spec", `${name} component spec kind`);
  assertEqual(spec.component?.name, name, `${name} component name`);
  assertEqual(spec.component?.domain, "comments", `${name} component domain`);
  assertEqual(spec.component?.status, "ready", `${name} component status`);

  if (!Array.isArray(spec.verification?.commands) || spec.verification.commands.length === 0) {
    fail(`${name} component spec must declare verification.commands`);
  }
}

function checkAuthoredComponentSpecs() {
  for (const component of [
    {
      name: "@sdkwork/comments-contracts",
      relativePath:
        "apps/sdkwork-comments-common/packages/sdkwork-comments-contracts/specs/component.spec.json",
    },
    {
      name: "@sdkwork/comments-service",
      relativePath:
        "apps/sdkwork-comments-common/packages/sdkwork-comments-service/specs/component.spec.json",
    },
    {
      name: "sdkwork-comments-engagement-repository-sqlx",
      relativePath:
        "crates/sdkwork-comments-engagement-repository-sqlx/specs/component.spec.json",
    },
    {
      name: "sdkwork-routes-comments-app-api",
      relativePath:
        "crates/sdkwork-routes-comments-app-api/specs/component.spec.json",
    },
    {
      name: "sdkwork-routes-comments-backend-api",
      relativePath:
        "crates/sdkwork-routes-comments-backend-api/specs/component.spec.json",
    },
  ]) {
    checkComponentSpec(component);
  }
}

function checkGeneratedSdkOutput({
  family,
  sdkType,
  packageName,
  expectedSurface,
}) {
  const generatedRoot = path.join(
    ROOT,
    "sdks",
    family,
    `${family}-typescript`,
    "generated",
    "server-openapi",
  );

  for (const relativePath of [
    "sdkwork-sdk.json",
    ".sdkwork/sdkwork-generator-manifest.json",
    ".sdkwork/sdkwork-generator-changes.json",
    ".sdkwork/sdkwork-generator-report.json",
    "custom/README.md",
    "custom/build-runtime.mjs",
  ]) {
    if (!existsSync(path.join(generatedRoot, relativePath))) {
      fail(`${family} generated SDK missing ${relativePath}`);
    }
  }

  const sdkManifest = readJson(
    `sdks/${family}/${family}-typescript/generated/server-openapi/sdkwork-sdk.json`,
  );
  const generatorManifest = readJson(
    `sdks/${family}/${family}-typescript/generated/server-openapi/.sdkwork/sdkwork-generator-manifest.json`,
  );
  const generatorChanges = readJson(
    `sdks/${family}/${family}-typescript/generated/server-openapi/.sdkwork/sdkwork-generator-changes.json`,
  );
  const generatorReport = readJson(
    `sdks/${family}/${family}-typescript/generated/server-openapi/.sdkwork/sdkwork-generator-report.json`,
  );

  if (sdkManifest) {
    assertEqual(sdkManifest.name, family, `${family} generated sdk manifest name`);
    assertEqual(sdkManifest.language, "typescript", `${family} generated sdk language`);
    assertEqual(sdkManifest.sdkType, sdkType, `${family} generated sdk type`);
    assertEqual(sdkManifest.packageName, packageName, `${family} generated package name`);
    assertEqual(
      sdkManifest.ownership?.generatedOwnership,
      "generated",
      `${family} generated ownership marker`,
    );
    if (!sdkManifest.ownership?.scaffoldRoots?.includes("custom/")) {
      fail(`${family} generated sdk manifest must preserve custom/ as scaffold root`);
    }
  }

  if (generatorManifest) {
    assertEqual(generatorManifest.generator, "@sdkwork/sdk-generator", `${family} generator manifest`);
    assertEqual(generatorManifest.sdk?.name, family, `${family} generator sdk name`);
    assertEqual(generatorManifest.sdk?.sdkType, sdkType, `${family} generator sdk type`);
    if (!Array.isArray(generatorManifest.generatedFiles) || generatorManifest.generatedFiles.length === 0) {
      fail(`${family} generator manifest must list generated files`);
    }
    if (!generatorManifest.customRoots?.includes("custom/")) {
      fail(`${family} generator manifest must list custom/ root`);
    }
  }

  if (generatorChanges) {
    assertEqual(generatorChanges.generator, "@sdkwork/sdk-generator", `${family} generator changes`);
    assertEqual(generatorChanges.sdk?.name, family, `${family} generator changes sdk name`);
  }

  if (generatorReport) {
    assertEqual(generatorReport.generator, "@sdkwork/sdk-generator", `${family} generator report`);
    assertEqual(generatorReport.status, "ok", `${family} generator report status`);
    assertEqual(generatorReport.sdk?.name, family, `${family} generator report sdk name`);
    if (!Array.isArray(generatorReport.verificationPlan?.steps) || generatorReport.verificationPlan.steps.length === 0) {
      fail(`${family} generator report must include verification plan steps`);
    }
  }

  const sdkSource = readFileSync(path.join(generatedRoot, "src", "sdk.ts"), "utf8");
  const apiSource = walkFiles(path.join(generatedRoot, "src", "api"))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
  for (const surface of expectedSurface) {
    if (!surface.pattern.test(surface.source === "sdk" ? sdkSource : apiSource)) {
      fail(`${family} generated SDK missing surface ${surface.label}`);
    }
  }

  const generatedSource = `${sdkSource}\n${apiSource}`;
  const forbiddenGeneratedSdkPatterns = [
    { label: "nested comments engagement client", pattern: /comments\.engagement\b/u },
    { label: "comments engagement API class", pattern: /class CommentsEngagement[A-Za-z]*Api\b/u },
    { label: "comments engagement response type", pattern: /\bCommentsEngagement[A-Za-z]*\b/u },
    { label: "comments target schema", pattern: /\bCommentsTargetKind\b/u },
    { label: "comments favorite schema", pattern: /\bCommentsFavorite\b/u },
    { label: "comments visit schema", pattern: /\bCommentsVisit\b/u },
    { label: "comments target route", pattern: /\/(?:app|backend)\/v3\/api\/comments\/targets\b/u },
    { label: "comments visit route", pattern: /\/(?:app|backend)\/v3\/api\/comments\/visits\b/u },
  ];
  for (const { label, pattern } of forbiddenGeneratedSdkPatterns) {
    const match = generatedSource.match(pattern);
    if (match) {
      fail(`${family} generated SDK contains ${label}: ${match[0]}`);
    }
  }

  const generatedFilesForMetadataGuard = [
    path.join(generatedRoot, "sdkwork-sdk.json"),
    path.join(generatedRoot, "package.json"),
    ...walkFiles(path.join(generatedRoot, "src")),
  ];
  const forbiddenOwnershipMetadata = [
    /"sdkOwner"\s*:/u,
    /"apiAuthority"\s*:/u,
    /"sdkFamily"\s*:/u,
    /"generationInputSpec"\s*:/u,
    /"sdkDependencies"\s*:/u,
    /"ownerOnlyOperationCount"\s*:/u,
    /"standardProfile"\s*:/u,
    /"standardVersion"\s*:/u,
    /"sdkwork"\s*:/u,
  ];

  for (const file of generatedFilesForMetadataGuard) {
    const content = readFileSync(file, "utf8");
    for (const pattern of forbiddenOwnershipMetadata) {
      const match = content.match(pattern);
      if (match) {
        fail(`${family} generated output contains ownership overlay metadata in ${toRelative(file)}: ${match[0]}`);
      }
    }
  }
}

function checkSdkFamily({
  family,
  authority,
  prefix,
  sdkType,
  expectedOperations,
  routeManifest,
}) {
  assertFile(`sdks/${family}/README.md`);
  assertFile(`sdks/${family}/sdk-manifest.json`);
  assertFile(`sdks/${family}/specs/component.spec.json`);
  assertFile(`sdks/${family}/openapi/${authority}.openapi.yaml`);
  assertFile(`sdks/${family}/openapi/${authority}.sdkgen.yaml`);
  assertFile(`sdks/${family}/bin/generate-sdk.ps1`);
  assertFile(`sdks/_route-manifests/${sdkType === "app" ? "app-api" : "backend-api"}/${routeManifest}`);

  const assembly = readJson(`sdks/${family}/sdk-manifest.json`);
  const component = readJson(`sdks/${family}/specs/component.spec.json`);
  const openApi = readJson(`sdks/${family}/openapi/${authority}.openapi.yaml`);
  const sdkgen = readJson(`sdks/${family}/openapi/${authority}.sdkgen.yaml`);
  const manifest = readJson(`sdks/_route-manifests/${sdkType === "app" ? "app-api" : "backend-api"}/${routeManifest}`);

  if (!assembly || !component || !openApi || !sdkgen || !manifest) {
    return;
  }

  assertEqual(assembly.workspace, family, `${family} assembly workspace`);
  assertEqual(assembly.sdkOwner, "sdkwork-comments", `${family} sdk owner`);
  assertEqual(assembly.apiAuthority, authority, `${family} api authority`);
  assertEqual(assembly.generationInputSpec, `openapi/${authority}.sdkgen.yaml`, `${family} generation input`);
  assertEqual(assembly.discoverySurface.apiPrefix, prefix, `${family} api prefix`);
  assertEqual(component.name, family, `${family} component name`);
  assertEqual(component.domain, "comments", `${family} component domain`);
  assertEqual(component.apiAuthority, authority, `${family} component authority`);
  assertEqual(component.apiPrefix, prefix, `${family} component prefix`);
  assertEqual(component.sdkType, sdkType, `${family} component sdk type`);
  assertEqual(component.generator.entrypoint, GENERATOR_PATH, `${family} canonical generator`);
  assertEqual(component.generator.standardProfile, "sdkwork-v3", `${family} standard profile`);
  assertEqual(openApi.openapi, "3.1.2", `${authority} OpenAPI version`);
  assertEqual(openApi.info?.["x-sdkwork-api-authority"], authority, `${authority} info authority`);
  assertEqual(openApi.info?.["x-sdkwork-sdk-family"], family, `${authority} info family`);
  assertEqual(sdkgen["x-sdkwork-derived-from"], `openapi/${authority}.openapi.yaml`, `${authority} sdkgen source`);
  assertEqual(manifest.kind, "sdkwork.route.manifest", `${family} route manifest kind`);
  assertEqual(manifest.owner, "sdkwork-comments", `${family} route owner`);
  assertEqual(manifest.domain, "comments", `${family} route domain`);
  assertEqual(manifest.apiAuthority, authority, `${family} route authority`);
  assertEqual(manifest.sdkFamily, family, `${family} route sdk family`);
  assertEqual(manifest.prefix, prefix, `${family} route prefix`);

  const ops = operations(openApi);
  if (ops.length !== expectedOperations.length) {
    fail(`${authority} operation count: expected ${expectedOperations.length}, got ${ops.length}`);
  }

  const expectedKeys = new Set(expectedOperations.map((op) => `${op.method.toLowerCase()} ${op.path}`));
  const actualKeys = new Set(ops.map((op) => `${op.method} ${op.path}`));
  for (const key of expectedKeys) {
    if (!actualKeys.has(key)) {
      fail(`${authority} missing operation ${key}`);
    }
  }

  for (const { path: routePath, method, operation } of ops) {
    if (!routePath.startsWith(prefix)) {
      fail(`${authority} ${method.toUpperCase()} ${routePath} does not use prefix ${prefix}`);
    }
    assertEqual(operation["x-sdkwork-owner"], "sdkwork-comments", `${authority} ${operation.operationId} owner`);
    assertEqual(operation["x-sdkwork-api-authority"], authority, `${authority} ${operation.operationId} authority`);
    assertEqual(operation["x-sdkwork-domain"], "comments", `${authority} ${operation.operationId} domain`);
    if (!operation["x-sdkwork-resource"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-resource`);
    }
    if (!operation["x-sdkwork-permission"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-permission`);
    }
    if (!operation["x-sdkwork-audit-event"]) {
      fail(`${authority} ${operation.operationId} missing x-sdkwork-audit-event`);
    }
    const security = JSON.stringify(operation.security ?? []);
    if (!security.includes("AuthToken") || !security.includes("AccessToken")) {
      fail(`${authority} ${operation.operationId} must require AuthToken and AccessToken`);
    }
  }
}

function checkCommentsPackages() {
  const expectedPackages = new Set([
    "@sdkwork/comments-contracts",
    "@sdkwork/comments-service",
  ]);
  const found = new Set();

  const packagesRoot = path.join(ROOT, "apps", "sdkwork-comments-common", "packages");
  for (const file of walkFiles(packagesRoot).filter((candidate) => path.basename(candidate) === "package.json")) {
    const pkg = JSON.parse(readFileSync(file, "utf8"));
    found.add(pkg.name);
    if (pkg.sdkwork?.workspace !== "sdkwork-comments") {
      fail(`${path.relative(ROOT, file)} must declare sdkwork-comments workspace ownership`);
    }
  }

  for (const name of expectedPackages) {
    if (!found.has(name)) {
      fail(`Missing comments package ${name}`);
    }
  }
}

function checkAppbaseResiduals() {
  if (!existsSync(APPBASE_ROOT)) {
    fail(`sdkwork-appbase root not found: ${APPBASE_ROOT}`);
    return;
  }

  const oldDirs = [
    "packages/common/comments",
    "packages/native-rust/comments",
    "packages/pc-react/comments/sdkwork-comments-pc-react",
    "packages/mobile-react/comments/sdkwork-comments-mobile-react",
    "packages/mobile-flutter/comments/sdkwork-comments-mobile-flutter",
    "packages/pc-react/communication/sdkwork-comments-pc-react",
    "packages/mobile-react/communication/sdkwork-comments-mobile-react",
    "packages/mobile-flutter/communication/sdkwork-comments-mobile-flutter",
  ];

  for (const relativePath of oldDirs) {
    const fullPath = path.join(APPBASE_ROOT, relativePath);
    if (existsSync(fullPath) && statSync(fullPath).isDirectory()) {
      fail(`sdkwork-appbase still owns local comments package directory: ${fullPath}`);
    }
  }

  const rootWiringFiles = [
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    "tsconfig.base.json",
    "Cargo.toml",
  ];
  const rootWiringPatterns = [
    /@sdkwork\/comments(?:-|\/|\b)/iu,
    /sdkwork-comments/iu,
    /packages[\\/](?:common|native-rust)[\\/]comments\b/iu,
    /packages[\\/]pc-react[\\/]comments[\\/]sdkwork-comments-pc-react\b/iu,
    /packages[\\/]mobile-react[\\/]comments[\\/]sdkwork-comments-mobile-react\b/iu,
    /packages[\\/]mobile-flutter[\\/]comments[\\/]sdkwork-comments-mobile-flutter\b/iu,
    /packages[\\/]pc-react[\\/]communication[\\/]sdkwork-comments-pc-react\b/iu,
    /packages[\\/]mobile-react[\\/]communication[\\/]sdkwork-comments-mobile-react\b/iu,
    /packages[\\/]mobile-flutter[\\/]communication[\\/]sdkwork-comments-mobile-flutter\b/iu,
    /\bsdkwork_comments_engagement_repository_sqlx\b/u,
  ];

  for (const relativePath of rootWiringFiles) {
    const fullPath = path.join(APPBASE_ROOT, relativePath);
    if (!existsSync(fullPath)) {
      continue;
    }

    const content = readFileSync(fullPath, "utf8");
    for (const pattern of rootWiringPatterns) {
      const match = content.match(pattern);
      if (match) {
        fail(`sdkwork-appbase root wiring retains comments reference in ${relativePath}: ${match[0]}`);
      }
    }
  }

  const socialFiles = [
    "packages/pc-react/social/sdkwork-social-pc-react/src/social.ts",
    "packages/pc-react/social/sdkwork-social-pc-react/tests/social.test.ts",
    "packages/pc-react/communication/sdkwork-social-pc-react/src/social.ts",
    "packages/pc-react/communication/sdkwork-social-pc-react/tests/social.test.ts",
  ];
  for (const relativePath of socialFiles) {
    const file = path.join(APPBASE_ROOT, relativePath);
    if (!existsSync(file)) {
      continue;
    }
    const content = readFileSync(file, "utf8");
    for (const pattern of [
      /\bcommentCount\b/u,
      /\bcanComment\b/u,
      /\bcommentText\b/u,
      /"comment"/u,
      /"empty-comment"/u,
      /\bcomments?\b/iu,
    ]) {
      const match = content.match(pattern);
      if (match) {
        fail(`sdkwork-social-pc-react retains comments capability in ${relativePath}: ${match[0]}`);
      }
    }
  }

  const appbaseOpenApiFiles = [
    "sdks/sdkwork-iam-app-sdk/openapi/sdkwork-iam-app-api.openapi.yaml",
    "sdks/sdkwork-iam-app-sdk/openapi/sdkwork-iam-app-api.sdkgen.yaml",
    "sdks/sdkwork-iam-backend-sdk/openapi/sdkwork-iam-backend-api.openapi.yaml",
    "sdks/sdkwork-iam-backend-sdk/openapi/sdkwork-iam-backend-api.sdkgen.yaml",
  ];

  for (const relativePath of appbaseOpenApiFiles) {
    const fullPath = path.join(APPBASE_ROOT, relativePath);
    if (!existsSync(fullPath)) {
      continue;
    }
    const document = JSON.parse(readFileSync(fullPath, "utf8"));
    for (const { path: routePath, method, operation } of operations(document)) {
      const operationText = [
        routePath,
        operation?.operationId,
        operation?.["x-sdkwork-domain"],
        operation?.["x-sdkwork-owner"],
        operation?.["x-sdkwork-resource"],
      ].join(" ");

      if (/(?:\/comments(?:\/|$)|\bcomments?(?:\.|_|$)|sdkwork-comments)/iu.test(operationText)) {
        fail(`${relativePath}: ${method.toUpperCase()} ${routePath} ${operation?.operationId ?? ""}`);
      }
    }
  }

  const capabilityCatalogPath = path.join(APPBASE_ROOT, "specs/appbase-capabilities.yaml");
  if (existsSync(capabilityCatalogPath)) {
    const capabilityCatalog = readFileSync(capabilityCatalogPath, "utf8");
    if (/Appbase must own[\s\S]{0,160}\bcomments?\b/iu.test(capabilityCatalog)) {
      fail("appbase capability catalog still says Appbase owns comments");
    }
    if (!/id:\s*comments[\s\S]{0,240}status:\s*externalized[\s\S]{0,240}owner:\s*sdkwork-comments/u.test(capabilityCatalog)) {
      fail("appbase capability catalog must externalize comments to sdkwork-comments");
    }
  }

  const activeScanRoots = ["packages", "scripts", "specs", "sdks"];
  const repositoryScanRoots = [
    "README.md",
    "docs",
    "packages",
    "scripts",
    "specs",
    "sdks",
    "package.json",
    "pnpm-workspace.yaml",
    "pnpm-lock.yaml",
    "tsconfig.base.json",
    "Cargo.toml",
  ];
  const textExtension = /\.(?:ts|tsx|js|mjs|cjs|json|yaml|yml|rs|toml|md|ps1|java|kt|go|py|rb|php|cs|swift|dart)$/iu;
  const activeResidualPatterns = [
    /\bcommentCount\b/u,
    /\bcanComment\b/u,
    /\bcommentText\b/u,
    /"empty-comment"/u,
    /@sdkwork\/comments(?:-|\/|\b)/iu,
    /sdkwork-comments/iu,
    /\bcomments_(?:thread|comment|reaction|favorite|visit|engagement|moderation)\b/iu,
    /\bComments[A-Za-z]*(?:Api|Service|Repository|Storage|Controller|Route|Client|Response|Request|Thread|Reaction|Moderation)\b/u,
    /\bcomments\.(?:threads|comments|reactions|engagement|moderation)\b/u,
    /\/(?:app|backend)\/v3\/api\/comments\b/iu,
    /\bengagement_(?:reaction|favorite|visit_history|projection)\b/u,
    /\/(?:app|backend)\/v3\/api\/engagement\b/iu,
    /\bengagement\.(?:targets|likes|favorites|visits)\b/u,
  ];
  const strongResidualPatterns = [
    /@sdkwork\/comments(?:-|\/|\b)/iu,
    /sdkwork-comments/iu,
    /\bsdkwork_comments_engagement_repository_sqlx\b/u,
    /\bcomments_(?:thread|comment|reaction|favorite|visit|engagement|moderation)\b/iu,
    /\/(?:app|backend)\/v3\/api\/comments\b/iu,
    /\bengagement_(?:reaction|favorite|visit_history|projection)\b/u,
    /\/(?:app|backend)\/v3\/api\/engagement\b/iu,
    /\bengagement\.(?:targets|likes|favorites|visits)\b/u,
    /packages[\\/](?:common|native-rust)[\\/]comments\b/iu,
    /packages[\\/](?:pc-react|mobile-react|mobile-flutter)[\\/](?:comments|communication)[\\/]sdkwork-comments-[a-z-]+\b/iu,
    /\bcommentCount\b/u,
    /\bcanComment\b/u,
    /\bcommentText\b/u,
    /"empty-comment"/u,
  ];

  const isAllowedActiveResidual = (relativePath) =>
    relativePath === "scripts/appbase-comments-extraction-boundary.test.mjs" ||
    relativePath === "specs/appbase-capabilities.yaml" ||
    /^scripts\/appbase-[a-z0-9-]+-extraction-boundary\.test\.mjs$/u.test(relativePath);
  const isTextRepositoryFile = (relativePath) =>
    textExtension.test(relativePath) ||
    [
      "README.md",
      "package.json",
      "pnpm-workspace.yaml",
      "pnpm-lock.yaml",
      "tsconfig.base.json",
      "Cargo.toml",
    ].includes(relativePath);

  const activeViolations = [];
  for (const start of activeScanRoots) {
    const startPath = path.join(APPBASE_ROOT, start);
    for (const file of walkFiles(startPath)) {
      const relativePath = toRelative(file, APPBASE_ROOT);
      if (!textExtension.test(relativePath)) {
        continue;
      }
      if (relativePath.includes("/generated/server-openapi/")) {
        continue;
      }
      if (isAllowedActiveResidual(relativePath)) {
        continue;
      }

      const content = readFileSync(file, "utf8");
      for (const pattern of activeResidualPatterns) {
        const match = content.match(pattern);
        if (match) {
          activeViolations.push(`${relativePath}: ${match[0].slice(0, 120)}`);
        }
      }
    }
  }

  if (activeViolations.length > 0) {
    fail(`sdkwork-appbase contains active comments business residuals:\n${activeViolations.join("\n")}`);
  }

  const repositoryViolations = [];
  for (const start of repositoryScanRoots) {
    const startPath = path.join(APPBASE_ROOT, start);
    for (const file of walkFiles(startPath)) {
      const relativePath = toRelative(file, APPBASE_ROOT);
      if (!isTextRepositoryFile(relativePath)) {
        continue;
      }
      if (relativePath.includes("/generated/server-openapi/")) {
        continue;
      }
      if (isAllowedActiveResidual(relativePath)) {
        continue;
      }

      const content = readFileSync(file, "utf8");
      for (const pattern of strongResidualPatterns) {
        const match = content.match(pattern);
        if (match) {
          repositoryViolations.push(`${relativePath}: ${match[0].slice(0, 120)}`);
        }
      }
    }
  }

  if (repositoryViolations.length > 0) {
    fail(
      `sdkwork-appbase contains repository-level comments references outside extraction governance and external capability catalog:\n${repositoryViolations.join("\n")}`,
    );
  }
}

checkSdkFamily({
  family: "sdkwork-comments-app-sdk",
  authority: "sdkwork-comments-app-api",
  prefix: "/app/v3/api",
  sdkType: "app",
  routeManifest: "sdkwork-routes-comments-app-api.route-manifest.json",
  expectedOperations: [
    { method: "GET", path: "/app/v3/api/comments/threads/{threadId}/summary" },
    { method: "GET", path: "/app/v3/api/comments/threads/{threadId}/comments" },
    { method: "POST", path: "/app/v3/api/comments/threads/{threadId}/comments" },
    { method: "PATCH", path: "/app/v3/api/comments/comments/{commentId}" },
    { method: "DELETE", path: "/app/v3/api/comments/comments/{commentId}" },
    { method: "PUT", path: "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}" },
    { method: "DELETE", path: "/app/v3/api/comments/comments/{commentId}/reactions/{reactionType}" },
    { method: "GET", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/summary" },
    { method: "PUT", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes" },
    { method: "DELETE", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/likes" },
    { method: "PUT", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites" },
    { method: "DELETE", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/favorites" },
    { method: "POST", path: "/app/v3/api/engagement/targets/{targetKind}/{targetId}/visits" },
    { method: "GET", path: "/app/v3/api/engagement/visits" },
  ],
});
checkGeneratedSdkOutput({
  family: "sdkwork-comments-app-sdk",
  sdkType: "app",
  packageName: "sdkwork-comments-app-sdk-generated-typescript",
  expectedSurface: [
    { source: "sdk", label: "client.comments", pattern: /public readonly comments: CommentsApi/u },
    { source: "sdk", label: "client.engagement", pattern: /public readonly engagement: EngagementApi/u },
    { source: "api", label: "comments.threads.summary", pattern: /class CommentsThreadsApi[\s\S]*async summary\(/u },
    { source: "api", label: "comments.comments.list", pattern: /class CommentsCommentsApi[\s\S]*async list\(/u },
    { source: "api", label: "comments.comments.create", pattern: /class CommentsCommentsApi[\s\S]*async create\(/u },
    { source: "api", label: "comments.comments.update", pattern: /class CommentsCommentsApi[\s\S]*async update\(/u },
    { source: "api", label: "comments.comments.delete", pattern: /class CommentsCommentsApi[\s\S]*async delete\(/u },
    { source: "api", label: "comments.reactions.upsert", pattern: /class CommentsReactionsApi[\s\S]*async upsert\(/u },
    { source: "api", label: "comments.reactions.delete", pattern: /class CommentsReactionsApi[\s\S]*async delete\(/u },
    { source: "api", label: "engagement.targets.summary", pattern: /class EngagementTargetsApi[\s\S]*async summary\(/u },
    { source: "api", label: "engagement.likes.upsert", pattern: /class EngagementLikesApi[\s\S]*async upsert\(/u },
    { source: "api", label: "engagement.likes.delete", pattern: /class EngagementLikesApi[\s\S]*async delete\(/u },
    { source: "api", label: "engagement.favorites.upsert", pattern: /class EngagementFavoritesApi[\s\S]*async upsert\(/u },
    { source: "api", label: "engagement.favorites.delete", pattern: /class EngagementFavoritesApi[\s\S]*async delete\(/u },
    { source: "api", label: "engagement.visits.create", pattern: /class EngagementVisitsApi[\s\S]*async create\(/u },
    { source: "api", label: "engagement.visits.list", pattern: /class EngagementVisitsApi[\s\S]*async list\(/u },
  ],
});

checkSdkFamily({
  family: "sdkwork-comments-backend-sdk",
  authority: "sdkwork-comments-backend-api",
  prefix: "/backend/v3/api",
  sdkType: "backend",
  routeManifest: "sdkwork-routes-comments-backend-api.route-manifest.json",
  expectedOperations: [
    { method: "GET", path: "/backend/v3/api/comments/threads" },
    { method: "GET", path: "/backend/v3/api/comments/threads/{threadId}/summary" },
    { method: "GET", path: "/backend/v3/api/comments/threads/{threadId}/comments" },
    { method: "DELETE", path: "/backend/v3/api/comments/comments/{commentId}" },
    { method: "GET", path: "/backend/v3/api/comments/moderation/cases" },
    { method: "PATCH", path: "/backend/v3/api/comments/comments/{commentId}/moderation" },
    { method: "GET", path: "/backend/v3/api/engagement/targets/{targetKind}/{targetId}/summary" },
    { method: "GET", path: "/backend/v3/api/engagement/visits" },
  ],
});
checkGeneratedSdkOutput({
  family: "sdkwork-comments-backend-sdk",
  sdkType: "backend",
  packageName: "sdkwork-comments-backend-sdk-generated-typescript",
  expectedSurface: [
    { source: "sdk", label: "client.comments", pattern: /public readonly comments: CommentsApi/u },
    { source: "sdk", label: "client.engagement", pattern: /public readonly engagement: EngagementApi/u },
    { source: "api", label: "comments.threads.list", pattern: /class CommentsThreadsApi[\s\S]*async list\(/u },
    { source: "api", label: "comments.threads.summary", pattern: /class CommentsThreadsApi[\s\S]*async summary\(/u },
    { source: "api", label: "comments.comments.list", pattern: /class CommentsCommentsApi[\s\S]*async list\(/u },
    { source: "api", label: "comments.comments.delete", pattern: /class CommentsCommentsApi[\s\S]*async delete\(/u },
    { source: "api", label: "comments.moderation.cases.list", pattern: /class CommentsModerationCasesApi[\s\S]*async list\(/u },
    { source: "api", label: "comments.moderation.update", pattern: /class CommentsModerationApi[\s\S]*async update\(/u },
    { source: "api", label: "engagement.targets.summary", pattern: /class EngagementTargetsApi[\s\S]*async summary\(/u },
    { source: "api", label: "engagement.visits.list", pattern: /class EngagementVisitsApi[\s\S]*async list\(/u },
  ],
});

checkAuthoredComponentSpecs();
checkCommentsPackages();
checkAppbaseResiduals();

if (failures.length > 0) {
  console.error("sdkwork-comments governance failures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("sdkwork-comments governance checks passed.");
