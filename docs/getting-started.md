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
`causign.config.ts`, `sample.causign.ts` and `sample-agent.mjs`. Existing
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

The command must speak Causign JSONL. Arguments are passed directly without a
shell. Agent working directories resolve from the config directory, including
omitted cwd. `env` supplies extra process environment values; do not commit secrets.

## Commands and discovery

| Command | Purpose |
| --- | --- |
| `causign init` | Generate starter files in the current directory |
| `causign inspect` | Validate/normalize definitions without starting agents |
| `causign run` | Negotiate, execute and evaluate |

`inspect` and `run` accept positional file/glob filters and `--config path`.
Run also accepts `--output-dir path` and `--verbose`.

```sh
pnpm exec causign inspect 'tests/**/*.causign.ts' --config causign.config.ts
pnpm exec causign run 'tests/**/*.causign.ts' --output-dir .causign/results --verbose
```

Discovery searches recursively from config for `**/*.causign.ts`. Dependencies,
build output, coverage, Git and Causign artifacts are excluded; symlinks are
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
  '@causign/protocol': file:./causign-protocol-0.1.0.tgz
  '@causign/core': file:./causign-core-0.1.0.tgz
  '@causign/sdk': file:./causign-sdk-0.1.0.tgz
  '@causign/cli': file:./causign-cli-0.1.0.tgz
  '@causign/adapter-vercel': file:./causign-adapter-vercel-0.1.0.tgz
```

```sh
pnpm add -D ./causign-protocol-0.1.0.tgz ./causign-core-0.1.0.tgz ./causign-sdk-0.1.0.tgz ./causign-cli-0.1.0.tgz ./causign-adapter-vercel-0.1.0.tgz ai@7.0.127
pnpm exec causign init
pnpm exec causign inspect
pnpm exec causign run
```

This full-distribution recipe includes Vercel and its exact peer. Custom agents
do not require Vercel. The [packed smoke script](../scripts/packed-smoke.mjs)
is the executable reference, including pnpm build policy and release-age
exceptions for the exact dependencies. Installation does not publish packages.

Continue with [scenarios](scenarios.md), [adapters](adapters.md) or
[results](results-and-security.md).
