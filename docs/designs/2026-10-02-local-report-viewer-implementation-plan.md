# Local Report Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make completed Causign failures understandable through a local history viewer with comparisons, explanations, and trace evidence.

**Architecture:** Add a read-only artifact repository, deterministic explanation model, and loopback HTTP server inside the CLI package. Serve bundled browser assets and integrate explicit `report` and `run --open` commands without changing runner verdicts or protocol schemas.

**Tech Stack:** Node 22+, TypeScript, node:http, node:fs/promises, browser DOM APIs, existing protocol validators, Vitest, oxlint. No new product dependencies.

**Spec:** `docs/designs/2026-10-02-local-report-viewer.md`.

**Execution:** Preserve the user's previously selected direct execution in this chat. Implementation starts after this plan is reviewed. Use one independent whole-branch review at completion as required by executing-plans.

## Global Constraints

- Keep protocol and result schema at version 1; preserve the existing runner as verdict authority.
- Bind only to `127.0.0.1`; use an OS-assigned available port by default; explicit ports range from 1 through 65535.
- Enumerate at most 1,000 execution directories; JSON files are limited to 16 MiB each; paginate timelines at 200 events and computed diffs at 1,000 changed paths.
- No configuration imports, agent execution, provider credentials, LLM calls, external assets, telemetry, or frontend installation in the report command.
- Read indexed artifacts inside the selected root; do not follow symlinks or junctions or trust stored absolute artifact paths.
- Display report data as text, enforce restrictive CSP, exact Host, cross-origin rejection, and a per-session API token.
- Server lifecycle is foreground until Ctrl+C; plain `run` never starts a server; CI remains noninteractive by default.
- Test Windows x64, Linux x64/ARM64, and macOS ARM64. Include UI assets in packed CLI acceptance.
- Preserve the pre-existing edits in `docs/development.md` and `docs/getting-started.md`; do not stage them as part of this feature.
- The implementation is not an npm release. Do not push further feature changes into the open discovery PR without an explicit integration decision; isolate viewer implementation on a new `codex/` branch at execution time.

## Review Focus

- A copied execution contains stale absolute paths: load only indexed artifacts in its new directory (Task 1).
- A directory disappears or a linked file replaces an artifact during loading: report unavailability and never read outside the selected root (Task 1).
- Negated equality fails because output matched: explain the forbidden match rather than claim values differ (Task 2).
- Agent output contains HTML or the URL token survives a refresh: render text safely and keep the current browser session usable without leaking tokens into API error output (Tasks 3–4).
- Ctrl+C occurs between execution completion and viewer startup: clean up once, never hide the suite verdict, and preserve the documented exit code (Task 5).

## File structure and shared types

Create `packages/cli/src/report/` with:

- `types.ts`: `ReportSummary`, `LoadedReport`, `ScenarioDetails`, `ReportWarning`, `JsonDifference`, and `AssertionExplanation`, shared through type-only imports.
- `repository.ts`: bounded, validated artifact loading and history.
- `explain.ts`: comparisons and evidence-linked explanation models.
- `server.ts`: protected HTTP API, static assets, and shutdown.
- `open-browser.ts`: literal platform launch arguments.
- `command.ts`: report option parsing and command lifecycle.
- `web/html.ts`, `web/style.ts`: exported constant shell HTML and CSS strings.
- `web/client.ts`: self-contained browser module compiled by the existing TypeScript build; no runtime Node imports. Serve its compiled `client.js` using a fixed URL relative to `server.js`. UI markup and styles compile into the CLI normally, avoiding a separate asset-copy build.

Create tests under `packages/cli/test/report/` and report fixtures under `fixtures/reports/`. Fixture constructors may generate larger files in temporary directories; do not commit oversized fixtures.

Shared signatures:

```ts
createReportRepository(root: string): Promise<ReportRepository>
// list(): Promise<{reports: ReportSummary[]; warnings: ReportWarning[]}>
// load(reportId: string): Promise<LoadedReport>
// scenario(reportId: string, index: number): Promise<ScenarioDetails>
explainAssertion(details: ScenarioDetails, assertionIndex: number): AssertionExplanation
startReportServer(options: ReportServerOptions): Promise<ReportServerHandle>
// options: {root: string; port?: number; selectedReportId?: string; signal?: AbortSignal}
// handle: {url: string; closed: Promise<void>; close(): Promise<void>}
openBrowser(url: string): Promise<void>
reportCommand(args: string[], io: CliIO): Promise<number>
```

`ReportSummary` includes an opaque repository ID, artifact timestamp or null, display label, counts, and load-error text when invalid. `LoadedReport` carries the validated suite and warnings. `ScenarioDetails` carries its validated result, optional validated plan/trace, and warnings. `AssertionExplanation` includes the original expected/observed/reason, optional JSON differences, truncation flag, investigative guidance, and evidence links. IDs and indexes are validated before lookup; none are filesystem paths supplied by the browser.

### Task 1: Validated artifact repository and report history

**Files:** Create `report/types.ts`, `report/repository.ts`, `test/report/repository.test.ts`, and small `fixtures/reports/` fixtures.

**Interfaces:** Produce `createReportRepository` and shared repository types above. Consume existing `validateResult`, `validatePlan`, and `validateTrace` and the writer's collection-index convention from `src/reporters/json.ts`.

- [x] Write failing tests: `copied_report_uses_local_indexed_artifacts` asserts stale absolute paths are ignored; `invalid_run_does_not_hide_history` asserts a corrupt report is listed beside a valid one; `mismatched_ids_do_not_join_evidence` asserts warnings and omitted mismatched plan/trace; `missing_trace_retains_assertions` asserts a valid result survives.
- [x] Add boundary tests: root missing errors; empty existing root returns no reports; 1,001 execution directories produce at most 1,000 entries plus explicit truncation; a 16 MiB + 1 byte JSON file is rejected; junction/symlink files and directories are not followed; an artifact disappearing during read yields a loading diagnostic. Assert timestamp-prefix ordering with deterministic fallback and unknown schema rejection.
- [x] Run `pnpm exec vitest run packages/cli/test/report/repository.test.ts`; expect failure for the missing repository implementation.
- [x] Implement the declared interfaces. Validate the suite envelope explicitly because the current suite is not a standalone protocol schema. Use bounded file-handle reads, canonical containment checks, identity/link checks around opening, and immediate-directory enumeration. Lazy-load optional plan/trace data. Never follow `suite.artifacts` paths.
- [x] Run the repository tests; expect all supported platform cases to pass. Any skipped link-creation case must explain the environment limitation and retain a runnable Unix equivalent.
- [x] Commit only Task 1 files: `feat: load validated local report artifacts`.

### Task 2: Deterministic explanations, JSON differences, and evidence links

**Files:** Create `report/explain.ts` and `test/report/explain.test.ts`; extend shared model types and small report fixtures.

**Interfaces:** Consume `ScenarioDetails`; produce `explainAssertion(details, assertionIndex)` and `AssertionExplanation`. Evidence links identify a trace message or recorded metric/evaluator, not a pathname.

- [x] Write failing tests for nested JSON changes, absent keys versus null, arrays, object key order, negated equality, 1,001 changed paths returning exactly 1,000 plus truncation, and absent structured expected data retaining the recorded strings.
- [x] Write lifecycle tests asserting `tool.requested` never becomes executed, mock/reject facts remain distinct, incomplete traces do not prove absence, and missing referenced messages produce unavailable evidence. Assert ERROR, INCOMPATIBLE, NOT_EVALUATED, evaluator provenance, and explicit metric thresholds retain recorded semantics without fabricated causes.
- [x] Run `pnpm exec vitest run packages/cli/test/report/explain.test.ts`; expect failure for missing explanation functions.
- [x] Implement structured comparisons using validated plan parameters and trace final output. Keep original verdict/reason immutable. Bound depth during comparison using an iterative traversal so deeply nested valid JSON does not overflow the JS stack. Emit JSON Pointer paths, escaped correctly for `/` and `~` keys. Label guidance separately from recorded facts.
- [x] Run explanation and repository tests; expect PASS. Add a deeply nested JSON regression and verify the 1,000-path bound includes arrays.
- [x] Commit Task 2 files: `feat: explain report failures from recorded evidence`.

### Task 3: Protected local server and browser launcher

**Files:** Create `report/server.ts`, `report/open-browser.ts`, `report/web/html.ts`, `report/web/style.ts`, `test/report/server.test.ts`, and `test/report/open-browser.test.ts`.

**Interfaces:** Consume the repository and explanation model; produce `startReportServer`, `ReportServerOptions`, `ReportServerHandle`, and `openBrowser`. Server API exposes history, a selected report summary, and indexed scenario details; timeline data is paginated in 200-event pages with validated nonnegative page numbers.

- [x] Write failing HTTP tests for OS-assigned loopback port, explicit occupied port, required Bearer token, wrong Host, foreign Origin, malformed IDs, traversal attempts, unknown routes, and idempotent shutdown. Assert requests without Origin still require the session token. Cap concurrent report loads at four and return a clear busy response above that limit.
- [x] Write launcher tests that inspect injected spawn calls: `open` on macOS, `xdg-open` on Linux, and literal `rundll32.exe` URL arguments on Windows. Verify spawn/exit failures are surfaced without executing a shell command.
- [x] Run `pnpm exec vitest run packages/cli/test/report/server.test.ts packages/cli/test/report/open-browser.test.ts`; expect missing-module failures.
- [x] Implement GET-only report APIs and fixed assets. Place the random session token in the URL fragment; validate Host/Origin and token before reading report data; send no-store for data and restrictive CSP for HTML. Never echo a token in diagnostics. Serve compiled `web/client.js` only from its fixed packaged path. Abort closes the server and idle HTTP connections once.
- [x] Run HTTP and launcher tests; expect PASS, including paginated event order, no general static-file access, and cancellation during an outstanding response.
- [x] Commit Task 3 files: `feat: serve protected reports on localhost`.

### Task 4: Accessible browser report interface

**Files:** Create `report/web/client.ts` and `test/report/web-assets.test.ts`; update `web/html.ts` and `web/style.ts`.

**Interfaces:** Consume the GET API from Task 3 and type-only imports from `report/types.ts`. Client has no runtime package imports. HTML loads external same-origin module JS and CSS under the CSP.

- [x] Write failing asset tests proving the HTML exposes named regions for history, filters, scenario list, details, and timeline; assets use the proper content types and the browser module is shipped by TypeScript. Malicious artifact strings stay in JSON responses and never enter the shell HTML.
- [x] Run `pnpm exec vitest run packages/cli/test/report/web-assets.test.ts`; expect incomplete-interface failures.
- [x] Implement responsive branded overview, execution selection, explicit refresh, search/status filters, failure-first stable ordering, assertion comparisons, guidance, evidence navigation, diagnostics, and lazy 200-event timeline pages. Use DOM textContent for all artifact content. Read the fragment token into memory and same-tab sessionStorage, remove it from the visible URL, and retain it across refresh; do not put it in localStorage. Clear unusable session state after authorization failure.
- [x] Run asset tests; expect PASS. Use the project build to verify browser module compilation has no Node dependencies.
- [x] Perform browser verification against generated fixture reports: keyboard-only selection, 390 px and desktop layout, differing JSON fields, a negated failure, incomplete trace warning, malicious HTML shown literally, history refresh, and evidence jump to an event on a later page. Record screenshots and observed results in the final implementation report; fix any discovered behavior before committing.
- [x] Commit Task 4 files: `feat: render readable failure reports in the browser`.

### Task 5: CLI report command and opt-in run integration

**Files:** Create `report/command.ts` and `test/report/command.test.ts`; modify `src/main.ts`, `src/bin.ts` if signal cleanup requires it, and `test/cli.test.ts`.

**Interfaces:** Produce `reportCommand(args, io)`. Consume `startReportServer`, `openBrowser`, and existing `runDefinitions`. Introduce an injectable internal viewer lifecycle helper for CLI tests; keep the existing public main signature usable.

- [x] Write failing command tests for `report`, `--no-open`, `--output-dir`, `--port`, missing/invalid option values, browser launch failure with usable printed URL, and operation without a project config file.
- [x] Write run tests asserting plain `run` exits normally without a server; `run --open` selects the produced execution; viewer shutdown preserves suite exit codes 0, 1, and 2; interruption during execution remains 130 and starts no viewer; artifact-write failure starts no viewer; viewer startup failure preserves the suite verdict; cancellation at the execution/viewer boundary closes resources once.
- [x] Run `pnpm exec vitest run packages/cli/test/report/command.test.ts packages/cli/test/cli.test.ts`; expect new-command failures.
- [x] Implement command-specific parsing before config imports and document the foreground lifetime in printed messages. Accept `--open` only for run, retaining existing filters/options. Reuse the selected output root and just-written execution directory; handle all viewer errors separately from suite execution results. Map deliberate Ctrl+C during report viewing to 0 or the saved suite code as specified.
- [x] Run the CLI, command, and all report tests; expect PASS and no report handles preventing Vitest exit.
- [x] Commit Task 5 files: `feat: open local reports from the causign CLI`.

### Task 6: Packed acceptance, documentation, and complete verification

**Files:** Modify `scripts/packed-smoke.mjs`, `packages/cli/README.md`, and root `README.md`; create `docs/local-reports.md` and `docs/designs/2026-10-02-local-report-viewer-implementation-report.md`.

**Interfaces:** Exercise the installed CLI binary and assets as a consumer. Do not rely on workspace file locations or imports.

- [ ] Add a failing packed-consumer test that starts `report --no-open` from the clean consumer, parses the printed loopback URL without logging its fragment token, fetches authenticated history and scenario detail plus HTML/CSS/client.js, and shuts the process down in a finally block. Verify one FAIL fixture has a JSON difference and that report itself does not return the historical FAIL code.
- [ ] Run `pnpm test:packed`; expect any missing packed asset/path behavior to fail. Fix packaging or startup using the compiled assets chosen above; do not add an unrelated build dependency.
- [ ] Document installed CLI, npx, and pnpm dlx commands, history roots, server lifetime, exit-code distinctions, raw sensitive local data, CI plain run usage, loading limits, and the fact that the feature is not yet in npm 0.1.0. Avoid staging the two pre-existing dirty docs.
- [ ] Run `pnpm check:generated`, `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage`, and `pnpm test:packed`; expect all checks to pass. Report measured coverage and any platform skips without claiming remote CI passed before it runs.
- [ ] Use the execution skill's independent whole-branch reviewer. Resolve important findings with failing regressions and fresh verification; record explicit scope rulings and deferred work in the implementation report.
- [ ] Commit Task 6 files: `docs: document and verify local report viewing`. Present branch integration choices; do not automatically publish npm packages or merge the open discovery PR.

## Plan self-review

Every specification section maps to Tasks 1–6: artifacts and limits (1), explanations and evidence semantics (2), access and lifecycle primitives (3), UI and visual acceptance (4), commands and exit codes (5), packaging/platform/documentation acceptance (6). The five review-focus cases have named tests in their owning tasks. Shared interfaces remain consistent and deferred functionality is excluded. Implementation begins only after user review of this plan, using the already selected direct execution method.
