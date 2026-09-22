const crypto=require('crypto');
module.exports=async function handler(req,res){
 const appId=process.env.META_APP_ID;
 if(!appId)return res.status(500).send('META_APP_ID eksik.');
 const state=crypto.randomBytes(24).toString('hex');
 const redirect='https://vertex-flux.vercel.app/api/meta/callback';
 const scope=['ads_management','ads_read','business_management','pages_show_list','pages_read_engagement','instagram_basic'].join(',');
 res.setHeader('Set-Cookie',`vertex_meta_state=${state}; Path=/api/meta/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 const q=new URLSearchParams({client_id:appId,redirect_uri:redirect,state,response_type:'code',scope});
 res.redirect('https://www.facebook.com/v23.0/dialog/oauth?'+q);
};