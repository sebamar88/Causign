import { expect, it } from "vitest";
import { candidateId, type SourceFile } from "@causign/runtime";
import { claudeDiscoverer } from "../src/discover.js";
const file = (path: string, text: string): SourceFile => ({
  path,
  text,
  revision: `revision:${path}`,
});
const discover = (files: SourceFile[]) =>
  claudeDiscoverer.discover(
    { kind: "file", path: "/agents" },
    {
      files,
      signal: new AbortController().signal,
      limits: {
        maxFiles: 100,
        maxFileBytes: 10000,
        maxTotalBytes: 100000,
        timeoutMs: 1000,
      },
    },
  );
const candidate = (
  source: SourceFile,
  name: string,
  metadata: Record<string, unknown> = {},
) => ({
  id: candidateId("causign/claude-agents", source.path, name),
  discovererId: "causign/claude-agents",
  name,
  description: "Description",
  kind: "agent",
  nativeSelector: name,
  source: { kind: "file", path: source.path },
  revision: source.revision,
  runtimeId: "claude-code",
  metadata,
});
it("preserves exact partial results, ordering and provider-specific duplicate diagnostics", async () => {
  const first = file(
    "/agents/first.md",
    "---\nname: First\ndescription: Description\nmodel: sonnet\ncolor: red\n---\nPrompt",
  );
  const invalid = file("/agents/invalid.md", "---\nname: Missing\n---\nPrompt");
  const duplicate = file(
    "/other/duplicate.md",
    "---\nname: First\ndescription: Description\n---\nPrompt",
  );
  const last = file(
    "/agents/last.md",
    "---\nname: Last\ndescription: Description\nmodel: inherit\n---\nPrompt",
  );
  expect(
    await discover([
      first,
      invalid,
      file("/agents/AGENTS.md", "Instructions"),
      duplicate,
      last,
    ]),
  ).toEqual({
    candidates: [
      candidate(first, "First", { model: "sonnet" }),
      candidate(last, "Last"),
    ],
    diagnostics: [
      {
        code: "claude.metadata",
        message: "Metadata not used by output profile: color",
        source: first.path,
        severity: "warning",
      },
      {
        code: "claude.definition",
        message: "Invalid native agent name or description",
        source: invalid.path,
        severity: "error",
      },
      {
        code: "claude.duplicate",
        message: "Duplicate native selector: First",
        source: duplicate.path,
        severity: "error",
      },
    ],
    complete: false,
  });
});
it("keeps unknown-metadata warnings complete and resets selectors per invocation", async () => {
  const source = file(
    "/agents/first.md",
    "---\nname: First\ndescription: Description\ncolor: red\n---\nPrompt",
  );
  const expected = {
    candidates: [candidate(source, "First")],
    diagnostics: [
      {
        code: "claude.metadata",
        message: "Metadata not used by output profile: color",
        source: source.path,
        severity: "warning",
      },
    ],
    complete: true,
  };
  expect(await discover([source])).toEqual(expected);
  expect(await discover([source])).toEqual(expected);
});
