module.exports=async function handler(req,res){
  return res.status(410).json({ok:false,error:'deprecated_endpoint',message:'Google Ads credentials are stored in Supabase Vault and are not exposed to browser cookies.'});
};
