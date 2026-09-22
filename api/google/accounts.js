const crypto = require('crypto');

function cookie(req,name){const raw=req.headers.cookie||'';const item=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return item?decodeURIComponent(item.slice(name.length+1)):'';}
function open(value,secret){
  const b=Buffer.from(value,'base64url'),iv=b.subarray(0,12),tag=b.subarray(12,28),data=b.subarray(28);
  const key=crypto.createHash('sha256').update(secret).digest(),d=crypto.createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(tag);
  return Buffer.concat([d.update(data),d.final()]).toString('utf8');
}
module.exports=async function handler(req,res){
  try{
    const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET;
    const sealed=cookie(req,'vertex_google_refresh');
    if(!clientId||!clientSecret) return res.status(500).json({connected:false,error:'oauth_env_missing'});
    if(!sealed) return res.status(401).json({connected:false,error:'not_connected'});
    const refresh=open(sealed,clientSecret);
    const body=new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:refresh,grant_type:'refresh_token'});
    const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
    const tok=await tr.json();
    if(!tr.ok) return res.status(401).json({connected:false,error:'refresh_failed'});
    const gr=await fetch('https://googleads.googleapis.com/v25/customers:listAccessibleCustomers',{headers:{Authorization:'Bearer '+tok.access_token,'Content-Type':'application/json'}});
    const data=await gr.json();
    return res.status(gr.ok?200:gr.status).json({connected:true,apiOk:gr.ok,managerCustomerId:'1383282213',customers:data.resourceNames||[],googleError:gr.ok?null:data.error||data});
  }catch(e){return res.status(500).json({connected:false,error:'server_error'});}
};
