# Local report viewer implementation report

Branch: `codex/local-report-viewer`. Base: `2ca04811aa052ff68728db1f69010517e576d8dc`.

## Delivered behavior

The CLI now provides `report [--output-dir path] [--port number] [--no-open]` and `run --open`. Reports are read-only, local, and based on completed artifacts. The browser shows history, status counts, search/filter controls, recorded reasons, deterministic investigative guidance, JSON path differences, message/metric/evaluator evidence, and paginated timelines. Missing, corrupt, linked, oversized, or mismatched artifacts are surfaced explicitly.

The server binds to loopback and requires a session token for report data, exact Host, and permitted Origin. It serves fixed packaged assets only. User-generated content is rendered as text under CSP. Plain run remains unchanged; stopping the viewer after run preserves suite exit codes, including INCOMPATIBLE 3. Active execution interruption remains 130. No product dependencies or protocol changes were introduced.

## Final verification

- TypeScript build, generated contract check, and whole-repository oxlint passed.
- 399 tests passed; one existing POSIX process-tree test was skipped on Windows.
- Node V8 coverage: statements/lines 93.07%, branches 85.08%, functions 92.17%. Browser interactions were verified separately and are not measured by the Node test process coverage.
- Eight tarballs installed into a clean consumer passed seven baseline scenarios, external runtime plugin acceptance, and local report acceptance: HTML/CSS/client JS and its session/navigation modules, authenticated history, failure diff, evidence, and graceful command shutdown.
- Integrated browser verification: visible greeting mismatch, prohibited equality explanation, literal HTML diagnostic with no image element created, incomplete-trace warning, status filtering, keyboard selection, evidence navigation to page 2, session refresh, and no logged console warnings/errors.
- Responsive check at a 390-pixel viewport: document content width equaled viewport client width; no horizontal overflow. Desktop screenshot: `docs/images/local-report.png`.

Remote CI has not been run for this branch. No npm release, merge, or push was performed. Pre-existing edits to `docs/development.md` and `docs/getting-started.md` are excluded.

## Implementation rulings

1. Use a new branch in the existing checkout to preserve the previous in-place workflow and dirty docs. Cost if wrong: less filesystem isolation than a worktree.
2. Generate small report fixtures in test utilities rather than duplicate indexed JSON snapshots. Cost if wrong: fixtures are less convenient to inspect without running tests.
3. Test real compiled assets with the compiled server: source execution cannot serve the deliberately compiled browser module. Cost if wrong: this test requires the existing build prerequisite.
4. Use the integrated CUA browser because agent-browser is unavailable. Cost if wrong: manual visual checks are not automatically replayed by CI.
5. Packed acceptance verifies the already-built viewer; it passed without a packaging change. This verification-only addition does not introduce new production behavior and therefore required no artificial RED mutation. Cost if wrong: package completeness is guarded by acceptance rather than a separate packaging implementation cycle.

## Review findings and closure

Independent review reproduced three important issues before stopping due to a reviewer usage limit. No complete independent verdict was received; the author completed the remaining checks. No second review was dispatched.

- Response amplification from repeated observed output: bounded iterative encoding now rejects responses above 4 MiB before sending headers. The HTTP regression failed with an oversized 200 response before the fix and passes with an explicit 422 error afterward.
- Root replacement: the repository pins the selected directory identity. A regression that previously read a replacement directory now rejects it.
- Skip-link refresh lost the session: only a valid token fragment replaces the saved token. Browser reproduction failed before the fix; navigating the skip link and refreshing now retains the report.
- Author checks also reproduced stale scenario details after filtering and empty-history refresh. Both now clear details and timeline; browser checks passed. Evidence navigation ignores responses after selection changes, covered by regression tests.

The complete suite, generated check, TypeScript build, lint, and packed acceptance passed after these fixes. Browser checks also verified matching ERROR details, zero-match cleanup, empty-history cleanup, and no console warnings/errors.

6. Add a 4 MiB aggregate API response limit to prevent amplification. Cost: very large valid details require direct artifact inspection; recorded verdicts remain unchanged.
7. Close verification using reproduced independent findings plus author checks after the reviewer was interrupted. Cost: there is no full independent approval verdict. This limitation remains visible for integration review.

## Deferred feature scope

Standalone HTML export, cross-run comparison, live updates, browser-triggered execution, LLM explanations, automatic fixes, and remote hosting remain outside this version. npm 0.1.0 does not contain the viewer.
