import {expect,it} from 'vitest';
import {runNativeProcess} from '../src/index.js';
const launch=(code:string)=>({command:process.execPath,args:['-e',code],cwd:process.cwd()});
const options=()=>({signal:new AbortController().signal,maxOutputBytes:1024,timeoutMs:2000});
it('preserves Unicode literal arguments and captures successful completion',async()=>{
 const result=await runNativeProcess({command:process.execPath,args:['-e','process.stdout.write(process.argv[1])','á $() spaces'],cwd:process.cwd()},options());
 expect(result.stdout).toBe('á $() spaces');expect(result.exitCode).toBe(0);
});
it('does not discard a nonzero exit after output',async()=>{const result=await runNativeProcess(launch("process.stdout.write('done');process.exitCode=7"),options());expect(result.stdout).toBe('done');expect(result.exitCode).toBe(7);});
it('bounds aggregate stdout and stderr and terminates overflow',async()=>{await expect(runNativeProcess(launch("process.stdout.write('x'.repeat(2000))"),options())).rejects.toThrow(/limit/i);});
it('times out a stalled child',async()=>{await expect(runNativeProcess(launch('setInterval(()=>{},1000)'),{...options(),timeoutMs:30})).rejects.toThrow(/timeout/i);});
it('aborts native execution before spawn',async()=>{const controller=new AbortController();controller.abort();await expect(runNativeProcess(launch("throw Error('spawned')"),{...options(),signal:controller.signal})).rejects.toThrow(/cancel/i);});
it('reports missing executable and validates bounds',async()=>{await expect(runNativeProcess({command:'causign-executable-does-not-exist',args:[]},options())).rejects.toThrow();await expect(runNativeProcess(launch(''),{...options(),maxOutputBytes:0})).rejects.toThrow(/positive/i);});
