const studio=require('./jewelry')._studio;
const {BASE,key,headers,db,userFrom,allowed,object,fail}=studio;
const PRIVATE='jewelry-video-private',PUBLIC='jewelry-video-public';
async function preview(path){const r=await fetch(BASE+'/storage/v1/object/sign/'+PRIVATE+'/'+path,{method:'POST',headers:headers({'content-type':'application/json'}),body:JSON.stringify({expiresIn:300})});if(!r.ok)throw Error('video_preview_failed');const d=await r.json();return BASE+'/storage/v1'+d.signedURL}
async function save(bucket,path,bytes){const r=await fetch(BASE+'/storage/v1/object/'+bucket+'/'+path,{method:'POST',headers:headers({'content-type':'video/mp4','x-upsert':'true'}),body:bytes});if(!r.ok)throw Error('video_storage_failed')}
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!key())return fail(res,503,'studio_not_configured');
 if(!['GET','POST'].includes(req.method))return fail(res,405,'method_not_allowed');
 const action=req.method==='GET'?req.query.action:req.body?.action,id=String(req.method==='GET'?req.query.id:req.body?.id||'');
 if(!/^[a-f0-9-]{36}$/i.test(id))return fail(res,400,'invalid_product');
 try{
  const user=await userFrom(req);if(!user)return fail(res,401,'session_required');
  const rows=await db('jewelry_products?select=*&id=eq.'+id+'&limit=1');if(!rows.length)return fail(res,404,'product_not_found');
  const p=rows[0];if(!await allowed(user,p.shop_id))return fail(res,403,'forbidden');
  if(req.method==='GET'&&action==='preview')return p.video_candidate_path?res.status(200).json({ok:true,status:p.video_status,video:await preview(p.video_candidate_path)}):fail(res,404,'video_not_available');
  if(req.method==='POST'&&action==='create'){
   if(!process.env.OPENAI_API_KEY)return fail(res,503,'image_provider_not_configured');
   const reference=String(req.body.reference||'');
   if(!reference.startsWith(p.shop_id+'/'+p.id+'/')||!/\/video-reference-[a-f0-9-]{36}[.]png$/.test(reference))return fail(res,400,'invalid_reference');
   const image=await object(reference);
   if(image.length<24||image.length>10485760||image.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||image.readUInt32BE(16)!==720||image.readUInt32BE(20)!==1280)return fail(res,400,'invalid_reference_size');
   const claim=await db('rpc/jewelry_claim_video',{method:'POST',body:JSON.stringify({p_id:id,p_reference:reference})});
   if(!claim?.id)return fail(res,409,'video_generation_not_available');
   const form=new FormData();form.append('model','sora-2');form.append('seconds','4');form.append('size','720x1280');form.append('input_reference',new Blob([image],{type:'image/png'}),'reference.png');
   form.append('prompt','A vertical 9:16 four-second premium jewelry product film. The supplied frame is the exact product reference. Very slow subtle camera motion and natural light glints only. Preserve every stone, setting, metal color, engraving and product proportion unchanged throughout. No additional jewelry, no text, no logos, no speech. Keep the product fully visible.');
   const r=await fetch('https://api.openai.com/v1/videos',{method:'POST',headers:{authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form});
   if(!r.ok){await db('jewelry_products?id=eq.'+id+'&video_status=eq.processing&video_job_id=is.null',{method:'PATCH',body:JSON.stringify({video_status:'failed',video_attempts:0})});return fail(res,502,'video_generation_failed')}
   const job=await r.json();if(!/^video_[a-zA-Z0-9_-]+$/.test(job.id||''))throw Error('video_job_unavailable');
   await db('jewelry_products?id=eq.'+id+'&video_status=eq.processing',{method:'PATCH',body:JSON.stringify({video_job_id:job.id})});
   return res.status(202).json({ok:true,status:'processing'});
  }
  if(req.method==='GET'&&action==='status'){
   if(p.video_candidate_path&&['review','published'].includes(p.video_status))return res.status(200).json({ok:true,status:p.video_status,video:await preview(p.video_candidate_path)});
   if(!p.video_job_id||!/^video_[a-zA-Z0-9_-]+$/.test(p.video_job_id))return res.status(200).json({ok:true,status:p.video_status});
   if(!process.env.OPENAI_API_KEY)return fail(res,503,'image_provider_not_configured');
   const r=await fetch('https://api.openai.com/v1/videos/'+p.video_job_id,{headers:{authorization:'Bearer '+process.env.OPENAI_API_KEY}});
   if(!r.ok)return fail(res,502,'video_status_unavailable');const job=await r.json();
   if(job.status==='failed'){await db('jewelry_products?id=eq.'+id,{method:'PATCH',body:JSON.stringify({video_status:'failed',video_attempts:0,video_job_id:null})});return res.status(200).json({ok:true,status:'failed'})}
   if(job.status!=='completed')return res.status(200).json({ok:true,status:'processing',progress:job.progress||0});
   const download=await fetch('https://api.openai.com/v1/videos/'+p.video_job_id+'/content',{headers:{authorization:'Bearer '+process.env.OPENAI_API_KEY}});
   if(!download.ok)return fail(res,502,'video_download_unavailable');
   const bytes=Buffer.from(await download.arrayBuffer());if(bytes.length>52428800)throw Error('video_too_large');
   const path=p.shop_id+'/'+p.id+'/video.mp4';await save(PRIVATE,path,bytes);
   await db('jewelry_products?id=eq.'+id+'&video_status=eq.processing',{method:'PATCH',body:JSON.stringify({video_candidate_path:path,video_status:'review'})});
   return res.status(200).json({ok:true,status:'review',video:await preview(path)});
  }
  if(req.method==='POST'&&action==='publish'){
   if(req.body.approved!==true||p.video_status!=='review'||!p.video_candidate_path)return fail(res,409,'review_required');
   const bytes=await object(p.video_candidate_path,PRIVATE);await save(PUBLIC,p.video_candidate_path,bytes);
   await db('jewelry_products?id=eq.'+id+'&video_status=eq.review',{method:'PATCH',body:JSON.stringify({video_status:'published',video_public_path:p.video_candidate_path,video_approved_by:user,video_approved_at:new Date().toISOString()})});
   await db('jewelry_updates',{method:'POST',body:JSON.stringify({shop_id:p.shop_id,message:'Ürün videosu onaylandı: '+p.title,actor:user})});
   return res.status(200).json({ok:true});
  }
  return fail(res,405,'method_not_allowed');
 }catch(e){console.error('Jewelry video:',e.message);return fail(res,500,'video_failed')}
};
