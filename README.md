# Agentest

Agentest tests instrumented AI agents through a language-neutral JSONL protocol. Scenarios describe static tool mocks, output and behavior assertions, approvals, and explicit capability requirements. The runner saves plans, traces, and results and returns an exit code suitable for CI.

This repository contains five version 0.1.0 packages: `@agentest/protocol`, `@agentest/core`, `@agentest/sdk`, `@agentest/cli`, and `@agentest/adapter-vercel`. Public npm availability is not assumed.

Use Node 22 or newer and pnpm 11.25.0. CI acceptance is configured for Node 24.21.0 and Python 3.12.10; Python is required for the cross-language fixture. `AGENTEST_PYTHON` can select an absolute Python 3 executable.

```sh
pnpm install --frozen-lockfile
pnpm check:generated
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm test:coverage
pnpm test:packed
```

Tests build TypeScript projects before loading distribution exports. Coverage writes HTML, LCOV and JSON summary to `coverage/`; inspect `coverage/coverage-summary.json` for measured totals. No statistical confidence or release threshold is inferred from coverage. The Windows/Linux CI workflow executes deterministic fixtures without provider credentials. A workflow definition is not evidence of a remote CI run.

For a workspace starter, use the built CLI in a new directory:

```sh
node /absolute/path/to/agentest/packages/cli/dist/bin.js init
node /absolute/path/to/agentest/packages/cli/dist/bin.js inspect
node /absolute/path/to/agentest/packages/cli/dist/bin.js run --verbose
```

`init` writes a configuration, a sample `*.agentest.ts` definition, and a harmless process agent. It refuses to overwrite existing files. `inspect [files/globs] --config path` displays normalized scenarios and requirements without starting agents; compatibility is unverified until negotiation. `run [files/globs] --config path --output-dir path --verbose` discovers TypeScript scenarios, runs them, and saves evidence. Default artifacts live in `.agentest/results`. Inputs, outputs and diagnostics may appear in those local files.

To use the distribution in another project, pack each package with `pnpm pack --pack-destination /absolute/archive/directory` from its package directory, then install the five resulting `.tgz` files as development dependencies in the consumer. For pnpm, add `overrides` in the consumer's `pnpm-workspace.yaml`, mapping each of the five package names to its `file:./archive.tgz` path, so transitive package versions resolve locally too. [The packed smoke script](scripts/packed-smoke.mjs) creates this exact configuration. Install the Vercel adapter's `ai@7.0.127` peer when using it. Run `pnpm exec agentest init`, `pnpm exec agentest inspect`, and `pnpm exec agentest run`; the same last command works in consumer CI. `pnpm test:packed` resolves a consumer lockfile and fetches dependencies online, then performs a frozen offline installation in a fresh temporary consumer and runs the installed CLI against all five domains, Python, and deterministic Vercel examples. Set `AGENTEST_PNPM` if pnpm is not on PATH. This performs no publication.

The [examples](examples/README.md) use fake support, coding, DevOps, RAG, and coordinator tools. Their `.mjs` definitions are reusable exports; CLI discovery uses `*.agentest.ts` wrappers, as demonstrated by the acceptance script. The Vercel example uses the real pinned AI SDK with its deterministic mock model.

Process isolation separates scenario state; it is not a security sandbox. Instrumentation must expose actual tool intent before effects. Static mocks bypass selected real implementations, but live model behavior remains nondeterministic. See [protocol v1](docs/protocol-v1.md) and [adapter conformance](docs/adapter-conformance.md) for evidence boundaries and integration rules.

The complementary [Agentest skill](skills/agentest/SKILL.md) guides coding assistants through CLI setup, scenarios, evidence interpretation, and CI integration. Install the skills/agentest folder with your runtime’s skill installer to use it as $agentest. The CLI remains the executable test runner.
