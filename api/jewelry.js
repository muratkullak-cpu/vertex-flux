const BASE='https://ujrgwowdxxazbjilstht.supabase.co';
const PUBLIC_KEY='sb_publishable_uvi9mfx29vf9ohey_NfMSg_LT-TxBXY';
const PRIVATE='jewelry-private';
const PUBLIC='jewelry-public';
const key=()=>process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
function headers(extra={}){const secret=key();return {apikey:secret,...(secret.startsWith('sb_secret_')?{}:{authorization:'Bearer '+secret}),...extra}}
async function db(path,options={}){
 const response=await fetch(BASE+'/rest/v1/'+path,{...options,headers:headers({'content-type':'application/json',...options.headers})});
 if(!response.ok){const error=await response.json().catch(()=>({}));throw Error(error.message==='image_credits_missing'?'image_credits_missing':'database_'+response.status)}
 const body=await response.text();return body?JSON.parse(body):null;
}
async function userFrom(req){
 const token=/^Bearer (.+)$/.exec(req.headers.authorization||'')?.[1];if(!token)return null;
 const response=await fetch(BASE+'/auth/v1/user',{headers:{apikey:PUBLIC_KEY,authorization:'Bearer '+token}});
 if(!response.ok)return null;const user=await response.json();return user?.id||null;
}
async function allowed(userId,shopId){
 const [admins,members]=await Promise.all([
  db('profiles?select=id&id=eq.'+encodeURIComponent(userId)+'&role=in.(admin,super_admin)&limit=1'),
  db('jewelry_members?select=user_id&user_id=eq.'+encodeURIComponent(userId)+'&shop_id=eq.'+encodeURIComponent(shopId)+'&limit=1')
 ]);
 return admins.length>0||members.length>0;
}
async function object(path,bucket=PRIVATE){
 const response=await fetch(BASE+'/storage/v1/object/'+bucket+'/'+path,{headers:headers()});
 if(!response.ok)throw Error('image_unavailable');return Buffer.from(await response.arrayBuffer());
}
async function upload(path,bytes){
 const response=await fetch(BASE+'/storage/v1/object/'+PUBLIC+'/'+path,{method:'POST',headers:headers({'content-type':'image/png','x-upsert':'true'}),body:bytes});
 if(!response.ok)throw Error('image_publish_failed');
}
async function signed(path){
 const response=await fetch(BASE+'/storage/v1/object/sign/'+PRIVATE+'/'+path,{method:'POST',headers:headers({'content-type':'application/json'}),body:JSON.stringify({expiresIn:300})});
 if(!response.ok)throw Error('preview_unavailable');const result=await response.json();return BASE+'/storage/v1'+result.signedURL;
}
const fail=(res,status,error)=>res.status(status).json({ok:false,error});
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!key())return fail(res,503,'studio_not_configured');
 try{
  if(req.method==='GET'&&req.query.action==='catalog'){
   const slug=String(req.query.slug||'');if(!/^[a-z0-9-]{5,48}$/.test(slug))return fail(res,400,'invalid_shop');
   const shops=await db('jewelry_shops?select=id,name,tagline,whatsapp,logo_url,accent,phrases&slug=eq.'+slug+'&published=eq.true&limit=1');
   if(!shops.length)return fail(res,404,'shop_not_found');
   const shop=shops[0],products=await db('jewelry_products?select=id,title,category,description,public_path,phrase_index,campaign,video_status,video_public_path&shop_id=eq.'+shop.id+'&status=eq.published&order=created_at.desc&limit=100');
   const [branches,comments]=await Promise.all([db('jewelry_branches?select=name,address,directions_url,phone,hours&shop_id=eq.'+shop.id+'&active=eq.true&order=created_at.asc'),products.length?db('jewelry_comments?select=product_id,display_name,body,created_at&product_id=in.('+products.map(p=>p.id).join(',')+')&status=eq.approved&order=created_at.desc&limit=200'):[]]);
   return res.status(200).json({ok:true,shop,branches,products:products.map(p=>({...p,public_path:undefined,video_public_path:undefined,video:p.video_status==='published'&&p.video_public_path?BASE+'/storage/v1/object/public/jewelry-video-public/'+p.video_public_path:null,phrase:shop.phrases?.[p.phrase_index]||'',image:BASE+'/storage/v1/object/public/'+PUBLIC+'/'+p.public_path,comments:comments.filter(c=>c.product_id===p.id)}))});
  }
  const userId=await userFrom(req);if(!userId)return fail(res,401,'session_required');
  if(req.method==='POST'&&req.body?.action==='member'){
   const shop=String(req.body.shop||''),email=String(req.body.email||'').trim();
   if(!/^[a-f0-9-]{36}$/i.test(shop)||!/^\S+@\S+\.\S+$/.test(email)||email.length>254)return fail(res,400,'invalid_member');
   const admins=await db('profiles?select=id&id=eq.'+encodeURIComponent(userId)+'&role=in.(admin,super_admin)&limit=1');
   if(!admins.length)return fail(res,403,'forbidden');
   const shops=await db('jewelry_shops?select=id&id=eq.'+shop+'&limit=1');if(!shops.length)return fail(res,404,'shop_not_found');
   const assigned=await db('rpc/jewelry_assign_member',{method:'POST',body:JSON.stringify({p_shop:shop,p_email:email})});
   return assigned?res.status(200).json({ok:true}):fail(res,404,'account_not_found');
  }
  const id=String(req.method==='GET'?req.query.id:req.body?.id||'');if(!/^[a-f0-9-]{36}$/i.test(id))return fail(res,400,'invalid_product');
  const rows=await db('jewelry_products?select=*&id=eq.'+id+'&limit=1');if(!rows.length)return fail(res,404,'product_not_found');
  const product=rows[0];if(!await allowed(userId,product.shop_id))return fail(res,403,'forbidden');
  if(req.method==='GET'&&req.query.action==='preview'){
   const path=product.candidate_path||product.source_path;
   return path?res.status(200).json({ok:true,image:await signed(path)}):fail(res,404,'image_not_found');
  }
  if(req.method==='POST'&&req.body?.action==='generate'){
   if(!process.env.OPENAI_API_KEY)return fail(res,503,'image_provider_not_configured');
   if(!product.source_path||!['draft','review'].includes(product.status)||['processing','review','published'].includes(product.video_status))return fail(res,409,'generation_not_available');
   const source=await object(product.source_path),ext=product.source_path.split('.').pop();
   const mime={jpg:'image/jpeg',png:'image/png',webp:'image/webp'}[ext];if(!mime||source.length>10485760)return fail(res,400,'invalid_source_image');
   const claim=await db('rpc/jewelry_claim_generation',{method:'POST',body:JSON.stringify({p_id:id})});
   if(!claim?.id)return fail(res,409,'generation_not_available');
   let completed=false;
   try{
   const form=new FormData();form.append('model','gpt-image-2');form.append('size','1008x1792');
   form.append('image[]',new Blob([source],{type:mime}),'source.'+ext);
   form.append('prompt',product.style==='model'
    ?'Create a vertical 9:16 premium jewelry campaign photo with the supplied item naturally worn on a model. Preserve the exact item: same stone count, stone shape, setting, proportions, metal color and engravings. Do not add or remove stones. No text, logo or extra jewelry. Category: '+product.category+'. If uncertain, keep the product unchanged.'
    :'Create a vertical 9:16 elegant studio product photo of the supplied jewelry item on a premium neutral background. Preserve the exact item: same stone count, stone shape, setting, proportions, metal color and engravings. Do not add or remove stones. No text or logo. Category: '+product.category+'. If uncertain, keep the product unchanged.');
   const ai=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form});
   if(!ai.ok){console.error('Jewelry image edit failed',ai.status);return fail(res,502,'image_generation_failed')}
   const result=await ai.json();const encoded=result.data?.[0]?.b64_json;if(!encoded)return fail(res,502,'image_generation_failed');
   const bytes=Buffer.from(encoded,'base64');if(bytes.length>10485760)return fail(res,502,'image_too_large');
   const candidate=product.shop_id+'/'+product.id+'/candidate-'+crypto.randomUUID()+'.png';
   const saved=await fetch(BASE+'/storage/v1/object/'+PRIVATE+'/'+candidate,{method:'POST',headers:headers({'content-type':'image/png'}),body:bytes});
   if(!saved.ok)throw Error('candidate_save_failed');
   await db('jewelry_products?id=eq.'+id+'&status=eq.generating&generation_claimed_at=eq.'+encodeURIComponent(claim.generation_claimed_at),{method:'PATCH',body:JSON.stringify({candidate_path:candidate,status:'review',generation_claimed_at:null,claim_cost:0,claim_free_date:null,claim_previous_status:null,updated_at:new Date().toISOString()}),headers:{Prefer:'return=minimal'}});
   completed=true;
   return res.status(200).json({ok:true,image:await signed(candidate),generation_count:claim.generation_count});
   }finally{
    if(!completed)await db('rpc/jewelry_release_generation',{method:'POST',body:JSON.stringify({p_id:id,p_claimed_at:claim.generation_claimed_at})}).catch(e=>console.error('Jewelry claim release failed',e));
   }
  }
  if(req.method==='POST'&&req.body?.action==='recover'){
   if(product.status!=='generating'||Date.now()-new Date(product.generation_claimed_at).getTime()<900000)return fail(res,409,'generation_still_running');
   await db('rpc/jewelry_release_generation',{method:'POST',body:JSON.stringify({p_id:id,p_claimed_at:product.generation_claimed_at})});
   return res.status(200).json({ok:true});
  }
  if(req.method==='POST'&&req.body?.action==='publish'){
   if(req.body.approved!==true||product.status!=='review'||!product.candidate_path)return fail(res,409,'review_required');
   const bytes=await object(product.candidate_path),path=product.shop_id+'/'+product.id+'.png';await upload(path,bytes);
   await db('jewelry_products?id=eq.'+id+'&status=eq.review',{method:'PATCH',body:JSON.stringify({status:'published',public_path:path,approved_by:userId,approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}),headers:{Prefer:'return=minimal'}});
   return res.status(200).json({ok:true});
  }
  if(req.method==='POST'&&req.body?.action==='unpublish'){
   if(product.status!=='published')return fail(res,409,'product_not_published');
   await db('jewelry_products?id=eq.'+id,{method:'PATCH',body:JSON.stringify({status:'review',updated_at:new Date().toISOString()}),headers:{Prefer:'return=minimal'}});
   return res.status(200).json({ok:true});
  }
  return fail(res,405,'method_not_allowed');
 }catch(error){console.error('Jewelry studio:',error);return fail(res,error.message==='image_credits_missing'?409:500,error.message==='image_credits_missing'?'image_credits_missing':'studio_failed')}
};
module.exports._studio={BASE,PRIVATE,PUBLIC,key,headers,db,userFrom,allowed,object,signed,fail};
