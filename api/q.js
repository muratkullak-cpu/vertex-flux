const SUPABASE_URL='https://ujrgwowdxxazbjilstht.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY';

module.exports=async function handler(req,res){
 if(req.method!=='GET')return res.status(405).end();
 const slug=String(req.query.slug||'');
 if(!/^[a-z0-9-]{5,48}$/.test(slug))return res.status(404).send('QR bağlantısı bulunamadı.');
 try{
  const response=await fetch(SUPABASE_URL+'/rest/v1/rpc/vertex_resolve_qr',{
   method:'POST',headers:{apikey:PUBLISHABLE_KEY,'content-type':'application/json'},body:JSON.stringify({p_slug:slug})
  });
  if(!response.ok)return res.status(503).send('Bağlantı şu anda açılamıyor.');
  const target=await response.json();
  if(typeof target!=='string'||!/^https:\/\/[^\s]+$/i.test(target))return res.status(404).send('QR bağlantısı bulunamadı.');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Referrer-Policy','no-referrer');
  return res.redirect(302,target);
 }catch{return res.status(503).send('Bağlantı şu anda açılamıyor.')}
};
