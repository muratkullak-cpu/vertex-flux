function cookie(req,name){const raw=req.headers.cookie||'';const item=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return item?decodeURIComponent(item.slice(name.length+1)):'';}
module.exports=async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
 const auth=req.headers.authorization||'';
 if(!auth.startsWith('Bearer '))return res.status(401).json({ok:false,error:'missing_vertex_session'});
 const statusUrl='https://ujrgwowdxxazbjilstht.supabase.co/rest/v1/rpc/vertex_meta_connection_status';
 const sr=await fetch(statusUrl,{method:'POST',headers:{'content-type':'application/json','apikey':'sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY','authorization':auth},body:'{}'});
 const st=await sr.json().catch(()=>null);
 if(!sr.ok)return res.status(sr.status).json({ok:false,error:'meta_status_failed'});
 const row=Array.isArray(st)?st[0]:st;
 return res.status(200).json({ok:true,connected:!!row?.connected,metaUserId:row?.meta_user_id||null,connectedAt:row?.connected_at||null,updatedAt:row?.updated_at||null});
};