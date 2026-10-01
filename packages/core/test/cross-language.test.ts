import {it,expect} from 'vitest';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {runScenario} from '../src/execute.js';
import {agentTest,expect as assertion} from '../../sdk/src/dsl.js';
const fallback='C:/Users/Sebastián Martinez/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe';
const python=process.env.AGENTEST_PYTHON??(process.platform==='win32'?fallback:'python3');
it('runs Python stdlib JSONL agent with intercepted static result',async()=>{
 if(process.platform==='win32'&&!existsSync(python))throw new Error('Python missing: set AGENTEST_PYTHON to an absolute Python 3 executable; acceptance cannot skip this test.');
 let trace:any;
 const result=await runScenario(agentTest('python mock',{agent:'python',input:null,mocks:{lookup:{result:{customer:'Ada'}}},timeoutMs:3000,assertions:[assertion.tool('lookup').toHaveBeenMocked(),assertion.tool('lookup').not.toHaveBeenExecuted(),assertion.output().toEqual({customer:'Ada'})]}),{schemaVersion:'1',agents:{python:{command:python,args:['-u',resolve('fixtures/python-agent.py')]}},evaluators:{}},{onTrace:t=>{trace=t;}});
 expect(result.status,JSON.stringify(result.diagnostics)).toBe('PASS');expect(trace.completeness).toBe('complete');
});
it('runs all five harmless domain examples through built workspace SDK',async()=>{
 for(const domain of ['support','coding','devops','rag','coordinator']){
  const module=await import(pathToFileURL(resolve(`examples/${domain}/scenario.mjs`)).href);
  const result=await runScenario(module.default,{schemaVersion:'1',agents:{[domain]:{command:process.execPath,args:[resolve(`examples/${domain}/agent.mjs`)]}},evaluators:domain==='rag'?{citations:{module:pathToFileURL(resolve('examples/rag/evaluator.mjs')).href}}:{} });
  expect(result.status,`${domain}: ${JSON.stringify(result.diagnostics)}`).toBe('PASS');
 }
},15000);
