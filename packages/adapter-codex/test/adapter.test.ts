import {afterEach,expect,it} from 'vitest';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRegistry,discoverAgents,type Selection} from '../../runtime/src/index.js';
import plugin,{translateCodexResult,probeCodex} from '../src/index.js';
const roots:string[]=[];
afterEach(async()=>{await Promise.all(roots.splice(0).map(path=>rm(path,{recursive:true,force:true})));});
async function setup(){const root=await mkdtemp(join(tmpdir(),'causign-codex-'));roots.push(root);return root;}
it('discovers versioned native profile files without treating AGENTS.md as a runnable agent',async()=>{
 const root=await setup();await writeFile(join(root,'reviewer.config.toml'),'model = "reference-model"\nmodel_provider = "example"');await writeFile(join(root,'AGENTS.md'),'Context');
 const result=await discoverAgents(createRegistry([plugin]),{kind:'file',path:root});expect(result.candidates).toHaveLength(1);expect(result.candidates[0]).toMatchObject({nativeSelector:'reviewer',runtimeId:'codex',metadata:{model:'reference-model',provider:'example'}});
});
it('reports malformed profile files explicitly',async()=>{
 const root=await setup();await writeFile(join(root,'bad.config.toml'),'model = [');const result=await discoverAgents(createRegistry([plugin]),{kind:'file',path:root});expect(result.complete).toBe(false);expect(result.candidates).toEqual([]);
});
it('reports legacy embedded profiles as unsupported definitions',async()=>{
 const root=await setup();await writeFile(join(root,'config.toml'),'[profiles.old]\nmodel = "example"');const result=await discoverAgents(createRegistry([plugin]),{kind:'file',path:root});expect(result.candidates).toEqual([]);expect(result.diagnostics.some(item=>item.code==='codex.legacy-profile')).toBe(true);
});
it('refuses output execution even when Codex is installed, without pretending read-only denies tools',async()=>{
 const root=await setup();await writeFile(join(root,'reviewer.config.toml'),'model = "example"');const candidate=(await discoverAgents(createRegistry([plugin]),{kind:'file',path:root})).candidates[0];
 const selection:Selection={candidate,adapterId:'causign/codex-output',mode:'output',target:{kind:'native',command:process.execPath,args:[resolve('fixtures/native-runtimes/codex.mjs')],cwd:root}};
 const probe=await probeCodex(selection.target);expect(probe.available).toBe(true);expect(probe.capabilities).toEqual([]);expect(probe.diagnostics.some(item=>item.code==='codex.profile-unsupported')).toBe(true);
 await expect(plugin.adapters[0].createLaunch(selection)).rejects.toThrow(/tool/i);
});
it('reports unavailable executable and unsupported version',async()=>{
 const root=await setup();expect((await probeCodex({kind:'native',command:'missing-causign-codex',cwd:root})).available).toBe(false);
 const probe=await probeCodex({kind:'native',command:process.execPath,cwd:root});expect(probe.diagnostics.some(item=>item.code==='runtime.version')).toBe(true);
});
it('translates only a completed turn with final text and successful native exit',()=>{
 const stdout=[{type:'thread.started',thread_id:'t'},{type:'turn.started'},{type:'item.completed',item:{id:'i',type:'agent_message',text:'hello'}},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}].map(item=>JSON.stringify(item)).join('\n');
 expect(translateCodexResult({stdout,stderr:'',exitCode:0,signal:null})).toEqual({text:'hello'});
 for(const invalid of [stdout+'\n'+JSON.stringify({type:'turn.failed',error:{message:'oops'}}),'bad',JSON.stringify({type:'turn.completed'}),stdout+'\n'+JSON.stringify({type:'unexpected'})])expect(()=>translateCodexResult({stdout:invalid,stderr:'',exitCode:0,signal:null})).toThrow();
 expect(()=>translateCodexResult({stdout,stderr:'',exitCode:1,signal:null})).toThrow(/exit/i);
});
