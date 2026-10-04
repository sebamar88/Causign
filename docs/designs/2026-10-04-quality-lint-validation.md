# Targeted lint validation

PR 3 starts from integrated main at 696e5c4. Oxlint stays at 1.86.0. Installed schema, effective configuration and candidate invocations verify the selected rule identifiers. Correctness errors and warning rejection remain intact in both CI workflows.

Eleven explicit rules cover comparison coercion, scope/reassignment intent and syntax-based Promise misuse; exact rules and audit rationale are documented in development.md. Before fixing, permanent lint configuration reported fourteen no-promise-executor-return violations. All fourteen became expression statements in block executors; the same original calls, arguments and callbacks remain. Constructor return values were already ignored, so no behavior changed and no mirror tests were added. No suppressions were needed.

Validation: format-check, generated-contract check, TypeScript build and lint passed. The complete V8 suite passed 451 tests with one existing POSIX-only skip on Windows. Offline consumer acceptance installed eight archives and passed seven baseline scenarios, external-plugin discovery and the local report viewer. No versions or publishing configuration changed; remote CI is pending.

## Decisions and costs

1. Keep the approved existing checkout on a fresh branch. Cost: less filesystem isolation than a separate worktree.
2. Select individual rules instead of all suspicious-category rules after a 61-finding audit. Cost: the rejected broad classes are not globally enforced.
3. Leave no-explicit-any disabled after 112 findings, mostly deliberate fixtures and erased tool generics. Cost: explicit-any discipline remains review/typecheck responsibility; no suppression was added.
4. Do not configure a separate type-aware backend. Cost: floating/misused-promise coverage is not claimed by this syntax-based setup.
5. Use installed schema and candidate invocations as the inventory because --rules emitted no usable output. Cost: no separate rule-table archive.
6. Verify purely syntactic executor changes with lint RED/GREEN, expression preservation and the full suite. Cost: no new behavioral regressions for an unchanged ignored return value.

## Independent review

Review of 696e5c4..eb71fe5 returned ready to merge, with no Critical, Important or Minor findings. The reviewer independently ran changed-file formatting and lint: zero diagnostics across 137 files and 107 rules. All fourteen expression evaluations and callbacks were inspected.

Reviewer limitations and rulings:

7. Type-aware floating/misused-promise enforcement remains deferred under decision 4. Cost: those errors may require review or future tooling.
8. Eliminating all explicit any remains outside this targeted configuration under decision 3. Cost: existing deliberate any usage persists.
9. Remote CI matrix results remain pending; require actual GitHub checks before integration. Cost: cross-platform success is not yet established.
10. Accept fresh executor suite/packed results as evidence for opening the PR; the read-only reviewer inspected results instead of rerunning them. Cost: no independent second full-suite execution.

No minor findings were deferred. No second review or fix pass was needed.
