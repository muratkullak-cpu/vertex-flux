const crypto=require('crypto');
module.exports=async function handler(req,res){
 const appId='2496301514201043';
 if(!appId)return res.status(500).send('META_APP_ID eksik.');
 const state=crypto.randomBytes(24).toString('hex');
 const redirect='https://vertex-flux.vercel.app/api/meta/callback';
 // Development access: keep the OAuth request limited to the Marketing API
 // permissions required for ad-account discovery and management.
 const scope=['ads_management','ads_read'].join(',');
 res.setHeader('Set-Cookie',`vertex_meta_state=${state}; Path=/api/meta/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 const q=new URLSearchParams({client_id:appId,redirect_uri:redirect,state,response_type:'code',scope});
 res.redirect('https://www.facebook.com/v26.0/dialog/oauth?'+q);
};