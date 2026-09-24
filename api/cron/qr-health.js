const {safeTarget,healthStatus,probe}=require('../qr-check')._check;
const BASE='https://ujrgwowdxxazbjilstht.supabase.co/rest/v1';
const LIMIT=50;
async function request(path,options={}){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const response=await fetch(BASE+path,{...options,headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/json',...options.headers}});
 if(!response.ok)throw Error('database_'+response.status);
 return response.status===204?null:response.json();
}
async function inspect(url){
 try{const target=await safeTarget(url);if(!target)return {state:'unknown',status:null};let status=await probe(target,'HEAD');if(status===405||status===501)status=await probe(target,'GET');return {state:healthStatus(status),status}}
 catch{return {state:'unknown',status:null}}
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({error:'method_not_allowed'});
 if(!process.env.CRON_SECRET||!process.env.SUPABASE_SERVICE_ROLE_KEY)return res.status(503).json({error:'monitor_not_configured'});
 if(req.headers.authorization!=='Bearer '+process.env.CRON_SECRET)return res.status(401).json({error:'unauthorized'});
 try{
  let checked=0,missing=0,unknown=0;
  for(let offset=0;;offset+=LIMIT){
   const links=await request('/qr_links?select=id,target_url&active=eq.true&order=id.asc&limit='+LIMIT+'&offset='+offset);
   for(const link of links){
    const result=await inspect(link.target_url);
    const unchanged=await request('/qr_links?id=eq.'+encodeURIComponent(link.id)+'&target_url=eq.'+encodeURIComponent(link.target_url)+'&active=eq.true&select=id');
    if(!unchanged.length)continue;
    await request('/qr_health?on_conflict=qr_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({qr_id:link.id,target_url:link.target_url,state:result.state,http_status:result.status,checked_at:new Date().toISOString()})});
    checked++;if(result.state==='missing')missing++;if(result.state==='unknown')unknown++;
   }
   if(links.length<LIMIT)break;
  }
  return res.status(200).json({ok:true,checked,missing,unknown});
 }catch(e){console.error('QR cron failed',e);return res.status(500).json({error:'monitor_failed'})}
};
module.exports._test={inspect};
