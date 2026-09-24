// Return the latest published TCMB USD/TRY indicative selling rate with its actual publication date.
function parseRate(xml){
 const day=xml.match(/<Tarih_Date\b[^>]*\bTarih="(\d{2}\.\d{2}\.\d{4})"/i)?.[1];
 const usd=xml.match(/<Currency\b[^>]*\b(?:Kod|CurrencyCode)="USD"[^>]*>([\s\S]*?)<\/Currency>/i)?.[1];
 const value=usd?.match(/<ForexSelling>\s*([\d.,]+)\s*<\/ForexSelling>/i)?.[1];
 const rate=Number(value?.replace(',','.'));
 if(!day||!Number.isFinite(rate)||rate<=0)throw Error('invalid_tcmb_payload');
 const [d,m,y]=day.split('.');const publishedAt=`${y}-${m}-${d}`;
 if(new Date(publishedAt+'T00:00:00Z').toISOString().slice(0,10)!==publishedAt)throw Error('invalid_tcmb_date');
 return {rate,publishedAt};
}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'method_not_allowed'});
 try{
  const response=await fetch('https://www.tcmb.gov.tr/kurlar/today.xml',{signal:AbortSignal.timeout(9000)});
  if(!response.ok)throw Error('tcmb_http_'+response.status);
  const {rate,publishedAt}=parseRate(await response.text());
  return res.status(200).json({ok:true,rate,publishedAt,source:'TCMB döviz satış',fetchedAt:new Date().toISOString()});
 }catch(e){console.error('FX rate unavailable',e);return res.status(503).json({ok:false,error:'fx_source_unavailable'})}
};
module.exports.parseRate=parseRate;
