// Generated from the normative JSON Schemas. Do not edit.

export namespace ScenarioContracts {
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "JsonValue".
 */
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "StaticResponse".
 */
export type StaticResponse =
  | {
      kind: "result";
      value: JsonValue1;
    }
  | {
      kind: "error";
      value: JsonValue1;
    };
export type JsonValue1 =
  | null
  | boolean
  | number
  | string
  | JsonValue1[]
  | {
      [k: string]: JsonValue1;
    };
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "AssertionDefinition".
 */
export type AssertionDefinition =
  | {
      id: string;
      type: "tool.requested";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.executed";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.completed";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.mocked";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.blocked";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.requested";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.granted";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.rejected";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "output.equal";
      parameters: {
        value: JsonValue1;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "output.satisfies";
      parameters: {
        evaluator: string;
        criteria: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "run.latencyLessThan";
      parameters: {
        milliseconds: number;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "run.costLessThan";
      parameters: {
        amount: number;
        currency: "USD";
      };
      negated: boolean;
      requirements: string[];
    };

export interface ScenarioDefinition {
  schemaVersion: "1";
  id: string;
  name: string;
  agent: string;
  input: JsonValue;
  mocks: ToolMock[];
  approvalDecisions?: ApprovalDecision[];
  assertions: AssertionDefinition[];
  requirements: string[];
  timeoutMs: number;
  skipReason?: string;
  metadata?: {
    [k: string]: JsonValue1;
  };
}
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "ToolMock".
 */
export interface ToolMock {
  type: "tool";
  name: string;
  response: StaticResponse;
}
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "ApprovalDecision".
 */
export interface ApprovalDecision {
  decision: "grant" | "reject";
  input?: JsonValue1;
}
/**
 * This interface was referenced by `ScenarioDefinition`'s JSON-Schema
 * via the `definition` "ExecutionLimits".
 */
export interface ExecutionLimits {
  handshakeTimeoutMs?: number;
  scenarioTimeoutMs: number;
  interceptionTimeoutMs?: number;
  maxFrameBytes?: number;
  maxStderrBytes?: number;
  maxTraceBytes?: number;
  maxMessages?: number;
  maxBufferedBytes?: number;
  terminationGraceMs?: number;
}
}
export type ScenarioDefinition = ScenarioContracts.ScenarioDefinition;
export type JsonValue = ScenarioContracts.JsonValue;
export type StaticResponse = ScenarioContracts.StaticResponse;
export type ToolMock = ScenarioContracts.ToolMock;
export type AssertionDefinition = ScenarioContracts.AssertionDefinition;
export type ExecutionLimits = ScenarioContracts.ExecutionLimits;
export type ApprovalDecision = ScenarioContracts.ApprovalDecision;

export namespace ConfigContracts {
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };

export interface CausignConfig {
  schemaVersion: "1";
  agents: {
    [k: string]: AgentReference;
  };
  evaluators: {
    [k: string]: EvaluatorConfiguration;
  };
  metadata?: {
    [k: string]: JsonValue;
  };
}
/**
 * This interface was referenced by `CausignConfig`'s JSON-Schema
 * via the `definition` "AgentReference".
 */
export interface AgentReference {
  command: string;
  args: string[];
  cwd?: string;
  env?: {
    [k: string]: string;
  };
  metadata?: {
    [k: string]: JsonValue;
  };
}
/**
 * This interface was referenced by `CausignConfig`'s JSON-Schema
 * via the `definition` "EvaluatorConfiguration".
 */
export interface EvaluatorConfiguration {
  module: string;
  options?: JsonValue;
  provider?: string;
  model?: string;
  metadata?: {
    [k: string]: JsonValue;
  };
}
}
export type CausignConfig = ConfigContracts.CausignConfig;
export type AgentReference = ConfigContracts.AgentReference;
export type EvaluatorConfiguration = ConfigContracts.EvaluatorConfiguration;

export namespace PlanContracts {
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };
export type StaticResponse =
  | {
      kind: "result";
      value: JsonValue;
    }
  | {
      kind: "error";
      value: JsonValue;
    };
export type AssertionDefinition =
  | {
      id: string;
      type: "tool.requested";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.executed";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.completed";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.mocked";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "tool.blocked";
      parameters: {
        name: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.requested";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.granted";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "approval.rejected";
      parameters: {};
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "output.equal";
      parameters: {
        value: JsonValue;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "output.satisfies";
      parameters: {
        evaluator: string;
        criteria: string;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "run.latencyLessThan";
      parameters: {
        milliseconds: number;
      };
      negated: boolean;
      requirements: string[];
    }
  | {
      id: string;
      type: "run.costLessThan";
      parameters: {
        amount: number;
        currency: "USD";
      };
      negated: boolean;
      requirements: string[];
    };

export interface RunPlan {
  id: string;
  scenarioId: string;
  agent: AgentReference;
  protocol: "causign/1";
  capabilities: string[];
  input: JsonValue;
  requirements: string[];
  interceptions: ToolMock[];
  approvalDecisions: ApprovalDecision[];
  assertions: AssertionDefinition[];
  limits: ExecutionLimits;
  metadata?: {
    [k: string]: JsonValue;
  };
}
export interface AgentReference {
  command: string;
  args: string[];
  cwd?: string;
  env?: {
    [k: string]: string;
  };
  metadata?: {
    [k: string]: JsonValue;
  };
}
export interface ToolMock {
  type: "tool";
  name: string;
  response: StaticResponse;
}
export interface ApprovalDecision {
  decision: "grant" | "reject";
  input?: JsonValue;
}
export interface ExecutionLimits {
  handshakeTimeoutMs?: number;
  scenarioTimeoutMs: number;
  interceptionTimeoutMs?: number;
  maxFrameBytes?: number;
  maxStderrBytes?: number;
  maxTraceBytes?: number;
  maxMessages?: number;
  maxBufferedBytes?: number;
  terminationGraceMs?: number;
}
}
export type RunPlan = PlanContracts.RunPlan;

export namespace ProtocolContracts {
export type ProtocolMessage =
  | Hello
  | AdapterReady
  | Configure
  | AdapterConfigured
  | RunStart
  | RunStarted
  | RunCancel
  | RunCancelled
  | RunCompleted
  | RunFailed
  | RunErrored
  | ToolRequested
  | ToolProceed
  | ToolMockCommand
  | ToolReject
  | ToolStarted
  | ToolCompleted
  | ToolFailed
  | ToolRejected
  | ApprovalRequested
  | ApprovalResolve
  | ApprovalCompleted
  | ModelStarted
  | ModelCompleted
  | ModelFailed
  | MessageCreated;
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };
export type StaticResponse =
  | {
      kind: "result";
      value: JsonValue;
    }
  | {
      kind: "error";
      value: JsonValue;
    };

export interface Hello {
  protocol: "causign/1";
  id: string;
  type: "hello";
  timestamp: string;
  payload: {
    supportedVersions: string[];
  };
}
export interface AdapterReady {
  protocol: "causign/1";
  id: string;
  type: "adapter.ready";
  timestamp: string;
  payload: {
    adapter: {
      name: string;
      version: string;
    };
    supportedVersions: string[];
    capabilities: string[];
  };
  correlationId: string;
}
export interface Configure {
  protocol: "causign/1";
  id: string;
  type: "configure";
  timestamp: string;
  payload: {
    protocol: "causign/1";
    metadata?: {
      [k: string]: JsonValue;
    };
  };
}
export interface AdapterConfigured {
  protocol: "causign/1";
  id: string;
  type: "adapter.configured";
  timestamp: string;
  payload: {};
  correlationId: string;
}
export interface RunStart {
  protocol: "causign/1";
  id: string;
  type: "run.start";
  timestamp: string;
  payload: {
    input: JsonValue;
    interceptions: ToolMock[];
    approvalDecisions: ApprovalDecision[];
    limits: ExecutionLimits;
  };
  runId: string;
}
export interface ToolMock {
  type: "tool";
  name: string;
  response: StaticResponse;
}
export interface ApprovalDecision {
  decision: "grant" | "reject";
  input?: JsonValue;
}
export interface ExecutionLimits {
  handshakeTimeoutMs?: number;
  scenarioTimeoutMs: number;
  interceptionTimeoutMs?: number;
  maxFrameBytes?: number;
  maxStderrBytes?: number;
  maxTraceBytes?: number;
  maxMessages?: number;
  maxBufferedBytes?: number;
  terminationGraceMs?: number;
}
export interface RunStarted {
  protocol: "causign/1";
  id: string;
  type: "run.started";
  timestamp: string;
  payload: {};
  runId: string;
  correlationId: string;
}
export interface RunCancel {
  protocol: "causign/1";
  id: string;
  type: "run.cancel";
  timestamp: string;
  payload: {
    reason: string;
  };
  runId: string;
}
export interface RunCancelled {
  protocol: "causign/1";
  id: string;
  type: "run.cancelled";
  timestamp: string;
  payload: {
    reason: string;
  };
  runId: string;
  correlationId?: string;
}
export interface RunCompleted {
  protocol: "causign/1";
  id: string;
  type: "run.completed";
  timestamp: string;
  payload: {
    output?: JsonValue;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
export interface Usage {
  cost?: Cost;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  metadata?: {
    [k: string]: JsonValue;
  };
}
export interface Cost {
  amount: number;
  currency: string;
}
export interface RunFailed {
  protocol: "causign/1";
  id: string;
  type: "run.failed";
  timestamp: string;
  payload: {
    error: ProtocolError;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
export interface ProtocolError {
  message: string;
  code?: string;
  details?: JsonValue;
}
export interface RunErrored {
  protocol: "causign/1";
  id: string;
  type: "run.errored";
  timestamp: string;
  payload: {
    error: ProtocolError;
  };
  runId: string;
}
export interface ToolRequested {
  protocol: "causign/1";
  id: string;
  type: "tool.requested";
  timestamp: string;
  payload: {
    name: string;
    input: JsonValue;
    intercepted: boolean;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ToolProceed {
  protocol: "causign/1";
  id: string;
  type: "tool.proceed";
  timestamp: string;
  payload: {};
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolMockCommand {
  protocol: "causign/1";
  id: string;
  type: "tool.mock";
  timestamp: string;
  payload: {
    response: StaticResponse;
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolReject {
  protocol: "causign/1";
  id: string;
  type: "tool.reject";
  timestamp: string;
  payload: {
    source: "causign" | "adapter" | "agent" | "policy" | "external";
    reason: string;
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolStarted {
  protocol: "causign/1";
  id: string;
  type: "tool.started";
  timestamp: string;
  payload: {
    name: string;
  };
  runId: string;
  operationId: string;
}
export interface ToolCompleted {
  protocol: "causign/1";
  id: string;
  type: "tool.completed";
  timestamp: string;
  payload: {
    name: string;
    output: JsonValue;
    execution: "real" | "mock";
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ToolFailed {
  protocol: "causign/1";
  id: string;
  type: "tool.failed";
  timestamp: string;
  payload: {
    name: string;
    error: ProtocolError;
    execution: "real" | "mock";
  };
  runId: string;
  operationId: string;
}
export interface ToolRejected {
  protocol: "causign/1";
  id: string;
  type: "tool.rejected";
  timestamp: string;
  payload: {
    name: string;
    source: "causign" | "adapter" | "agent" | "policy" | "external";
    reason: string;
  };
  runId: string;
  operationId: string;
}
export interface ApprovalRequested {
  protocol: "causign/1";
  id: string;
  type: "approval.requested";
  timestamp: string;
  payload: {
    input: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ApprovalResolve {
  protocol: "causign/1";
  id: string;
  type: "approval.resolve";
  timestamp: string;
  payload: {
    decision: "grant" | "reject";
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ApprovalCompleted {
  protocol: "causign/1";
  id: string;
  type: "approval.completed";
  timestamp: string;
  payload: {
    decision: "grant" | "reject";
  };
  runId: string;
  operationId: string;
}
export interface ModelStarted {
  protocol: "causign/1";
  id: string;
  type: "model.started";
  timestamp: string;
  payload: {
    model: string;
    provider?: string;
    input?: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ModelCompleted {
  protocol: "causign/1";
  id: string;
  type: "model.completed";
  timestamp: string;
  payload: {
    output: JsonValue;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ModelFailed {
  protocol: "causign/1";
  id: string;
  type: "model.failed";
  timestamp: string;
  payload: {
    error: ProtocolError;
  };
  runId: string;
  operationId: string;
}
export interface MessageCreated {
  protocol: "causign/1";
  id: string;
  type: "message.created";
  timestamp: string;
  payload: {
    role: "system" | "user" | "assistant" | "tool";
    content: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
}
export type ProtocolMessage = ProtocolContracts.ProtocolMessage;
export type ProtocolError = ProtocolContracts.ProtocolError;
export type Cost = ProtocolContracts.Cost;
export type Usage = ProtocolContracts.Usage;
export type Hello = ProtocolContracts.Hello;
export type AdapterReady = ProtocolContracts.AdapterReady;
export type Configure = ProtocolContracts.Configure;
export type AdapterConfigured = ProtocolContracts.AdapterConfigured;
export type RunStart = ProtocolContracts.RunStart;
export type RunStarted = ProtocolContracts.RunStarted;
export type RunCancel = ProtocolContracts.RunCancel;
export type RunCancelled = ProtocolContracts.RunCancelled;
export type RunCompleted = ProtocolContracts.RunCompleted;
export type RunFailed = ProtocolContracts.RunFailed;
export type RunErrored = ProtocolContracts.RunErrored;
export type ToolRequested = ProtocolContracts.ToolRequested;
export type ToolProceed = ProtocolContracts.ToolProceed;
export type ToolMockCommand = ProtocolContracts.ToolMockCommand;
export type ToolReject = ProtocolContracts.ToolReject;
export type ToolStarted = ProtocolContracts.ToolStarted;
export type ToolCompleted = ProtocolContracts.ToolCompleted;
export type ToolFailed = ProtocolContracts.ToolFailed;
export type ToolRejected = ProtocolContracts.ToolRejected;
export type ApprovalRequested = ProtocolContracts.ApprovalRequested;
export type ApprovalResolve = ProtocolContracts.ApprovalResolve;
export type ApprovalCompleted = ProtocolContracts.ApprovalCompleted;
export type ModelStarted = ProtocolContracts.ModelStarted;
export type ModelCompleted = ProtocolContracts.ModelCompleted;
export type ModelFailed = ProtocolContracts.ModelFailed;
export type MessageCreated = ProtocolContracts.MessageCreated;

export namespace TraceContracts {
export type ProtocolMessage =
  | Hello
  | AdapterReady
  | Configure
  | AdapterConfigured
  | RunStart
  | RunStarted
  | RunCancel
  | RunCancelled
  | RunCompleted
  | RunFailed
  | RunErrored
  | ToolRequested
  | ToolProceed
  | ToolMockCommand
  | ToolReject
  | ToolStarted
  | ToolCompleted
  | ToolFailed
  | ToolRejected
  | ApprovalRequested
  | ApprovalResolve
  | ApprovalCompleted
  | ModelStarted
  | ModelCompleted
  | ModelFailed
  | MessageCreated;
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };
export type StaticResponse =
  | {
      kind: "result";
      value: JsonValue;
    }
  | {
      kind: "error";
      value: JsonValue;
    };

export interface Trace {
  schemaVersion: "1";
  id: string;
  runId: string;
  planId: string;
  events: TraceEvent[];
  diagnostics: Diagnostic[];
  terminal?: TraceTerminal;
  completeness: "complete" | "incomplete";
  metadata?: {
    [k: string]: JsonValue;
  };
}
/**
 * This interface was referenced by `Trace`'s JSON-Schema
 * via the `definition` "TraceEvent".
 */
export interface TraceEvent {
  receiveSequence: number;
  message: ProtocolMessage;
  source?: "adapter" | "runner";
}
export interface Hello {
  protocol: "causign/1";
  id: string;
  type: "hello";
  timestamp: string;
  payload: {
    supportedVersions: string[];
  };
}
export interface AdapterReady {
  protocol: "causign/1";
  id: string;
  type: "adapter.ready";
  timestamp: string;
  payload: {
    adapter: {
      name: string;
      version: string;
    };
    supportedVersions: string[];
    capabilities: string[];
  };
  correlationId: string;
}
export interface Configure {
  protocol: "causign/1";
  id: string;
  type: "configure";
  timestamp: string;
  payload: {
    protocol: "causign/1";
    metadata?: {
      [k: string]: JsonValue;
    };
  };
}
export interface AdapterConfigured {
  protocol: "causign/1";
  id: string;
  type: "adapter.configured";
  timestamp: string;
  payload: {};
  correlationId: string;
}
export interface RunStart {
  protocol: "causign/1";
  id: string;
  type: "run.start";
  timestamp: string;
  payload: {
    input: JsonValue;
    interceptions: ToolMock[];
    approvalDecisions: ApprovalDecision[];
    limits: ExecutionLimits;
  };
  runId: string;
}
export interface ToolMock {
  type: "tool";
  name: string;
  response: StaticResponse;
}
export interface ApprovalDecision {
  decision: "grant" | "reject";
  input?: JsonValue;
}
export interface ExecutionLimits {
  handshakeTimeoutMs?: number;
  scenarioTimeoutMs: number;
  interceptionTimeoutMs?: number;
  maxFrameBytes?: number;
  maxStderrBytes?: number;
  maxTraceBytes?: number;
  maxMessages?: number;
  maxBufferedBytes?: number;
  terminationGraceMs?: number;
}
export interface RunStarted {
  protocol: "causign/1";
  id: string;
  type: "run.started";
  timestamp: string;
  payload: {};
  runId: string;
  correlationId: string;
}
export interface RunCancel {
  protocol: "causign/1";
  id: string;
  type: "run.cancel";
  timestamp: string;
  payload: {
    reason: string;
  };
  runId: string;
}
export interface RunCancelled {
  protocol: "causign/1";
  id: string;
  type: "run.cancelled";
  timestamp: string;
  payload: {
    reason: string;
  };
  runId: string;
  correlationId?: string;
}
export interface RunCompleted {
  protocol: "causign/1";
  id: string;
  type: "run.completed";
  timestamp: string;
  payload: {
    output?: JsonValue;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
export interface Usage {
  cost?: Cost;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  metadata?: {
    [k: string]: JsonValue;
  };
}
export interface Cost {
  amount: number;
  currency: string;
}
export interface RunFailed {
  protocol: "causign/1";
  id: string;
  type: "run.failed";
  timestamp: string;
  payload: {
    error: ProtocolError;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
export interface ProtocolError {
  message: string;
  code?: string;
  details?: JsonValue;
}
export interface RunErrored {
  protocol: "causign/1";
  id: string;
  type: "run.errored";
  timestamp: string;
  payload: {
    error: ProtocolError;
  };
  runId: string;
}
export interface ToolRequested {
  protocol: "causign/1";
  id: string;
  type: "tool.requested";
  timestamp: string;
  payload: {
    name: string;
    input: JsonValue;
    intercepted: boolean;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ToolProceed {
  protocol: "causign/1";
  id: string;
  type: "tool.proceed";
  timestamp: string;
  payload: {};
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolMockCommand {
  protocol: "causign/1";
  id: string;
  type: "tool.mock";
  timestamp: string;
  payload: {
    response: StaticResponse;
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolReject {
  protocol: "causign/1";
  id: string;
  type: "tool.reject";
  timestamp: string;
  payload: {
    source: "causign" | "adapter" | "agent" | "policy" | "external";
    reason: string;
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ToolStarted {
  protocol: "causign/1";
  id: string;
  type: "tool.started";
  timestamp: string;
  payload: {
    name: string;
  };
  runId: string;
  operationId: string;
}
export interface ToolCompleted {
  protocol: "causign/1";
  id: string;
  type: "tool.completed";
  timestamp: string;
  payload: {
    name: string;
    output: JsonValue;
    execution: "real" | "mock";
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ToolFailed {
  protocol: "causign/1";
  id: string;
  type: "tool.failed";
  timestamp: string;
  payload: {
    name: string;
    error: ProtocolError;
    execution: "real" | "mock";
  };
  runId: string;
  operationId: string;
}
export interface ToolRejected {
  protocol: "causign/1";
  id: string;
  type: "tool.rejected";
  timestamp: string;
  payload: {
    name: string;
    source: "causign" | "adapter" | "agent" | "policy" | "external";
    reason: string;
  };
  runId: string;
  operationId: string;
}
export interface ApprovalRequested {
  protocol: "causign/1";
  id: string;
  type: "approval.requested";
  timestamp: string;
  payload: {
    input: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ApprovalResolve {
  protocol: "causign/1";
  id: string;
  type: "approval.resolve";
  timestamp: string;
  payload: {
    decision: "grant" | "reject";
  };
  runId: string;
  operationId: string;
  correlationId: string;
}
export interface ApprovalCompleted {
  protocol: "causign/1";
  id: string;
  type: "approval.completed";
  timestamp: string;
  payload: {
    decision: "grant" | "reject";
  };
  runId: string;
  operationId: string;
}
export interface ModelStarted {
  protocol: "causign/1";
  id: string;
  type: "model.started";
  timestamp: string;
  payload: {
    model: string;
    provider?: string;
    input?: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ModelCompleted {
  protocol: "causign/1";
  id: string;
  type: "model.completed";
  timestamp: string;
  payload: {
    output: JsonValue;
    usage?: Usage;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
  operationId: string;
}
export interface ModelFailed {
  protocol: "causign/1";
  id: string;
  type: "model.failed";
  timestamp: string;
  payload: {
    error: ProtocolError;
  };
  runId: string;
  operationId: string;
}
export interface MessageCreated {
  protocol: "causign/1";
  id: string;
  type: "message.created";
  timestamp: string;
  payload: {
    role: "system" | "user" | "assistant" | "tool";
    content: JsonValue;
    metadata?: {
      [k: string]: JsonValue;
    };
  };
  runId: string;
}
/**
 * This interface was referenced by `Trace`'s JSON-Schema
 * via the `definition` "Diagnostic".
 */
export interface Diagnostic {
  kind: string;
  message: string;
  receiveSequence?: number;
  rawFrame?: string;
  truncated?: boolean;
  messageId?: string;
  operationId?: string;
  metadata?: {
    [k: string]: JsonValue;
  };
}
/**
 * This interface was referenced by `Trace`'s JSON-Schema
 * via the `definition` "TraceTerminal".
 */
export interface TraceTerminal {
  type: "run.completed" | "run.failed" | "run.errored" | "run.cancelled";
  source: "adapter" | "runner";
  messageId: string;
}
}
export type Trace = TraceContracts.Trace;
export type Diagnostic = TraceContracts.Diagnostic;
export type TraceEvent = TraceContracts.TraceEvent;
export type TraceTerminal = TraceContracts.TraceTerminal;

export namespace ResultContracts {
/**
 * This interface was referenced by `ScenarioResult`'s JSON-Schema
 * via the `definition` "EvidenceReference".
 */
export type EvidenceReference =
  | {
      kind: "message";
      messageId: string;
      operationId?: string;
    }
  | {
      kind: "metric";
      metric: "executionLatencyMs" | "cost";
      value: number;
      currency?: string;
    }
  | {
      kind: "evaluator";
      evaluatorId: string;
      configHash: string;
      provider?: string;
      model?: string;
      score?: number;
    };
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | {
      [k: string]: JsonValue;
    };

export interface ScenarioResult {
  schemaVersion: "1";
  scenarioId: string;
  planId?: string;
  runId?: string;
  status: "PASS" | "FAIL" | "ERROR" | "INCOMPATIBLE" | "SKIP";
  assertions: AssertionResult[];
  diagnostics: Diagnostic[];
  traceId?: string;
  executionDurationMs?: number;
  missingCapabilities?: string[];
  metadata?: {
    [k: string]: JsonValue;
  };
}
/**
 * This interface was referenced by `ScenarioResult`'s JSON-Schema
 * via the `definition` "AssertionResult".
 */
export interface AssertionResult {
  id: string;
  status: "PASS" | "FAIL" | "ERROR" | "NOT_EVALUATED";
  expected: string;
  observed: string;
  reason: string;
  evidence: EvidenceReference[];
}
export interface Diagnostic {
  kind: string;
  message: string;
  receiveSequence?: number;
  rawFrame?: string;
  truncated?: boolean;
  messageId?: string;
  operationId?: string;
  metadata?: {
    [k: string]: JsonValue;
  };
}
}
export type ScenarioResult = ResultContracts.ScenarioResult;
export type EvidenceReference = ResultContracts.EvidenceReference;
export type AssertionResult = ResultContracts.AssertionResult;
