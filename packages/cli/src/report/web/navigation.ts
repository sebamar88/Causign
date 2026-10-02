import type {Trace} from '@causign/protocol';
interface EvidencePage {trace?:Pick<Trace,'events'>;timeline:{totalPages:number};}
export async function findEvidencePage(messageId:string,currentPage:number,detail:EvidencePage,loadPage:(page:number)=>Promise<EvidencePage>,isCurrent:()=>boolean):Promise<number|null>{
 for(let page=0;page<detail.timeline.totalPages;page++){
  if(!isCurrent())return null;
  const value=page===currentPage?detail:await loadPage(page);
  if(!isCurrent())return null;
  if(value.trace?.events.some(event=>event.message.id===messageId))return page;
 }
 return null;
}
