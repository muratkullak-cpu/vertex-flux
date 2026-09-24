const https=require('node:https');
const dns=require('node:dns').promises;
const net=require('node:net');

const SUPABASE_URL='https://ujrgwowdxxazbjilstht.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY';

function publicAddress(address){
 if(net.isIP(address)===4){
  const [a,b,c]=address.split('.').map(Number);
  return a>=1&&a<224&&a!==10&&a!==127&&!(a===100&&b>=64&&b<=127)&&!(a===169&&b===254)&&!(a===172&&b>=16&&b<=31)&&!(a===192&&(b===168||b===0||b===88||b===0&&c===0))&&!(a===198&&b>=18&&b<=19);
 }
 if(net.isIP(address)===6)return /^[23][0-9a-f]{3}:/i.test(address);
 return false;
}
async function safeTarget(raw){
 let u;try{u=new URL(raw)}catch{return null}
 if(u.protocol!=='https:'||u.port&&u.port!=='443'||u.username||u.password||!u.hostname||net.isIP(u.hostname)||u.hostname==='localhost'||/\.(local|localhost|internal)$/.test(u.hostname))return null;
 const entries=await dns.lookup(u.hostname,{all:true});
 if(!entries.length||entries.some(entry=>!publicAddress(entry.address)))return null;
 return {url:u,address:entries[0].address};
}
function probe(target,method){return new Promise((resolve,reject)=>{
 const req=https.request({hostname:target.address,servername:target.url.hostname,path:target.url.pathname+target.url.search,port:443,method,headers:{host:target.url.host,'user-agent':'VERTEX-QR-Health/1.0',...(method==='GET'?{range:'bytes=0-0'}:{})},timeout:6000},response=>{const status=response.statusCode;response.destroy();resolve(status)});
 req.on('timeout',()=>req.destroy(new Error('timeout')));req.on('error',reject);req.end();
})}
function healthStatus(status){if(status>=200&&status<300)return 'reachable';if(status===404||status===410)return 'missing';return 'unknown'}

module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
 const id=String(req.query.id||'');if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({ok:false,error:'invalid_id'});
 const auth=req.headers.authorization||'';if(!auth.startsWith('Bearer '))return res.status(401).json({ok:false,error:'missing_session'});
 try{
  const headers={apikey:PUBLISHABLE_KEY,authorization:auth};
  const user=await fetch(SUPABASE_URL+'/auth/v1/user',{headers});
  if(!user.ok)return res.status(401).json({ok:false,error:'invalid_session'});
  const rowResponse=await fetch(SUPABASE_URL+'/rest/v1/qr_links?id=eq.'+encodeURIComponent(id)+'&select=target_url&limit=1',{headers});
  if(!rowResponse.ok)return res.status(502).json({ok:false,error:'qr_lookup_failed'});
  const rows=await rowResponse.json();if(!Array.isArray(rows)||!rows.length)return res.status(404).json({ok:false,error:'qr_not_found'});
  const target=await safeTarget(rows[0].target_url);
  if(!target)return res.status(200).json({ok:true,state:'unknown',reason:'unsafe_or_unresolved_target'});
  let code=await probe(target,'HEAD');
  if(code===405||code===501)code=await probe(target,'GET');
  return res.status(200).json({ok:true,state:healthStatus(code),status:code,checkedAt:new Date().toISOString()});
 }catch(e){return res.status(200).json({ok:true,state:'unknown',reason:e.message==='timeout'?'timeout':'connection_failed',checkedAt:new Date().toISOString()})}
};
module.exports._check={publicAddress,safeTarget,healthStatus};
