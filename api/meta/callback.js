function cookie(req,name){const raw=req.headers.cookie||'';const item=raw.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return item?decodeURIComponent(item.slice(name.length+1)):'';}
module.exports=async function handler(req,res){
 const {code,state,error,error_description}=req.query||{};
 if(error)return res.status(400).send('Meta bağlantısı reddedildi: '+String(error_description||error));
 if(!code||!state||state!==cookie(req,'vertex_meta_state'))return res.status(400).send('Geçersiz OAuth isteği.');
 const appId=process.env.META_APP_ID, secret=process.env.META_APP_SECRET;
 if(!appId||!secret)return res.status(500).send('Meta OAuth ortam değişkenleri eksik.');
 const redirect='https://vertex-flux.vercel.app/api/meta/callback';
 const q=new URLSearchParams({client_id:appId,client_secret:secret,redirect_uri:redirect,code});
 const r=await fetch('https://graph.facebook.com/v26.0/oauth/access_token?'+q);
 const token=await r.json().catch(()=>({}));
 if(!r.ok||!token.access_token)return res.status(400).send('Meta token alınamadı: '+String(token.error?.message||'bilinmeyen hata'));
 const me=await fetch('https://graph.facebook.com/v26.0/me?fields=id&access_token='+encodeURIComponent(token.access_token));
 const md=await me.json().catch(()=>({}));
 res.setHeader('Set-Cookie',[
  'vertex_meta_state=; Path=/api/meta/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  `vertex_meta_handoff=${encodeURIComponent(token.access_token)}; Path=/api/meta/finalize; HttpOnly; Secure; SameSite=Strict; Max-Age=120`,
  `vertex_meta_uid=${encodeURIComponent(md.id||'')}; Path=/api/meta/finalize; HttpOnly; Secure; SameSite=Strict; Max-Age=120`
 ]);
 return res.redirect('/?meta=finalize');
};