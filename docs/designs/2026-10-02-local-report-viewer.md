# Local report viewer

Date: 2026-10-02
Status: specification approved by the user; implementation plan pending review.

## Purpose and agreed scope

Users need to understand which agent scenarios failed, what differed from the expectation, and which evidence supports the result without reading raw JSON or long terminal output. The user approved starting with a local viewer of completed reports and previous executions. Running tests from the browser and live execution updates are outside this first version.

The viewer is part of the Causign CLI, works in the tested project, and requires no account, provider credentials, external assets, or additional frontend installation. The runner remains the authority for verdicts. The viewer never changes assertions or executes an agent.

## Approach

Use a small Node HTTP server and bundled HTML, CSS, and JavaScript. Read existing `results.json`, `plan-N.json`, and `trace-N.json` artifacts. Keep the protocol and result schema at version 1.

Alternatives considered:

- A standalone HTML report is portable and useful in CI, but does not directly satisfy the requested localhost history viewer. Export is deferred.
- A frontend application with an execution API could support live runs, but introduces configuration, execution permissions, and dependencies beyond the agreed scope. It is deferred.

The recommended server provides read-only access to a selected results root and serves a self-contained interface. No framework or CDN is required. UI assets must be included in the packed CLI and work through installed CLI, npx, and pnpm dlx.

## Commands and lifecycle

```sh
causign report
causign report --output-dir .causign/results --port 4317
causign report --no-open
causign run --open
```

- `report` uses `.causign/results` relative to the current directory. It does not load `causign.config.ts`, import scenarios, or discover agents.
- `--output-dir` selects the explicit results root. It is not an arbitrary browser filesystem explorer.
- Bind only to `127.0.0.1`. Use an OS-assigned available port by default. `--port` accepts integers from 1 through 65535; an occupied explicit port produces a clear error.
- Open the default browser unless `--no-open` is supplied. Always print the URL. Browser launch failure leaves the server usable and prints a diagnostic.
- The server stays in the foreground until Ctrl+C. Closing the browser does not terminate it. Print this lifecycle explicitly in the terminal.
- `report` returns 0 on deliberate shutdown and 2 on startup failure. Historical test failures do not change the report command exit code.
- `run --open` runs normally, writes artifacts, prints the usual result, then starts the viewer selecting that execution. It remains in the foreground until Ctrl+C during viewing and returns the original suite exit code after shutdown. Ctrl+C during execution retains the existing interrupted result and exit code 130; no viewer starts.
- If artifact writing failed, do not open a report claiming it exists. Preserve the runner's artifact-error outcome. A viewer startup failure after a successful write is reported separately and does not overwrite the suite verdict or exit code; print `causign report` as the retry instruction.
- Plain `run` retains its current behavior. CI uses plain `run` and never starts a server implicitly. `--open` and `report` are opt-in interactive commands.

## User interface

Use Causign branding, readable typography, a responsive layout, and consistent status colors with text and icons. Status must remain understandable without color. Keyboard navigation, visible focus states, semantic controls, and readable contrast are required.

The initial view selects the newest valid execution, or the just-completed run for `run --open`. History is ordered by the existing artifact directory's timestamp prefix; label this as an artifact timestamp, not a measured execution start time. Unrecognized directory names sort deterministically after timestamped entries. Users can refresh history explicitly; no live polling in this version.

The layout contains:

1. Execution selector and overview: scenario counts for PASS, FAIL, ERROR, INCOMPATIBLE, and SKIP; suite exit code; interrupted flag; available scenario durations.
2. Scenario list: search by scenario ID and filter by status. Prioritize failures and errors when opening a report, with stable ordering within groups.
3. Scenario detail: status, assertion outcomes, diagnostics, and missing capabilities. Every assertion shows its original expected, observed, and reason fields.
4. Evidence detail: selecting a message reference opens its trace event; metrics show recorded values; evaluator references show available provenance and verdict explanation. Missing evidence is explicitly labeled unavailable.
5. Timeline: events in `receiveSequence` order, with source, type, message ID, and operation ID when present. Expand raw payloads on demand. Distinguish requested, authorized, started, completed, mocked, and rejected operations. Do not infer execution from a request or authorization. Show trace completeness and terminal event source.

An empty root shows an instruction to run `causign run`. A missing root is an explicit startup error. Corrupt or unsupported executions remain listed with a report-loading error; one corrupt run must not hide valid history. Missing plan or trace still allows valid summary and assertion details to render, with a visible warning.

## Explaining failures

Explanations are deterministic presentations of existing facts, not new model judgments. No LLM or paid call is used.

- For `output.equal`, when a validated plan supplies the structured expected value and a complete trace supplies final output, show a JSON path diff with missing, unexpected, and changed values. Use structural equality consistent with the runner; object key order is irrelevant. Negated assertions require different wording: matching the prohibited value caused failure.
- If structured inputs are unavailable, show the recorded expected and observed strings and original reason. Never reconstruct expected values by parsing the formatted expected string.
- For tool lifecycle assertions, explain which lifecycle fact was required and which matching events are recorded. A request is never described as execution. Absence from an incomplete trace is not evidence that a tool never executed.
- For metrics, show recorded measurement, comparison, and threshold when the plan provides them. Do not manufacture missing timings or cost estimates.
- For INCOMPATIBLE, list missing capabilities and explain that the scenario could not be evaluated with this adapter.
- For ERROR, surface protocol, adapter, timeout, transport, or evaluator diagnostics rather than presenting infrastructure failure as an assertion mismatch.
- For NOT_EVALUATED assertions, explain insufficient evidence using the recorded reason. SKIP and interruption retain their recorded semantics.
- Suggestions are labeled investigative guidance and kept distinct from the recorded reason. Examples: inspect the differing JSON field, check adapter capabilities, or inspect the referenced protocol diagnostic. The UI must not claim a root cause the artifacts cannot establish.

## Artifact loading and local access

- Validate the suite envelope and each scenario result, plan, and trace before consuming them. Report version mismatches explicitly. Verify linked plan/trace IDs against their owning result before joining evidence.
- Existing `results.json` stores absolute artifact paths. Treat those as historical metadata, not permission to read those paths. Resolve the existing indexed `plan-N.json` and `trace-N.json` names within the execution directory, derived from result collection indexes just as the writer does. This also supports copied report directories.
- Enumerate immediate execution directories under the selected root. Do not follow symlink or junction entries, including linked artifact files. Reject traversal and reads outside the canonical selected root. Internal API identifiers must not accept arbitrary filesystem paths.
- Serve only bundled assets and validated report data. Do not serve the repository or a general static directory. Never import user configuration or artifact content as code.
- Render all agent output, IDs, reasons, diagnostics, and payloads as text. Use a restrictive Content Security Policy, no inline handlers or remote scripts, and no HTML interpretation of report content.
- Require the exact server Host and reject cross-origin API requests. Use an unpredictable per-session access token for report APIs, passed through the local browser session and never stored in report artifacts. Avoid permissive CORS. Bind remains loopback-only.
- Report content can contain prompts and sensitive tool output. It remains local; no telemetry or external requests. Raw data is collapsed initially, but collapse is not redaction. Do not promise automatic secret removal.
- Bound enumeration to 1,000 execution directories and JSON files to 16 MiB each; report truncation or oversized artifacts explicitly. Load plans and traces on demand. Paginate timelines at 200 events per page and cap any computed diff at 1,000 changed paths, indicating truncation. Oversized traces must not prevent loading a valid small summary.

## Component boundaries

- CLI command parsing: report options, run integration, and existing exit-code behavior.
- Artifact repository: safe enumeration, validation, indexed association, limits, and history selection.
- Explanation model: deterministic comparisons and evidence links, independent of HTML rendering.
- Local server: session lifecycle, assets, read-only API, host/origin checks, and access token.
- Browser interface: history, filters, details, diff, timeline, and loading/error states.
- Platform browser launcher: literal arguments with no interpolated shell command, independently injectable for tests.

Prefer focused modules under the CLI package. No new public protocol fields or framework-specific coupling are required.

## Verification and acceptance

- Test fixture reports covering PASS, FAIL, ERROR, INCOMPATIBLE, SKIP, interruption, NOT_EVALUATED, negation, mock/reject/proceed lifecycles, and incomplete traces.
- Verify JSON comparisons, missing evidence, evaluator references, copied artifacts with stale absolute paths, corrupt runs, ID mismatches, schema versions, and declared loading limits.
- Exercise actual HTTP behavior: loopback binding, token requirements, host/origin rejection, malicious HTML rendered as text, traversal rejection, links/junctions, and clean shutdown.
- Verify plain `run` remains unchanged, `run --open` preserves suite exit codes, execution interruption does not launch a viewer, and browser-opening failure leaves a usable URL.
- Perform visual browser verification of a real failure report: expected/observed diff, evidence navigation, filters, responsive layout, and keyboard access.
- Extend packed-consumer acceptance to prove UI assets and report startup work outside the repository. Existing CI platforms cover Windows x64, Linux x64/ARM64, and macOS ARM64; browser launching is stubbed in automated CI.
- Run generated-type check, typecheck, lint, relevant tests, coverage, and packed acceptance before completion. The new feature remains unpublished until a separate release.

## Deferred work

Standalone HTML export for CI, report comparisons across runs, live updates, browser-triggered execution, automatic fixes, LLM explanations, remote hosting, and authentication for shared remote reports.
