const crypto=require('crypto');

function b64url(input){
 const s=String(input||'').replace(/-/g,'+').replace(/_/g,'/');
 return Buffer.from(s+'='.repeat((4-s.length%4)%4),'base64');
}

function verifySignedRequest(value,secret){
 const parts=String(value||'').split('.');
 if(parts.length!==2)return null;
 const [sig,payload]=parts;
 const expected=crypto.createHmac('sha256',secret).update(payload).digest();
 const actual=b64url(sig);
 if(actual.length!==expected.length||!crypto.timingSafeEqual(actual,expected))return null;
 let data;
 try{data=JSON.parse(b64url(payload).toString('utf8'))}catch{return null}
 if(String(data.algorithm||'').toUpperCase()!=='HMAC-SHA256')return null;
 return data;
}

module.exports=async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
 const secret=process.env.META_APP_SECRET;
 if(!secret)return res.status(503).json({ok:false,error:'meta_not_configured'});
 const signed=req.body?.signed_request||new URLSearchParams(typeof req.body==='string'?req.body:'').get('signed_request');
 const payload=verifySignedRequest(signed,secret);
 if(!payload?.user_id)return res.status(400).json({ok:false,error:'invalid_signed_request'});
 return res.status(200).json({url:'https://vertex-flux.vercel.app/data-deletion',confirmation_code:'VERTEX-META-DEAUTH-'+String(payload.user_id).slice(-6)});
};