# Causign quality hardening

Status: scope approved in chat; written specification awaiting review.

## Intent

Improve confidence in adapter behavior and make the repository easier to maintain. The user approved four separate PRs: adapter tests, formatting, targeted lint, and shared discovery infrastructure. Paperclip is cancelled. Work remains directly in this repository.

Success means meaningful coverage of failure paths, readable source, enforceable lint checks, and less duplicated discovery bookkeeping without changing public protocol or execution guarantees.

## Sequence and integration

Deliver four PRs in order. Start each from the current integrated main branch; merge or otherwise establish its predecessor before proceeding so formatting does not obscure behavioral changes. Keep unrelated working-tree edits outside these PRs. Do not publish packages or bump versions as part of this work. Existing automatic publishing therefore remains inactive for these changes until a separate release decision.

## PR 1: Adapter behavior and coverage

Run a fresh baseline with the current Vitest V8 configuration. Record per-adapter statements, functions, and branches using coverage artifacts; the existing 93.07% aggregate report is historical evidence, not a current baseline. Identify uncovered behavior rather than measuring quality by the number of test files. Do not exclude difficult code solely to raise percentages or introduce an arbitrary global threshold.

Codex discovery cases: malformed TOML in profile and base configuration files; invalid native selectors; duplicate selectors from different paths; non-string model/provider metadata; ignored instructions and unrelated files; legacy-profile warnings; valid candidates alongside errors; source revision and stable candidate IDs.

Codex translator cases: incomplete turns; malformed JSON and invalid event shapes; duplicate starts/final output; completion before output; events after completion; unsupported item kinds; failed exit or signal; valid item updates and CRLF input. Establish expected behavior from the existing supported version/profile contract. Codex output execution remains disabled where the tool restriction guarantee is unavailable. Tests must not imply otherwise.

Vercel cases: model failure and cancellation; tool real/mock/reject paths and their distinct evidence; invalid tool output and async iterables; unsupported tool definitions; invalid input and step limits; multi-step usage aggregation where one token dimension becomes unknown. Unknown usage must not become fabricated zero or cost, and mocks/rejections must not invoke a real tool. Use deterministic models and controlled promises, not paid providers or wall-clock sleeps.

Add tests for uncovered cases, avoiding duplicates of existing assertions. If a case exposes a defect, first reproduce it with a failing regression, then apply the smallest fix in the same PR. Document any contract ambiguity before choosing new semantics.

Acceptance: complete test suite and packed consumer acceptance pass; coverage changes and deliberately untested paths are reported. Tests assert returned results and recorded lifecycle evidence, including non-execution where applicable.

## PR 2: Formatting only

Use Prettier as the formatter, pinned to a version verified at implementation time. Prefer ordinary defaults over a broad custom style configuration. Add format and format-check commands and a CI check. Include maintained TypeScript/JavaScript, JSON, YAML, and Markdown. Exclude build output, dependencies, coverage, runtime artifacts, historical scratch directories, lockfiles, and generated protocol source. Keep generated files under their existing generator checks.

Expand dense maintained code consistently. Do not rename symbols, change expressions, reorder imports through another tool, or fix lint findings in this PR. Isolate formatter configuration and mechanically produced changes so reviewers can examine a whitespace-insensitive diff.

Acceptance: format-check, lint, generated checks, build, suite, and packed acceptance pass. Review non-whitespace changes from formatting and verify they are syntactic presentation only.

## PR 3: Targeted lint

Keep correctness errors and deny warnings. Inspect the installed oxlint rule definitions and current findings before adding rules. Evaluate suspicious-pattern checks and applicable rules for async misuse, unsafe coercion, accidental mutation, and maintainability. Enable only rules supported by the pinned version and useful for this codebase; do not enable every plugin category indiscriminately.

Record the selected rules and rationale in development documentation. Fix findings with minimal semantic changes and regression tests when behavior changes. Any suppression must be narrow and explain why the code is intentional. Do not globally weaken correctness or suppress whole packages to obtain a green check. Type-aware checks require explicit tooling support; do not claim plain oxlint supplies them automatically.

Acceptance: lint runs in CI with zero warnings, the full suite and packed acceptance pass, and changed behavior has appropriate regression coverage.

## PR 4: Shared discovery bookkeeping

Extract the file-iteration/result-collection boundary into runtime. Its responsibility is to visit selected SourceFile entries, collect zero or more candidates/diagnostics, and compute complete from error diagnostics. Provider callbacks retain matching, parsing, native-selector handling, duplicate policies, candidate construction and diagnostic codes/messages. Use a small explicit result contract rather than provider-name switches or parser dependencies in runtime.

Keep the helper internal to the workspace implementation where possible. If adapters need a runtime export, mark it as additive and document its contract; do not remove or alter existing Discoverer/RuntimePlugin interfaces. Avoid excessive generalization where sharing would require changing provider semantics.

Characterization tests from PR 1 must preserve candidate IDs, order, revisions, source paths, selectors, metadata, diagnostic codes/severity/messages, partial candidates, and complete values. In particular, Claude and Codex currently report duplicates differently; sharing infrastructure must preserve that difference. Runtime remains independent of YAML/TOML libraries, preserving the acyclic dependency graph.

Acceptance: helper tests cover empty input, ignored files, warnings, mixed valid/invalid files, and failure aggregation. Both adapter suites, full repository checks, and packed discovery acceptance pass with the existing public contracts.

## Out of scope

Shared base error classes, changes to protocol schemas, enabling unsupported Codex execution, plugin sandboxing, new providers, Paperclip, new dashboards, package publication, and credential changes. A common error type should be revisited only when concrete consumers need stable cross-package codes/causes.

## Verification and reporting

Run checks appropriate to each PR and the existing complete acceptance before integration. Report Windows-only skips explicitly. Local success is not a remote matrix success claim; inspect actual GitHub results for Linux x64/ARM64, Windows x64, and macOS ARM64. PR descriptions explain behavioral changes and evidence, while formatting remains separate.

Next gate: review this written specification. After approval, write an implementation plan with concrete files, test cases, commands, and commit boundaries. Direct execution in this chat remains the previously selected working preference.
