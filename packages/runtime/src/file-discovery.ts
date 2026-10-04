import type {
  AgentCandidate,
  Diagnostic,
  DiscoveryReport,
  SourceFile,
} from "./types.js";
/** Collect ordered file results; provider callbacks own parsing and error conversion. */
export function collectFileDiscovery(
  files: readonly SourceFile[],
  inspect: (file: SourceFile) => {
    candidates: AgentCandidate[];
    diagnostics: Diagnostic[];
  },
): DiscoveryReport {
  const candidates: AgentCandidate[] = [],
    diagnostics: Diagnostic[] = [];
  for (const file of files) {
    const result = inspect(file);
    candidates.push(...result.candidates);
    diagnostics.push(...result.diagnostics);
  }
  return {
    candidates,
    diagnostics,
    complete: !diagnostics.some((item) => item.severity === "error"),
  };
}
