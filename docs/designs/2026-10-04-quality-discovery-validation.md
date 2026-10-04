# Shared discovery validation

PR 4 starts from integrated main at 230e249. The additive synchronous `collectFileDiscovery` export visits readonly SourceFile entries in order, appends callback candidates/diagnostics and computes complete from error severity only. Unexpected callback exceptions propagate.

Five collector tests reproduced missing-helper RED and passed GREEN. They cover empty input, ignored entries, warning-only completeness, ordered mixed partial results and thrown callback errors. Before provider migration, full-report characterization passed for Claude metadata warnings, mixed valid/invalid/duplicate definitions, IDs/revisions/order and selector reset; Codex adds legacy warnings and its existing selector reservation after invalid metadata. Existing Codex characterization remains intact. Both provider/runtime suites passed after each separate migration: 81 passing tests and one existing platform skip.

Provider parsing, matching, candidate construction, duplicate policy and exception conversion remain in local callbacks. Runtime gains no YAML/TOML dependency and neither provider's diagnostics or public Discoverer/RuntimePlugin contracts change. Documentation preserves the trusted in-process plugin boundary.

Final Windows verification: format-check, generated contracts, TypeScript build and oxlint passed; complete coverage suite passed 459 tests with one existing POSIX-only skip. Offline acceptance installed eight archives and passed seven baseline scenarios, external plugin discovery and the local report viewer. Package versions, manifests, lockfile and generated protocol source are unchanged. Remote CI remains pending.

## Decisions and costs

1. Use the approved existing checkout on a fresh branch. Cost: less filesystem isolation than a separate worktree.

## Independent review and limits

Review of 230e249..a7ed9b9 returned ready to merge with no Critical, Important or Minor findings. The reviewer independently ran runtime and both provider suites with caching disabled: 81 passed, one existing platform skip; all seventeen collector/provider-discovery tests passed in a narrower run. Built exports and provider import resolution were checked against source.

Reviewer limitations and rulings:

2. Native security guarantees and unsupported Codex execution remain unchanged and outside this extraction. Cost: this refactor provides no new native execution guarantees.
3. Malicious callback sandboxing remains outside the trusted in-process plugin contract. Cost: loaded plugins still execute trusted code with process privileges.
4. Filesystem limits, symlink handling and cancellation stay upstream in the existing scanner. Cost: the collector does not independently enforce scan boundaries.
5. Accept executor full verification and packed results, supplemented by independently repeated focused suites, as evidence for opening the PR. Cost: the reviewer did not repeat the entire acceptance pipeline.
6. Require actual remote GitHub matrix checks before integration. Cost: cross-platform success remains pending.

No minor findings were deferred and no fix pass was required.
