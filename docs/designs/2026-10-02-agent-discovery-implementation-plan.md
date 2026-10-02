# Extensible Agent Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Discover agents through extensible plugins and test selected Claude/Codex agents through truthful output adapters.

**Architecture:** Discovery and execution are independent registry extension points. Explicit plugin manifests load trusted modules; scanned definitions remain data. Executable bridges implement existing `causign/1` and produce existing AgentReference values.

**Tech Stack:** TypeScript 5.9.3, Node >=22, pnpm 11.25.0 workspace, Vitest 3.2.4, Oxlint; native CLI subprocesses with shell disabled.

**Spec:** [Approved design](2026-10-02-runtime-adapters.md).

## Global Constraints

- Plugin API `1`, manifest schemaVersion `"1"`, wire `causign/1`; no vendor enum or protocol/config schema changes.
- Found != executable != compatible with this scenario. Unknown capabilities are unsupported.
- Discovery does not run models, install packages, initiate login, import scanned definitions or mutate source/config.
- Explicit sources only; bounded scans, no symlink following; trusted in-process plugins have cooperative limits.
- Output adapters advertise final output and runner latency only; tools/mocks/approvals are INCOMPATIBLE before native launch.
- No automatic tool authorization, bypass flags, inferred cost, reused sessions or credentials in artifacts.
- Claude 2.1.284 and Codex 0.159.0 are observed reference versions, not promises of compatibility with all releases.
- Preserve existing Vercel integration, scenario discovery, packed consumers and four-platform CI. Live model tests are opt-in; no npm publication in this plan.

## Review Focus

1. Paths with spaces, Unicode and Windows/WSL boundaries must preserve literal arguments (tasks 2 and 4).
2. Same display name across sources must not collide; edited content must change hash, not candidate ID (task 2).
3. A plugin throwing midway through loading must not leave a partially registered catalogue (task 1).
4. Native output followed by a nonzero exit must produce ERROR, not PASS (task 3).
5. A definition changing after discovery must invalidate the launch until rediscovery (tasks 2 and 4).

## File Map

- `packages/runtime/src/{types,registry,manifest,scan,process,output-bridge,index}.ts`: contracts, registration, explicit loading, bounded filesystem access, native execution and wire translation.
- `packages/adapter-claude-code/src/{discover,probe,launch,translate,bin,index}.ts`: Claude reference plugin and bridge.
- `packages/adapter-codex/src/{discover,probe,launch,translate,bin,index}.ts`: Codex reference plugin and bridge.
- Each new package gets `package.json`, `tsconfig.json`, README and focused tests; root tsconfig references and lockfile follow existing workspace patterns.
- `packages/cli/src/agent-discovery.ts`: agent discovery command; existing `discover.ts` remains scenario discovery.
- `fixtures/runtime-plugins/` and `fixtures/native-runtimes/`: external plugin and deterministic native process fixtures.
- `tests/acceptance/runtime-plugins.test.ts`: complete discovery-to-scenario flow.

## Task 1: Public Plugin Registry and Explicit Loading

**Files:** Create runtime types/registry/manifest/index, package setup and `packages/runtime/test/registry.test.ts`; modify root tsconfig and CLI workspace dependencies.

**Interfaces:** Export `RuntimePlugin {id:string; apiVersion:'1'; discoverers:Discoverer[]; adapters:ExecutionAdapter[]}`, `createRegistry(plugins:RuntimePlugin[]):Registry`, `loadPluginManifest(path:string):Promise<RuntimePlugin[]>`.
`Discoverer.discover(source:DiscoverySource, context:DiscoveryContext):Promise<DiscoveryReport>`; `ExecutionAdapter.supports(candidate:AgentCandidate):boolean`, `probe(target:ExecutionTarget, selection:Selection):Promise<RuntimeProbe>`, `createLaunch(selection:Selection):Promise<AgentReference>`.
Define all shared types here: discriminated file/service sources; native/WSL targets; diagnostics with code/message/source; candidates with discoverer/native/source identity, revision hash and optional framework/runtime IDs; selection includes adapter ID, candidate, target, mode and explicit model/provider. Registry reports all matching adapter IDs without selecting one.

- [ ] Write `registry.test.ts`: `expect(() => createRegistry([plugin, plugin])).toThrow(/duplicate/i)`; unsupported API rejected; two matching adapters both returned; a failed manifest load exposes no partial registry. Test relative module resolution from a Unicode/spaced manifest directory and reject malformed manifest fields before importing modules.
- [ ] Run `pnpm exec vitest run packages/runtime/test/registry.test.ts`; confirm failures for missing functionality.
- [ ] Implement the interfaces and transactional validation. Manifest requires schemaVersion/plugins and permits optional `sources: Record<string, {discovererId:string; options:Record<string,unknown>}>` for explicitly configured services; reject other fields. Service options are plugin-validated data, not credentials copied into reports. Module specifiers resolve from its directory, local paths become file URLs. Default export must validate as RuntimePlugin. Never install missing modules or auto-load scanned code.
- [ ] Run focused tests and `pnpm typecheck`; require success.
- [ ] Commit only task files with `feat: add extensible runtime plugin registry`.

## Task 2: Bounded Discovery and Candidate Provenance

**Files:** Create runtime scan and `packages/runtime/test/discovery.test.ts`, CLI agent-discovery and tests; modify CLI main and help. Add generic instruction discoverer in `packages/runtime/src/instructions.ts`.

**Interfaces:** Export `discoverAgents(registry:Registry, source:DiscoverySource, options:{discovererId?:string; limits:DiscoveryLimits; signal?:AbortSignal}):Promise<DiscoveryReport>` and `verifyCandidateRevision(candidate:AgentCandidate):Promise<void>` for file candidates. DiscoveryLimits fields: maxFiles, maxFileBytes, maxTotalBytes, timeoutMs. CLI defaults: 10,000 files, 1 MiB/file, 32 MiB total, 10 seconds. Generic instructions have no native runnable selector and no matching execution adapter by default.

- [ ] Write tests asserting no model/import side effects, no symlink traversal, excluded node_modules/dist/build/coverage/.git/.causign/.superpowers directories, cancellation, missing source diagnostics and each limit. Assert stable IDs across content edits, changed hashes, separate IDs for equal names in different sources and rejection of stale revisions. Assert unrecognized files never become runnable candidates.
- [ ] Run `pnpm exec vitest run packages/runtime/test/discovery.test.ts packages/cli/test/agent-discovery.test.ts`; verify expected failures.
- [ ] Implement bounded reads shared by discoverers. IDs derive from discoverer ID/canonical source/native ID; content uses SHA-256 separately. Return deterministic ordering, per-source diagnostics and explicit truncated/incomplete status when a limit is reached.
- [ ] Implement `causign discover --path <root> [--discoverer <id>] [--plugins <manifest>] [--json]`; mutually exclusive `--source <configured-source-id>` routes to registered service sources defined in the task 1 manifest. Never infer endpoints from files. Exit 0 complete, 2 errors/incomplete, 130 interrupted; diagnostics available in JSON and text. Preserve existing inspect/run paths.
- [ ] Run focused tests and `pnpm typecheck`; require success.
- [ ] Commit task files with `feat: discover agent candidates from explicit sources`.

## Task 3: Native Process Lifecycle and Output Protocol Bridge

**Files:** Create runtime process/output-bridge and tests, deterministic fixtures in `fixtures/native-runtimes/`. Inspect existing `packages/sdk/src/bridge.ts` and `packages/core/src/transport/process.ts`; reuse primitives only when advertised capabilities remain truthful.

**Interfaces:** Export `runNativeProcess(launch:NativeLaunch, options:{signal:AbortSignal; maxOutputBytes:number; timeoutMs:number}):Promise<NativeResult>` and `serveOutputBridge(driver:OutputDriver):Promise<void>`. NativeLaunch contains literal command/args/cwd/env; OutputDriver provides probe and per-run launch/translation callbacks. Translation returns `{text:string}` only after validated native completion and successful exit. Wire capabilities are `observe.output` only; latency is measured by existing runner.

- [ ] Write tests for successful final output, intermediate-only output, malformed JSONL, native error result, output followed by nonzero exit, timeout, cancellation, stdout overflow and descendant cleanup. Assert exactly one run terminal, protocol-only stdout, diagnostics stderr and no native spawn when requested capabilities are unsupported.
- [ ] Run `pnpm exec vitest run packages/runtime/test/process.test.ts packages/runtime/test/output-bridge.test.ts`; verify failures.
- [ ] Implement shell:false subprocesses with bounded output and cancellation; complete existing handshake/configure/run semantics. Never advertise intercept/observe.tools/control.approvals through generic SDK defaults. Use 8 MiB aggregate native capture default; surface overflow as ERROR. Document OS/WSL cleanup limits rather than claiming a sandbox.
- [ ] Run focused tests plus existing core/SDK tests; require success.
- [ ] Commit task files with `feat: bridge native agent output to causign protocol`.

## Task 4: Claude Code Reference Plugin

**Files:** Create Claude package, discovery/probe/launch/translate/bin/index and tests. Register built-in plugin in CLI through public API; update root references/dependencies and lockfile.

**Interfaces:** Export default RuntimePlugin ID `causign/claude-code`; discoverer ID `causign/claude-agents`; execution adapter ID `causign/claude-output`. Produce file candidates from selected Markdown YAML frontmatter and preserve native names. Bridge command uses installed package bin resolved by package exports, not source/dist guesses.

- [ ] Write fixtures for valid frontmatter, malformed YAML, duplicate native names, unknown metadata and invalid runtime selectors. Verify source text is never rewritten. Include literal Windows Unicode paths and explicit WSL distro/POSIX cwd; reject UNC used as Linux cwd. Assert revision check before launch.
- [ ] Run `pnpm exec vitest run packages/adapter-claude-code/test`; verify failures.
- [ ] Verify version-specific native argument/settings behavior using installed help and official sources before coding. Parse frontmatter with a pinned pure-JS YAML dependency, strict validation and bounded reads. Probe version without login or token access. Unsupported versions/profiles return diagnostics; no guessed compatibility.
- [ ] Implement print structured output translation and native selection with explicit tool-disable policy and controlled effective settings. If the reference version cannot enforce the profile, report it unsupported rather than weaken it. Launch WSL with literal wsl.exe arguments; do not interpolate definition text into a shell. Do not use bare mode if it silently changes authentication requirements.
- [ ] Run fixture protocol PASS/FAIL/ERROR/INCOMPATIBLE cases; require unsupported tool/mock scenario never spawns native process. Run package tests and typecheck.
- [ ] Commit task files with `feat: add Claude Code discovery and output adapter`.

## Task 5: Codex Reference Plugin

**Files:** Create Codex package with matching responsibilities/tests; register through public API and update workspace setup.

**Interfaces:** Export default RuntimePlugin ID `causign/codex`; discoverer ID `causign/codex-config`; execution adapter ID `causign/codex-output`. Produce profile/native-definition candidates only for formats verified for the supported version. AGENTS.md remains instruction context, not an executable candidate.

- [ ] Write fixture tests for selected profiles, invalid/duplicate definitions, contextual AGENTS.md, explicit model/provider metadata, absent executable and unsupported version. Test final event/native error/nonzero exit combinations and stale definition rejection.
- [ ] Run `pnpm exec vitest run packages/adapter-codex/test`; verify failures.
- [ ] Verify installed 0.159.0 config schema/help before implementing parsers; use pinned pure-JS TOML parser for verified config formats. Native definitions unsupported by the version produce explicit diagnostics. Implement fresh ephemeral `exec --json`, explicit cwd/profile and enforced tool-denial policy; read-only sandbox alone does not prove tools disabled. If reliable tool denial/settings isolation cannot be enforced, probe marks output profile unsupported and tests assert no launch.
- [ ] Translate validated final output to `{text:string}` using task 3 lifecycle; reject unknown event shapes that invalidate completeness. Never infer tool execution, cost or approval control from text.
- [ ] Run package tests and typecheck; compare identical fixture scenarios with Claude results.
- [ ] Commit task files with `feat: add Codex discovery and output adapter`.

## Task 6: External Extension Conformance, Packed Consumers and Documentation

**Files:** Create `fixtures/runtime-plugins/custom-framework.mjs`, acceptance tests and `docs/agent-discovery.md`; modify `scripts/packed-smoke.mjs`, relevant package READMEs, root README, vitest coverage config only if needed, and existing CI packaging inputs.

**Interfaces:** External fixture exports the task 1 RuntimePlugin contract and recognizes an invented `example-agent.json` format; its bridge implements causign/1. Export package subpaths needed to resolve bins from packed consumers. Document manifest, registration API, discovery status, explicit adapter selection and reviewable AgentReference generation; no automatic config mutation.

- [ ] Write acceptance tests importing the external plugin from a consumer directory: discover candidate, report two matches without choosing, explicitly select/probe/createLaunch, run existing output scenario and assert PASS/FAIL/ERROR/INCOMPATIBLE. Assert no core/CLI catalogue modification required. Verify missing plugin dependency and unavailable runtime have actionable diagnostics.
- [ ] Run `pnpm exec vitest run tests/acceptance/runtime-plugins.test.ts`; verify initial failures.
- [ ] Extend packed smoke to install new package tarballs and run the fixture extension outside the workspace, without credentials. Use deterministic native fixtures in existing Linux x64/ARM64, Windows x64 and macOS ARM64 jobs. Document actual support and WSL cleanup limits; VS Code/API bridges and controlled tools remain unimplemented extensions.
- [ ] Run `pnpm check:generated`, `pnpm typecheck`, `pnpm lint`, `pnpm test:coverage`, `pnpm test:packed`. Require success and record new coverage results; investigate reductions rather than inventing a coverage threshold. Live model runs require separate user-selected agent/model and finite bounds.
- [ ] Perform a final spec-to-tests review and commit scoped task files with `test: verify external runtime plugins and packed adapters`.

## Execution Handoff

The written plan requires user review and execution-method selection before implementation. Native execution is recommended because the six tasks share evolving registry and bridge interfaces. Subagent-driven execution is available for independent review after every task. Neither choice authorizes npm release or live paid model runs.
