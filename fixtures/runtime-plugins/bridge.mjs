import {readFile} from 'node:fs/promises';
import {serveOutputBridge,verifyCandidateRevision} from '@causign/runtime';
const candidate=JSON.parse(process.argv[2]);
await serveOutputBridge({name:'example-framework',version:'1',async execute(input){
 if(input==='error')throw Error('Fixture native failure');
 await verifyCandidateRevision(candidate);const definition=JSON.parse(await readFile(candidate.source.path,'utf8'));
 return {text:definition.text};
}});
