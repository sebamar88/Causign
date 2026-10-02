# Causign CLI

Install as a development dependency, then use `causign init`, `causign inspect`,
and `causign run`. The starter agent only returns a local greeting; it does not
call a provider or perform tool side effects.

Config defaults to `causign.config.ts`. Use `--config` for another path. Agent
working directories (including an omitted cwd) are resolved from the config
directory; executable arguments are passed directly and interpreted by the
agent from that working directory. Evaluator relative modules and package
resolution are anchored at the config directory, and loaded only during run.

Discovery searches the config directory recursively for `**/*.causign.ts` and
excludes node_modules, dist, build, coverage, .causign, .git, and .superpowers.
Positional files/globs filter discovery; quote paths or patterns containing
spaces. Excluded directories stay excluded even with explicit filters.
Symlink directories/files are not followed. No matches and empty collections
produce ERROR. Each scenario module exports a default definition/list, or a
named `definitions` array (for example from an explicit SDK collector).

The CLI loads TypeScript with pinned `tsx` using its scoped `tsImport` API.
Config/scenario imports execute user code. Inspect prepares definitions and
requirements without importing configured agents or evaluator modules, but
is not a security sandbox for imported configuration/scenario code.

Run supports `--verbose` and `--output-dir`; the default output directory is
`.causign/results` relative to the invocation directory. Each execution gets
a unique child directory. Console output includes exact artifact paths and
assertion expected/observed/reason/evidence references. Verbose output includes
raw invalid frames and stderr, bounded per diagnostic with truncation markers.

`results.json` contains schemaVersion `1`, suite results, diagnostics, exitCode,
interrupted, and an `artifacts` manifest mapping plan/trace IDs to absolute
paths. Trace files use the trace contract directly. Plan files contain
`{schemaVersion: '1', plan: RunPlan}`: the versioned storage envelope does not
alter the wire plan contract. Fixed indexed filenames avoid interpreting
scenario or reference IDs as filesystem paths. Captured plan/trace snapshots
retain recorded facts; failed artifact writes make the suite ERROR.

Exit codes are PASS/SKIP 0, FAIL 1, ERROR 2, INCOMPATIBLE 3, and explicit
interruption 130. SIGINT aborts managed execution, awaits cleanup, then sets
process.exitCode. Severity precedence is ERROR > INCOMPATIBLE > FAIL.

Development integration tests run the built executable, so run the workspace
build before the focused CLI test command.
