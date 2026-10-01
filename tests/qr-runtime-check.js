const assert=require('node:assert/strict');
const q=require('../api/q');
const response=()=>({code:0,headers:{},status(n){this.code=n;return this},setHeader(k,v){this.headers[k]=v},send(v){this.data=v;return this},json(v){this.data=v;return this},end(){return this},redirect(n,url){this.code=n;this.url=url;return this}});
(async()=>{
 for(const [target,expected] of [['https://example.com/tour',302],['https://user:secret@example.com/',404],['https://[bad',404],['javascript:alert(1)',404],[null,404]]){global.fetch=async()=>({ok:true,json:async()=>target});const r=response();await q({method:'GET',query:{slug:'test-qr'}},r);assert.equal(r.code,expected);assert.equal(r.headers['Cache-Control'],'no-store')}
 global.fetch=async()=>{throw Error('offline')};let r=response();await q({method:'GET',query:{slug:'test-qr'}},r);assert.equal(r.code,503);assert.equal(r.headers['Cache-Control'],'no-store');
 const check=require('../api/qr-check');const saved=check._check;check._check={...saved,safeTarget:async()=>({}),probe:async()=>200};delete require.cache[require.resolve('../api/cron/qr-health')];const cron=require('../api/cron/qr-health');
 process.env.CRON_SECRET='fixture-only';process.env.SUPABASE_SECRET_KEY='sb_secret_fixture';let writes=0;
 global.fetch=async(url,opts)=>{if(opts?.method==='POST'){writes++;return {ok:true,status:201,text:async()=>''}}return {ok:true,status:200,text:async()=>JSON.stringify(String(url).includes('offset=0')?[{id:'fixture',target_url:'https://example.com'}]:[{id:'fixture'}])}};
 r=response();await cron({method:'GET',headers:{authorization:'Bearer fixture-only'}},r);assert.equal(r.code,200);assert.equal(r.data.checked,1);assert.equal(writes,1);
 r=response();await cron({method:'GET',headers:{}},r);assert.equal(r.code,401);assert.equal(writes,1);
 console.log('PASS: QR cache safety, invalid target rejection, outage response, cron authorization, empty-body upsert. No network/provider calls.');
})().catch(e=>{console.error(e);process.exitCode=1});
