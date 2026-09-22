function cookie(req,name){const raw=req.headers.cookie||'';const item=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return item?decodeURIComponent(item.slice(name.length+1)):'';}
module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ok:false,error:'method_not_allowed'});
  const auth=req.headers.authorization||'';
  if(!auth.startsWith('Bearer ')) return res.status(401).json({ok:false,error:'missing_vertex_session'});
  const refresh=cookie(req,'vertex_google_handoff');
  if(!refresh) return res.status(400).json({ok:false,error:'oauth_handoff_expired'});
  const url='https://ujrgwowdxxazbjilstht.supabase.co/rest/v1/rpc/vertex_store_google_ads_refresh_token';
  const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json','apikey':'sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY','authorization':auth},body:JSON.stringify({p_refresh_token:refresh,p_manager_customer_id:'1383282213'})});
  const txt=await r.text();
  res.setHeader('Set-Cookie','vertex_google_handoff=; Path=/api/google/finalize; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  if(!r.ok) return res.status(r.status).json({ok:false,error:'vault_store_failed',detail:txt.slice(0,300)});
  return res.status(200).json({ok:true});
};
