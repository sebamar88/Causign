# Quality improvements: execution order

Approved specification: [quality hardening](2026-10-02-quality-hardening.md).

The four independently reviewable deliverables have separate implementation plans:

1. [Adapter tests](2026-10-02-quality-adapter-tests.md): baseline, Codex discovery/translation, Vercel lifecycle and usage.
2. [Formatting](2026-10-02-quality-format.md): pinned Prettier, mechanical formatting and CI check.
3. [Targeted lint](2026-10-02-quality-lint.md): installed-rule audit, explicit rules and narrow fixes.
4. [Shared discovery](2026-10-02-quality-discovery.md): additive runtime collector and provider migrations.

Each plan starts only after its predecessor is integrated. Direct implementation in the current chat is the user's preserved execution preference. All plans were approved. Adapter confidence (PR #6), formatting (PR #7) and targeted lint (PR #8) are integrated. Shared discovery is implemented and independently reviewed without findings and awaiting PR integration; see the dated validation reports.

Self-review: the plans cover each specification requirement. Global constraints preserve version 1, execution restrictions and package DAG; five review-focus cases per plan map to owned tests/checks. The shared collector signature and provider callback responsibilities agree across both extraction tasks. Coverage is measured fresh, with no artificial RED requirement for characterization or arbitrary thresholds. Formatting and lint remain separate PRs, as do behavior tests and runtime extraction. Package release and Paperclip remain excluded.
