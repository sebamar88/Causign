# Automatic npm publishing

The `Publish npm packages` Action runs when a package manifest changes on `main`. It can also be started from Actions > Publish npm packages > Run workflow, selecting `main`.

Change the version in each package you intend to release. Keep other packages unchanged. Merge the change into main; the workflow installs frozen dependencies, verifies generated contracts, lints, builds/tests, and runs clean-consumer packed acceptance before publishing.

The publisher compares every public package's exact version with the npm registry. Existing versions are skipped; missing versions are packed with pnpm and published with npm in workspace dependency order. This preserves pnpm's workspace dependency replacement in the tarballs. A registry error stops the job rather than treating the package as unpublished.

Configure the repository Actions secret `NPM_TOKEN` with permission to publish all eight packages directly. A stage-only token is insufficient for this workflow. The token is provided only to the final publication step, never to PR runs. GitHub creates npm's authentication configuration through setup-node. Do not commit credentials.

Publications are serialized and never cancelled midway by a newer run. If a package fails to publish, packages published earlier remain available. Resolve authentication, approval/staging conflicts, or registry errors and rerun the workflow; completed versions are skipped. The workflow never deletes versions or approves staged packages automatically.

Use `node scripts/publish-packages.mjs --dry-run` to inspect pending packages without publishing. No npm credentials are needed for public registry checks. Network/registry failures are reported explicitly.

The publication workflow performs acceptance on Linux. The separate existing CI workflow continues to cover Windows, Linux x64/ARM64, and macOS ARM64; its complete matrix is not a dependency of the publication job.

The current CLI manifest remains 0.1.1. Bump it to 0.1.2 to release the evidence-navigation fix; installing this workflow alone does not change package versions.
