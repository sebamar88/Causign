# Development and distribution

## Workspace map

| Directory                 | Responsibility                                       |
| ------------------------- | ---------------------------------------------------- |
| `packages/protocol`       | Normative schemas, types, capabilities and lifecycle |
| `packages/core`           | Transport, plans, execution, assertions and results  |
| `packages/sdk`            | Scenario DSL, mocks and bridge                       |
| `packages/cli`            | Discovery, starter generation and reports            |
| `packages/adapter-vercel` | Pinned AI SDK integration                            |
| `fixtures` / `examples`   | Deterministic processes and domains                  |
| `scripts`                 | Type generation and acceptance                       |
| `skills/causign`          | Assistant guidance                                   |

## Checks

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm check:generated
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:packed
```

Set absolute `CAUSIGN_PYTHON` when Python is not on PATH and `CAUSIGN_PNPM`
when pnpm is not discoverable. `CAUSIGN_PACKED_STORE` selects a separate store
for cold-cache package acceptance. Focused tests require a build:

```sh
pnpm build
pnpm exec vitest run packages/protocol/test/generated-check.test.ts
```

Do not pass an extra literal `--` before Vitest file filters. Oxlint uses native
default rules with warnings denied, not the separate StandardJS preset.

### Targeted lint rules

Oxlint remains pinned to 1.86.0. Correctness errors and `--deny-warnings` remain
enabled; both acceptance and publication CI invoke the same `pnpm lint` command.
The installed configuration schema and candidate runs establish support for:

| Rules                                            | Purpose                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `eqeqeq`                                         | Avoid accidental coercion in comparisons.                                        |
| `no-var`, `prefer-const`                         | Make scope and reassignment intent explicit.                                     |
| `no-async-promise-executor`                      | Prevent async executor rejections from escaping the constructed promise.         |
| `no-promise-executor-return`                     | Avoid implying that the Promise constructor consumes an executor's return value. |
| `prefer-promise-reject-errors`                   | Preserve useful error context in rejection values.                               |
| `promise/no-new-statics`, `promise/valid-params` | Reject invalid Promise API construction and arguments.                           |
| `promise/no-return-wrap`                         | Avoid redundant promise wrapping inside continuation callbacks.                  |
| `promise/no-return-in-finally`                   | Prevent cleanup return values from implying replacement of a settled result.     |
| `promise/no-multiple-resolved`                   | Detect visible repeated settlement of a promise.                                 |

Candidate runs found 14 implicit executor returns, replaced with block bodies
that evaluate the same expression and discard its value. Other selected rules
had no findings. No semantic runtime fixes or suppressions were necessary.

The broader suspicious-category audit found 61 findings: 19 shadowed names,
14 resolver naming conventions, 12 array sorts, 10 local helper scope findings,
three continuation-return conventions, two reverses and one asynchronous polling
loop condition. A blanket category would enforce style on deliberate fixtures,
fresh owned arrays and void lifecycle continuations; those rules were not added.
`typescript/no-explicit-any` produced 112 findings, mostly deliberate malformed
protocol fixtures and erased AI SDK tool generics. It is not enabled or globally
suppressed. Generated protocol source stays under generator checks.

This configuration uses syntax-based rules. It does not establish type-aware
floating-promise or misused-promise coverage; those require separately configured
type-aware tooling. Cancellation and lifecycle evidence remain protected by the
existing behavioral suite.

## Contracts and coverage

Use `pnpm format` to format maintained source, configuration and documentation
with the pinned Prettier version. `pnpm format:check` verifies formatting without
writing files and runs in acceptance and publication CI. Defaults apply with LF
line endings on every platform; dependencies, build output, coverage, runtime
artifacts, scratch directories, the lockfile and generated protocol source are
excluded. Generated source remains governed by `pnpm check:generated`.

Edit schemas, run `pnpm generate`, and review generated types; do not edit those
types by hand. Drift checks accept equivalent LF/CRLF endings.
V8 coverage uses matching Vitest/coverage packages at `3.2.4` and writes HTML,
LCOV and summary JSON under `coverage/`. Use the summary for measured totals.
Generated types are excluded and subprocess CLI paths are not fully represented
in in-process coverage. Percentages imply no security certification or confidence.

## Distribution

Five `0.1.0` packages expose built exports; CLI also exposes `causign`.
Packing replaces workspace references; packed acceptance verifies clean installed
package resolution and runs the installed executable. Version 0.1.0 is published on npm; see [installation](getting-started.md).
Publishing requires registry ownership/authentication and a release decision;
checks and packing do not publish. Keep versions, lockfile, compatibility docs
and packed-fixture expectations synchronized for releases.

Install [the assistant skill](../skills/causign/SKILL.md) using your runtime's
installer and its discovery/reload instructions. It guides the CLI but does not
replace adapters. Update it when commands or evidence semantics change.

Contributions should retain intent/execution separation, explicit authorization,
closed-world capabilities, bounded transport and evidence provenance. Include
the behavior change, validation and compatibility limits in review descriptions.
