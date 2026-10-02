# Causign 0.1.1 release preparation

Status: prepared locally, not published to npm.

All eight packages use 0.1.1. This release adds extensible discovery, Claude Code and Codex integrations, and the local report viewer. Protocol schema version remains 1.

Validation: 399 tests passed, one existing Windows platform skip; generated checks, build, lint and eight-package clean-consumer acceptance passed. Package descriptions added for npm discoverability.

Registry audit: protocol, core, sdk, cli and adapter-vercel have latest 0.1.0. Historical 0.0.0-stage placeholders remain on protocol and sdk, but are not latest. Runtime, adapter-claude-code and adapter-codex return 404 and require first publication.

Publish public packages in dependency order: protocol, core, sdk, runtime, adapter-vercel, adapter-claude-code, adapter-codex, cli. Use `pnpm --dir packages/<name> publish --access public --tag latest --no-git-checks` from the tested release checkout. Registry authentication and any required npm verification must be completed by the publisher. Do not create new placeholder versions.

After publication, verify each package's latest tag and install/run the CLI from a fresh external project. Update installation documentation to recommend 0.1.1 only once registry availability is confirmed; published-version examples currently remain at 0.1.0.
