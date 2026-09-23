const SUPA='https://ujrgwowdxxazbjilstht.supabase.co';
const KEY='sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY';
async function rpc(auth,name,body={}){
 const r=await fetch(SUPA+'/rest/v1/rpc/'+name,{method:'POST',headers:{'content-type':'application/json',apikey:KEY,authorization:auth},body:JSON.stringify(body)});
 const data=await r.json().catch(()=>null); if(!r.ok) throw Object.assign(new Error('vertex_rpc_failed'),{status:r.status,data}); return data;
}
module.exports=async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
 const auth=req.headers.authorization||''; if(!auth.startsWith('Bearer '))return res.status(401).json({ok:false,error:'missing_vertex_session'});
 try{
  const rows=await rpc(auth,'vertex_google_ads_proxy_payload');
  const cfg=rows&&rows[0]; if(!cfg?.refresh_token)return res.status(401).json({ok:false,error:'google_not_connected'});
  const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET,developerToken=process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if(!clientId||!clientSecret)return res.status(500).json({ok:false,error:'google_oauth_env_missing'});
  if(!developerToken)return res.status(500).json({ok:false,error:'google_ads_developer_token_missing'});
  const tr=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,refresh_token:cfg.refresh_token,grant_type:'refresh_token'})});
  const tok=await tr.json(); if(!tr.ok)return res.status(401).json({ok:false,error:'google_refresh_failed'});
  const gr=await fetch('https://googleads.googleapis.com/v25/customers:listAccessibleCustomers',{headers:{authorization:'Bearer '+tok.access_token,'developer-token':developerToken}});
  const gd=await gr.json().catch(()=>({}));
  if(!gr.ok)return res.status(gr.status).json({ok:false,error:'google_ads_api_error',google:gd.error||gd});
  const customers=(gd.resourceNames||[]).map(x=>String(x).replace('customers/',''));
  return res.status(200).json({ok:true,managerCustomerId:cfg.manager_customer_id,customers});
 }catch(e){return res.status(e.status||500).json({ok:false,error:'server_error',detail:e.data||undefined});}
};
