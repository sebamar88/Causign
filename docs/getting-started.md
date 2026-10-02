# Getting started

## Build from source

Use Node 22+ and pnpm 11.25.0. Python 3 is needed for repository acceptance,
not every CLI invocation.

```sh
git clone https://github.com/sebamar88/bytekitsecure.git
cd bytekitsecure
pnpm install --frozen-lockfile
pnpm build
```

From a new project directory:

```sh
node /absolute/path/to/bytekitsecure/packages/cli/dist/bin.js init
node /absolute/path/to/bytekitsecure/packages/cli/dist/bin.js inspect
node /absolute/path/to/bytekitsecure/packages/cli/dist/bin.js run --verbose
```

In PowerShell, quote absolute paths containing spaces. `init` creates
`agentest.config.ts`, `sample.agentest.ts` and `sample-agent.mjs`. Existing
target files, directories or symlinks cause refusal before writing.
The starter agent returns a greeting without a provider.

## Configure an instrumented agent

```ts
export default {
  schemaVersion: '1',
  agents: {
    support: { command: process.execPath, args: ['support-agent.mjs'], cwd: '.' },
  },
  evaluators: {},
};
```

The command must speak Agentest JSONL. Arguments are passed directly without a
shell. Agent working directories resolve from the config directory, including
omitted cwd. `env` supplies extra process environment values; do not commit secrets.

## Commands and discovery

| Command | Purpose |
| --- | --- |
| `agentest init` | Generate starter files in the current directory |
| `agentest inspect` | Validate/normalize definitions without starting agents |
| `agentest run` | Negotiate, execute and evaluate |

`inspect` and `run` accept positional file/glob filters and `--config path`.
Run also accepts `--output-dir path` and `--verbose`.

```sh
pnpm exec agentest inspect 'tests/**/*.agentest.ts' --config agentest.config.ts
pnpm exec agentest run 'tests/**/*.agentest.ts' --output-dir .agentest/results --verbose
```

Discovery searches recursively from config for `**/*.agentest.ts`. Dependencies,
build output, coverage, Git and Agentest artifacts are excluded; symlinks are
not followed. No matches, empty collections and duplicate IDs produce ERROR.
Config and scenario imports execute local code; inspect is not a sandbox.

## Local package installation

Public npm availability is not assumed. Build, then run
`pnpm pack --pack-destination /absolute/path/to/archives` from each of the five
package directories: protocol, core, sdk, cli and adapter-vercel.
Copy the archives to your consumer root and merge these settings into its
`pnpm-workspace.yaml`:

```yaml
overrides:
  '@agentest/protocol': file:./agentest-protocol-0.1.0.tgz
  '@agentest/core': file:./agentest-core-0.1.0.tgz
  '@agentest/sdk': file:./agentest-sdk-0.1.0.tgz
  '@agentest/cli': file:./agentest-cli-0.1.0.tgz
  '@agentest/adapter-vercel': file:./agentest-adapter-vercel-0.1.0.tgz
```

```sh
pnpm add -D ./agentest-protocol-0.1.0.tgz ./agentest-core-0.1.0.tgz ./agentest-sdk-0.1.0.tgz ./agentest-cli-0.1.0.tgz ./agentest-adapter-vercel-0.1.0.tgz ai@7.0.127
pnpm exec agentest init
pnpm exec agentest inspect
pnpm exec agentest run
```

This full-distribution recipe includes Vercel and its exact peer. Custom agents
do not require Vercel. The [packed smoke script](../scripts/packed-smoke.mjs)
is the executable reference, including pnpm build policy and release-age
exceptions for the exact dependencies. Installation does not publish packages.

Continue with [scenarios](scenarios.md), [adapters](adapters.md) or
[results](results-and-security.md).
