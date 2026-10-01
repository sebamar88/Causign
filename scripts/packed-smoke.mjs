import assert from "node:assert/strict";
import { mkdtemp, writeFile, readdir, cp, readFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, isAbsolute, sep } from "node:path";
import {
  command,
  root,
  runBuiltAcceptanceSuite,
} from "./release-acceptance.mjs";
const pnpm = process.env.AGENTEST_PNPM ?? "pnpm";
async function pm(args, cwd) {
  // Windows command shims execute in one PowerShell with literal arguments.
  const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
  const result =
    process.platform === "win32"
      ? await command(
          "powershell.exe",
          [
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            `& ${literal(pnpm)} ${args.map(literal).join(" ")}; exit $LASTEXITCODE`,
          ],
          cwd,
        )
      : await command(pnpm, args, cwd);
  assert.equal(result.exitCode, 0, result.stdout + "\n" + result.stderr);
  return result;
}
const consumer = await mkdtemp(join(tmpdir(), "agentest packed consumer "));
for (const name of ["protocol", "core", "sdk", "cli", "adapter-vercel"])
  await pm(
    ["pack", "--pack-destination", consumer],
    join(root, "packages", name),
  );
const archives = (await readdir(consumer)).filter((f) => f.endsWith(".tgz"));
assert.equal(archives.length, 5);
const packed = Object.fromEntries(
  archives.map((f) => [
    "@agentest/" + f.replace(/^agentest-/, "").replace(/-0\.1\.0\.tgz$/, ""),
    "file:./" + f,
  ]),
);
await writeFile(
  join(consumer, "package.json"),
  JSON.stringify(
    {
      private: true,
      type: "module",
      dependencies: { ...packed, ai: "7.0.127" },
    },
    null,
    2,
  ),
);
await writeFile(
  join(consumer, "pnpm-workspace.yaml"),
  "allowBuilds:\n  esbuild: false\nminimumReleaseAgeExclude:\n  - ai@7.0.127\n  - '@ai-sdk/gateway@4.0.103'\noverrides:\n" +
    Object.entries(packed)
      .map(([name, path]) => `  '${name}': '${path}'\n`)
      .join(""),
);
// A frozen workspace install does not populate registry metadata for a new
// consumer. Resolve its own lockfile and fetch packages before testing offline.
const storeArgs = process.env.AGENTEST_PACKED_STORE
  ? ["--store-dir", process.env.AGENTEST_PACKED_STORE]
  : [];
await pm(["install", "--lockfile-only", ...storeArgs], consumer);
await pm(["fetch", ...storeArgs], consumer);
await pm(["install", "--offline", "--frozen-lockfile", ...storeArgs], consumer);
const canonicalConsumer = await realpath(consumer);
for (const name of ["protocol", "core", "sdk", "cli", "adapter-vercel"]) {
  const installed = await realpath(join(consumer, "node_modules/@agentest", name));
  const withinConsumer = relative(canonicalConsumer, installed);
  assert(
    withinConsumer !== ".." && !withinConsumer.startsWith(`..${sep}`) && !isAbsolute(withinConsumer),
    "Installed package resolves inside clean consumer",
  );
  const manifest = JSON.parse(await readFile(join(installed, "package.json"), "utf8"));
  assert(!JSON.stringify(manifest.dependencies ?? {}).includes("workspace:"), "Pack replaces workspace references");
}
await cp(join(root, "examples"), join(consumer, "examples"), {
  recursive: true,
});
await cp(join(root, "fixtures"), join(consumer, "fixtures"), {
  recursive: true,
});
for (const folder of ["support", "coding", "devops", "rag", "coordinator"])
  for (const file of ["agent.mjs", "scenario.mjs", "evaluator.mjs"]) {
    const path = join(consumer, "examples", folder, file);
    try {
      const source = (await readFile(path, "utf8")).replaceAll("../../packages/sdk/dist/index.js", "@agentest/sdk");
      assert(!source.includes("../../packages/"), "Consumer uses installed packages");
      await writeFile(
        path,
        source.replaceAll("../../packages/sdk/dist/index.js", "@agentest/sdk"),
      );
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
await runBuiltAcceptanceSuite({
  base: consumer,
  bin: join(consumer, "node_modules/@agentest/cli/dist/bin.js"),
});
console.log(
  `Packed acceptance passed: five archives installed offline, seven scenarios, consumer ${consumer}`,
);
