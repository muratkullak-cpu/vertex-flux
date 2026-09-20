/* VERTEX FLUX 2.0 data layer
   Browser storage adapter today; schema is deliberately backend-ready.
   A cloud adapter can replace read/write without changing feature modules. */
const VertexDB=(()=>{
 const KEY="vertex_flux_2_db", VERSION=2;
 const now=()=>new Date().toISOString(), id=(p)=>p+"_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
 const blank=()=>({version:VERSION,settings:{businessName:"VERTEX FLUX",currency:"TRY",usdTryRate:null,lastRateUpdate:null,presentationPin:null},clients:[],properties:[],quotes:[],jobs:[],tasks:[],subscriptions:[],creditLedger:[],payments:[],qrLinks:[],marketSources:[],costs:[],audit:[],trash:[]});
 function read(){try{const x=JSON.parse(localStorage.getItem(KEY));return migrate(x||blank())}catch{return blank()}}
 function write(s){s.version=VERSION;localStorage.setItem(KEY,JSON.stringify(s));return s}
 function migrate(s){const b=blank();for(const k of Object.keys(b))if(s[k]===undefined)s[k]=b[k];s.version=VERSION;return s}
 function log(s,action,entityType="",entityId="",meta={}){s.audit.unshift({id:id("audit"),at:now(),actor:"super_admin",action,entityType,entityId,meta});return write(s)}
 function add(collection,data){const s=read(), row={id:id(collection),createdAt:now(),updatedAt:now(),...data};s[collection].unshift(row);log(s,"create",collection,row.id);return row}
 function update(collection,rowId,patch){const s=read(),i=s[collection].findIndex(x=>x.id===rowId);if(i<0)throw Error("Kayıt bulunamadı");s[collection][i]={...s[collection][i],...patch,updatedAt:now()};log(s,"update",collection,rowId,{fields:Object.keys(patch)});return s[collection][i]}
 function softDelete(collection,rowId){const s=read(),i=s[collection].findIndex(x=>x.id===rowId);if(i<0)return false;const [row]=s[collection].splice(i,1);s.trash.unshift({id:id("trash"),collection,row,deletedAt:now(),purgeAfter:new Date(Date.now()+30*864e5).toISOString()});log(s,"soft_delete",collection,rowId);return true}
 function restore(trashId){const s=read(),i=s.trash.findIndex(x=>x.id===trashId);if(i<0)return false;const [t]=s.trash.splice(i,1);s[t.collection].unshift({...t.row,updatedAt:now()});log(s,"restore",t.collection,t.row.id);return true}
 function addCredit(clientId,amount,note,propertyId=null){return add("creditLedger",{clientId,propertyId,amount:Number(amount),note,type:Number(amount)>=0?"credit":"debit"})}
 function balance(clientId){return read().creditLedger.filter(x=>x.clientId===clientId).reduce((a,x)=>a+Number(x.amount||0),0)}
 function addPayment(data){return add("payments",{status:"paid",currency:"TRY",...data})}
 function createProperty(data){return add("properties",{tourStatus:"pending",qrStatus:"pending",saleStatus:"active",views:0,scans:0,...data})}
 function createJob(data){return add("jobs",{status:"accepted",history:[{status:"accepted",at:now()}],...data})}
 function setJobStatus(jobId,status){const s=read(),j=s.jobs.find(x=>x.id===jobId);if(!j)throw Error("İş bulunamadı");j.status=status;j.updatedAt=now();j.history=[...(j.history||[]),{status,at:now()}];log(s,"job_status", "jobs",jobId,{status});return j}
 function createQR(data){return add("qrLinks",{slug:data.slug||id("a").replace("a_","").toUpperCase(),enabled:true,scans:0,...data})}
 function exportJSON(){return JSON.stringify(read(),null,2)}
 return {read,write,add,update,softDelete,restore,addCredit,balance,addPayment,createProperty,createJob,setJobStatus,createQR,exportJSON};
})();