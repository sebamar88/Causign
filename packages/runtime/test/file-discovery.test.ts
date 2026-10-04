import { expect, it } from "vitest";
import { collectFileDiscovery } from "../src/file-discovery.js";
import type { AgentCandidate, Diagnostic, SourceFile } from "../src/types.js";
const files: readonly SourceFile[] = [
  { path: "first", text: "", revision: "r1" },
  { path: "ignored", text: "", revision: "r2" },
  { path: "last", text: "", revision: "r3" },
];
const candidate = (name: string): AgentCandidate => ({
  id: name,
  discovererId: "test",
  name,
  kind: "agent",
  source: { kind: "file", path: name },
  revision: "revision",
});
it("handles empty input without inspecting", () => {
  expect(
    collectFileDiscovery([], () => {
      throw new Error("unexpected inspection");
    }),
  ).toEqual({ candidates: [], diagnostics: [], complete: true });
});
it("visits ignored entries without producing results", () => {
  const visited: string[] = [];
  expect(
    collectFileDiscovery(files, (file) => {
      visited.push(file.path);
      return { candidates: [], diagnostics: [] };
    }),
  ).toEqual({ candidates: [], diagnostics: [], complete: true });
  expect(visited).toEqual(["first", "ignored", "last"]);
});
it("keeps warning-only reports complete", () => {
  const warning: Diagnostic = {
    code: "warning",
    message: "known limitation",
    severity: "warning",
    source: "first",
  };
  expect(
    collectFileDiscovery(files.slice(0, 1), () => ({
      candidates: [candidate("first")],
      diagnostics: [warning],
    })),
  ).toEqual({
    candidates: [candidate("first")],
    diagnostics: [warning],
    complete: true,
  });
});
it("preserves partial candidates and ordered diagnostics across mixed results", () => {
  const warning: Diagnostic = {
    code: "warning",
    message: "warning",
    severity: "warning",
  };
  const error: Diagnostic = {
    code: "error",
    message: "error",
    severity: "error",
  };
  expect(
    collectFileDiscovery(files, (file) =>
      file.path === "first"
        ? {
            candidates: [candidate("a"), candidate("b")],
            diagnostics: [warning],
          }
        : file.path === "ignored"
          ? { candidates: [], diagnostics: [error] }
          : { candidates: [candidate("c")], diagnostics: [] },
    ),
  ).toEqual({
    candidates: [candidate("a"), candidate("b"), candidate("c")],
    diagnostics: [warning, error],
    complete: false,
  });
});
it("propagates callback exceptions instead of reporting success", () => {
  const failure = new Error("inspection failed");
  const visited: string[] = [];
  expect(() =>
    collectFileDiscovery(files, (file) => {
      visited.push(file.path);
      if (file.path === "ignored") throw failure;
      return { candidates: [candidate("a")], diagnostics: [] };
    }),
  ).toThrow(failure);
  expect(visited).toEqual(["first", "ignored"]);
});
