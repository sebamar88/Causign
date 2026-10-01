import {inspectScenario} from '@agentest/core';
import {validateScenarioCollection,type ScenarioDefinition,type AgentestConfig} from '@agentest/protocol';
export function inspectDefinitions(definitions:ScenarioDefinition[],config:AgentestConfig){validateScenarioCollection(definitions);return definitions.map(definition=>inspectScenario(definition,config));}
