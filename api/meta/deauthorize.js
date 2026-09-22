module.exports=async function handler(req,res){
 // Meta may POST a signed_request here when a user removes the app.
 // The connection is marked revoked only after a valid signed_request can be
 // associated with a stored Meta user; until that mapping is implemented,
 // acknowledge safely without trusting unsigned request data.
 if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
 return res.status(200).json({url:'https://vertex-flux.vercel.app/data-deletion',confirmation_code:'VERTEX-META-DEAUTH'});
};