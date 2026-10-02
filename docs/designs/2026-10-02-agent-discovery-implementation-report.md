# Agent discovery implementation evidence

Implemented in local branch `codex/extensible-agent-discovery`; no push, merge,
npm publication or live model execution performed.

## Delivered

- Open plugin API/registry, explicit ESM manifests, bounded file/service discovery.
- Independent matching, probing and launch preparation; existing protocol/config preserved.
- CLI discover; generic instruction candidates; Claude and Codex reference discovery.
- Claude output adapter with restricted tool-disabled launch, exact verified definition snapshot.
- Codex output launches explicitly refused pending verified global tool denial.
- Native lifecycle/capture/cancellation and external fixture conformance.
- Eight-package tarball consumer verifies baseline scenarios and third-party plugin.

## Verification

- Final local suite: 345 passed, 1 POSIX-only test skipped on Windows, 24 test files.
- Typecheck, generated schema check and Oxlint passed.
- Coverage: lines/statements 93.36%, branches 85.38%, functions 91.04%.
- Packed consumer: 8 archives installed offline; 7 existing scenarios plus external plugin passed.
- Linux/WSL native regression harness: attached descendant escalation, runner cancellation
  and scenario timeout passed. Both cancellation defects reproduced before fixes.
- Real explicitly selected Claude directory: 216 candidates, 0 definition errors,
  197 metadata warnings. No models executed. This proves discovery, not authentication.
- Fresh independent read-only review found 3 Important defects and 1 Minor;
  all corrected in one regression-tested fix pass. No deferred minors.
- Four-platform CI retains Linux x64/ARM64, Windows x64, macOS ARM64 configuration;
  remote CI has not run for these unpushed commits.

## Decisions and practical limits

1. Work in a new local branch in the existing checkout to preserve uncommitted
   documentation and installed dependencies. Cost: shared checkout needs scoped staging.
2. Allow explicit manifest service sources with plugin-validated options. Cost:
   manifest surface is larger than the original file-only example.
3. Refuse Codex execution until global tool denial is proven. Cost: discovered
   Codex profiles cannot be run through this output profile yet.
4. Allow optional literal executable prefix args for wrappers/fixtures. Cost:
   additional validated launch input, still no shell interpolation.
5. Use pure-JS import-meta-resolve 4.2.0 for manifest-relative import-only exports.
   Cost: a small additional dependency; a regression test proves why it is needed.
6. Regrade explicit symlink roots as Important and return an error. Cost:
   callers previously seeing a successful empty scan must correct their source path.
7. Keep live auth/provider verification opt-in. Cost: fixture success is not
   evidence of real-provider readiness.
8. Keep deliberately detached descendants and WSL boundary escape as documented
   cleanup limits. Cost: those cases may require external isolation/cleanup.
9. Keep registered plugins trusted code. Cost: a malicious registered plugin
   acts with the user's permissions; the registry is not a security sandbox.

Uncommitted `docs/development.md` and `docs/getting-started.md` changes predate this
implementation and remain preserved. Merge/publication requires a separate decision.
