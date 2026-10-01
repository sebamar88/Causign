import type {AssertionDefinition,ProtocolMessage} from '@agentest/protocol';
export function matchesApproval(assertion:AssertionDefinition,message:ProtocolMessage):boolean {
 if(assertion.type==='approval.requested')return message.type==='approval.requested';
 return message.type==='approval.completed'&&((assertion.type==='approval.granted'&&message.payload.decision==='grant')||(assertion.type==='approval.rejected'&&message.payload.decision==='reject'));
}
