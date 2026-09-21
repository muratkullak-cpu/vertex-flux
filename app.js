const V={key:'vertex_flux_2',data:null,screen:'dashboard',sector:'all'};
const seed={pin:'2580',clients:[],jobs:[],properties:[],tasks:[],quotes:[],market:[],costs:[],health:[],audit:[]};
function load(){try{V.data=JSON.parse(localStorage.getItem(V.key))||structuredClone(seed)}catch{V.data=structuredClone(seed)}}
function save(action){localStorage.setItem(V.key,JSON.stringify(V.data));if(action){V.data.audit.unshift({at:new Date().toLocaleString('tr-TR'),action});localStorage.setItem(V.key,JSON.stringify(V.data))}}
const icons={
dashboard:'<span class="ni blue">⌂</span>',
quotes:'<span class="ni amber">▤</span>',
jobs:'<span class="ni green">✓</span>',
calendar:'<span class="ni purple">▦</span>',
clients:'<span class="ni pink">●</span>',
properties:'<span class="ni cyan">⌂</span>',
market:'<span class="ni green">▥</span>',
gallery:'<span class="ni amber">▣</span>',
costs:'<span class="ni red">₺</span>',
health:'<span class="ni blue">◆</span>',
admin:'<span class="ni purple">⚙</span>'
};
function nav(){return [['dashboard','Panel'],['quotes','Teklifler'],['jobs','İşler'],['calendar','Takvim / Görevler'],['clients','Müşteriler'],['properties','Mülkler'],['market','Piyasa'],['gallery','Örnek Galeri'],['costs','Maliyet Merkezi'],['health','Sistem Sağlığı'],['admin','Uzaktan Yönetim']].map(([k,t])=>'<button class="'+(V.screen===k?'active':'')+'" onclick="go(\''+k+'\')">'+icons[k]+' <span>'+t+'</span></button>').join('')}
function layout(body,title,sub='VERTEX SUPER ADMIN'){return '<div class="shell"><aside class="side"><div class="brand"><div class="brand-mark"><img src="'+VERTEX_LOGO+'" alt="Vertex Flux"></div><div><b>VERTEX</b><small>FLUX 2.0</small></div></div><div class="nav">'+nav()+'<div class="sep"></div><button onclick="presentation()">▣ <span>Müşteri Sunumu</span></button><button onclick="logout()">⇥ <span>Kilitle</span></button></div></aside><main class="main"><div class="top"><div><div class="eyebrow">'+sub+'</div><h1>'+title+'</h1></div><div class="actions"><button class="btn" onclick="backup()">Yedek Al</button><button class="btn primary" onclick="newQuote()">+ Yeni Teklif</button></div></div>'+body+'</main></div>'}
function sectorCards(){const cards=[['emlak','EMLAK','360° Portföy Yönetimi','Mülk · 360° Tur · QR · Portföy'],['kuyum','KUYUM','Premium Ürün Deneyimi','Mücevher · Görsel · Video · Dijital Mağaza'],['otel','OTEL & TURİZM','Mekân Deneyimi','Tesis · Oda · 360° · Drone · QR']];return '<div class="sector-grid">'+cards.map(function(c,i){return '<button type="button" class="sector-card sector-'+c[0]+' '+(V.sector===c[0]?'selected':'')+'" data-sector="'+c[0]+'" onclick="setSector(this.dataset.sector)"><div class="sector-visual"><div class="sector-art">'+VERTEX_SECTOR_ART[c[0]]+'</div><span class="sector-number">0'+(i+1)+'</span></div><div class="sector-copy"><span class="sector-kicker">'+c[2]+'</span><h3>'+c[1]+'</h3><p>'+c[3]+'</p><span class="sector-enter">'+(V.sector===c[0]?'SEÇİLDİ ✓':'ÇALIŞMA ALANINA GİR →')+'</span></div></button>'}).join('')+'</div>'}
function dashboard(){let b='<div class="dashboard-hero"><h2>VERTEX <span>Kontrol Merkezi</span></h2><p>Emlak, müşteri, teklif ve operasyon akışını tek merkezden yönetin. Aktif portföyleri, yaklaşan işleri ve sistem durumunu hızlıca görün.</p></div><div class="grid stats"><div class="card stat"><span>Aktif müşteri</span><strong>'+V.data.clients.length+'</strong></div><div class="card stat"><span>Devam eden iş</span><strong>'+V.data.jobs.length+'</strong></div><div class="card stat"><span>Aktif mülk</span><strong>'+V.data.properties.length+'</strong></div><div class="card stat"><span>Sistem sağlığı</span><strong class="ok">İyi</strong></div></div>'+sectorCards()+'<div class="grid cols" style="margin-top:20px"><div class="card"><div class="section-title"><h2>Yaklaşan işler</h2></div><div class="list">'+(V.data.tasks.length?V.data.tasks.map(x=>'<div class="row"><b>'+x.title+'</b><span>'+x.date+'</span><span class="pill">'+x.kind+'</span><span>›</span></div>').join(''):'<div class="empty-state">Henüz yaklaşan iş yok.<br><small>Teklif kabul edildiğinde işler burada görünür.</small></div>')+'</div></div><div class="card"><div class="section-title"><h2>Kontrol Merkezi</h2></div><p class="muted">Üç sektör birbirinden ayrı veri ve özellik kümeleriyle yönetilir.</p><div class="notice">Supabase bulut veritabanı aktif. Müşteri, mülk, teklif, iş ve görev kayıtları merkezi olarak senkronize edilir.</div></div></div>';return layout(b,'Kontrol Merkezi')}
function jobs(){let steps=['Kabul edildi','Planlandı','Çekildi','Düzenleniyor','Müşteri onayı','Teslim edildi','Ödeme bekliyor','Ödendi'];let rows=V.data.jobs.map(j=>'<div class="card"><div class="section-title"><h2>'+j.id+' · '+j.title+'</h2><span class="pill">'+j.sector.toUpperCase()+'</span></div><p>'+j.client+' · '+j.date+'</p><div class="timeline">'+steps.map(s=>'<div class="step '+(s===j.status?'done':'')+'">'+s+'</div>').join('')+'</div></div>').join('');return layout('<div class="list">'+rows+'</div>','İşler','TEKLİFTEN TESLİMATA')}
function properties(){let rows=V.data.properties.map(p=>'<div class="row"><b>'+p.name+'<br><small class="muted">'+p.client+'</small></b><span>'+p.sqm+' m² · '+p.floor+'</span><span><span class="ok">● '+p.tour+'</span><br><small>QR '+p.qr+' · '+p.scans+' tarama</small></span><button class="btn" onclick="propertyDetail(\''+p.id+'\')">Yönet</button></div>').join('');return layout('<div class="grid cols"><div class="card"><div class="section-title"><h2>Emlak Mülkleri</h2><button class="btn primary" onclick="addProperty()">+ Mülk Ekle</button></div><div class="list">'+(rows||'<span class="muted">Henüz mülk yok.</span>')+'</div></div><div class="card"><h2>Portföy Özeti</h2><p class="muted">Her mülk; çekim, 360 tur, QR, görüntülenme ve satış/kiralama durumuyla ayrı izlenir.</p><div class="stat"><span>Toplam mülk</span><strong>'+V.data.properties.length+'</strong></div></div></div>','Mülkler','EMLAK · PORTFÖY YÖNETİMİ')}
function calendar(){return layout('<div class="grid cols"><div class="card"><div class="section-title"><h2>Takvim</h2></div><div class="list">'+V.data.tasks.map(t=>'<div class="row"><b>'+t.date+'</b><span>'+t.title+'</span><span class="pill">'+t.kind+'</span><span>›</span></div>').join('')+'</div></div><div class="card"><h2>Yeni görev</h2><div class="form"><label>Görev<input id="taskTitle"></label><label>Tarih / saat<input id="taskDate" type="datetime-local"></label></div><button class="btn primary" style="margin-top:14px" onclick="addTask()">Görev Ekle</button></div></div>','Takvim / Yapılacaklar')}
function market(){return layout('<div class="toolbar"><button class="active">Fiyatlar</button><button>Rakipler</button><button>Karşılaştır</button><button>Kaynaklar</button></div><div class="card"><div class="row"><b>Hizmet</b><b>Piyasa</b><b>VERTEX</b><b>Kaynak</b></div>'+V.data.market.map(m=>'<div class="row"><span>'+m.service+'<br><small class="muted">'+m.sector+'</small></span><span>'+m.avg+'</span><span>'+m.vertex+'</span><span class="warn">'+m.source+'</span></div>').join('')+'<div class="notice">Müşteri Sunum Modu maliyet, kâr ve özel kaynak notlarını göstermez.</div></div>','Piyasa','SADECE SUPER ADMIN')}
function costs(){return layout('<div class="grid stats"><div class="card stat"><span>Aylık sabit gider</span><strong>—</strong></div><div class="card stat"><span>Değişken gider</span><strong>—</strong></div><div class="card stat"><span>Müşteri başı maliyet</span><strong>—</strong></div><div class="card stat"><span>Brüt marj</span><strong>—</strong></div></div><div class="card"><div class="row"><b>Servis</b><b>Tip</b><b>Sektör</b><b>Tutar</b></div>'+V.data.costs.map(c=>'<div class="row"><span>'+c.name+'</span><span>'+c.type+'</span><span>'+c.sector+'</span><span>'+c.amount+' TL</span></div>').join('')+'</div>','Maliyet Merkezi','GİZLİ · SUPER ADMIN')}
function health(){return layout('<div class="card"><div class="section-title"><h2>Aktif servis kontrolleri</h2><button class="btn" onclick="healthCheck()">Şimdi Kontrol Et</button></div>'+V.data.health.map(h=>'<div class="row"><b>'+h.name+'</b><span class="ok">QR ● '+h.qr+'</span><span class="ok">Tur ● '+h.provider+'</span><button class="btn">Müdahale</button></div>').join('')+'<div class="notice">Gerçek uzaktan sağlık kontrolü, VERTEX yönlendirme katmanı ve Kuula/Short.io entegrasyonu bağlandığında aktif olacak.</div></div>','Sistem Sağlığı')}
function clients(){let em=V.data.clients.filter(c=>c.sector==='emlak');return layout('<div class="grid cols"><div class="card"><div class="section-title"><h2>Emlak Müşterileri</h2><button class="btn primary" onclick="addClient()">+ Müşteri Ekle</button></div><div class="row"><b>Müşteri</b><b>Sektör</b><b>Durum</b><b></b></div>'+em.map(c=>'<div class="row"><b>'+c.name+'</b><span>EMLAK</span><span class="ok">● '+c.status+'</span><button class="btn" onclick="clientDetail(\''+c.id+'\')">Aç</button></div>').join('')+'</div><div class="card"><h2>CRM</h2><p class="muted">Müşteri kartında mülkler, işler, teklifler, ödemeler ve notlar birlikte tutulur.</p></div></div>','Müşteriler','EMLAK CRM')}
function admin(){return layout('<div class="grid cols"><div class="card"><h2>Uzaktan Sistem Yönetimi</h2><p class="muted">Müşteri seç → özellikleri uzaktan aç/kapat. Kritik işlemler ikinci onay ister ve işlem geçmişine yazılır.</p>'+V.data.clients.map(c=>'<div class="row"><b>'+c.name+'</b><span>'+c.sector.toUpperCase()+'</span><span class="pill">Feature Flags</span><button class="btn" onclick="toggleDemo(\''+c.name+'\')">Yönet</button></div>').join('')+'</div><div class="card"><h2>İşlem Geçmişi</h2><button class="btn danger" onclick="resetDemo()">Demo verilerini temizle</button><div class="list">'+(V.data.audit.slice(0,8).map(a=>'<div><small class="muted">'+a.at+'</small><br>'+a.action+'</div>').join('')||'<span class="muted">Henüz işlem yok.</span>')+'</div></div></div>','Uzaktan Yönetim','SUPER ADMIN')}
function quotes(){let q=V.data.quotes||[];return layout('<div class="grid cols"><div class="card"><h2>Yeni Emlak Teklifi</h2><div class="form"><label>Müşteri<select id="qClient">'+V.data.clients.filter(x=>x.sector==='emlak').map(x=>'<option>'+x.name+'</option>').join('')+'</select></label><label>Teklif tipi<select id="qType"><option>Tek Mülk</option><option>Portföy Çekimi</option><option>VERTEX 360 Üyelik</option></select></label><label>Mülk / Proje<input id="qProperty" placeholder="Örn. Lara 3+1"></label><label>m²<input id="qSqm" type="number" placeholder="150"></label><label>Hizmet<select id="qService"><option>360° Sanal Tur</option><option>360° + Drone</option><option>360° + Reels</option><option>360° + Drone + Reels</option></select></label><label>Teklif tutarı (TL)<input id="qAmount" type="number" placeholder="0"></label></div><button class="btn primary" style="margin-top:14px" onclick="createQuote()">Teklifi Kaydet</button></div><div class="card"><h2>Kayıtlı Teklifler</h2><div class="list">'+(q.map(x=>'<div class="row"><b>'+x.property+'</b><span>'+x.client+'</span><span>'+Number(x.amount).toLocaleString('tr-TR')+' TL</span><button class="btn" onclick="acceptQuote(\''+x.id+'\')">'+(x.status==='Kabul edildi'?'İş Açıldı':'Kabul Et')+'</button></div>').join('')||'<span class="muted">Henüz teklif yok.</span>')+'</div></div></div>','Emlak Teklifleri','TEKLİF → İŞ')}
function generic(title,msg){return layout('<div class="card"><h2>'+title+'</h2><p class="muted">'+msg+'</p></div>',title)}
function render(){let f={dashboard,jobs,calendar,clients,properties,market,costs,health,admin,quotes,gallery:()=>generic('Örnek Çalışma Galerisi','Emlak satış sunumunda kullanılacak 360° ve çekim örnekleri burada tutulacak.')};document.getElementById('app').innerHTML=(f[V.screen]||dashboard)()}
function go(s){V.screen=s;render()} function setSector(s){V.sector=s;sessionStorage.setItem('vf_sector',s);render()}
function addTask(){let t=document.getElementById('taskTitle').value,d=document.getElementById('taskDate').value;if(!t)return;V.data.tasks.unshift({title:t,date:d||'Tarih yok',kind:'Görev'});save('Görev eklendi: '+t);render()}
function toggleDemo(n){if(confirm(n+' için uzaktan özellik yönetimini açmak istiyor musun?')){save(n+' uzaktan yönetim ekranı açıldı');alert('Bu müşteri için özellik anahtarları altyapı bağlantısından sonra canlı yönetilecek.');render()}}
function backup(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(V.data,null,2)],{type:'application/json'}));a.download='vertex-flux-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();save('JSON yedeği alındı')}
function healthCheck(){save('Manuel sağlık kontrolü istendi');alert('QR / yönlendirme / tur katmanları için canlı kontrol altyapısı bağlanınca bu düğme gerçek test yapacak.');render()}
function uid(p){return p+'-'+Date.now().toString(36).toUpperCase()}
function addClient(){let name=prompt('Emlak müşteri / ofis adı');if(!name)return;let phone=prompt('Telefon / WhatsApp')||'';let contact=prompt('Yetkili kişi')||'';V.data.clients.unshift({id:Date.now(),name,phone,contact,sector:'emlak',status:'Aktif',createdAt:new Date().toISOString()});save('Emlak müşterisi eklendi: '+name);render()}
function addProperty(){let em=V.data.clients.filter(x=>x.sector==='emlak');if(!em.length){alert('Önce bir Emlak müşterisi ekleyin.');go('clients');return}let client=prompt('Müşteri / ofis adı',em[0].name);if(!client)return;let name=prompt('Mülk adı (örn. Lara 3+1)');if(!name)return;let sqm=Number(prompt('Yaklaşık m²')||0);let address=prompt('Adres / bölge')||'';let type=prompt('Mülk tipi (Daire, Villa, Arsa...)')||'';V.data.properties.unshift({id:Date.now(),client,name,sqm,address,type,floor:'—',tour:'Bekliyor',qr:'Bekliyor',status:'Aktif',scans:0,views:0,createdAt:new Date().toISOString()});save('Mülk eklendi: '+name);render()}
function propertyDetail(id){let p=V.data.properties.find(x=>x.id===id);if(!p)return;let s=prompt('Mülk durumu',p.status||'Aktif');if(s){p.status=s;save('Mülk durumu güncellendi: '+p.name+' → '+s);render()}}
async function clientDetail(id){
 const c=V.data.clients.find(x=>x.id===id);if(!c)return;
 const pc=V.data.properties.filter(x=>x.clientId===c.id).length,jc=V.data.jobs.filter(x=>x.clientId===c.id).length;
 const choice=prompt(c.name+'\\nMülk: '+pc+' · İş: '+jc+'\\n\\n1 = Düzenle\\n2 = Sil\\n0 = Kapat','0');
 if(choice==='1'){
   const name=prompt('Müşteri / ofis adı',c.name);if(!name)return;
   const phone=prompt('Telefon / WhatsApp',c.phone||'')??c.phone;
   const contact=prompt('Yetkili kişi',c.contact||'')??c.contact;
   const {error}=await CLOUD.from('clients').update({name,phone,whatsapp:phone,contact_person:contact}).eq('id',id);
   if(error)return cloudErr(error);await auditCloud('Müşteri güncellendi: '+name,'clients',id);await loadCloud();render();return;
 }
 if(choice==='2'){
   if(pc||jc){alert('Bu müşteriye bağlı mülk veya iş var. Önce bağlı kayıtları kaldırmalısın.');return}
   if(!confirm(c.name+' kalıcı olarak silinsin mi?'))return;
   const {error}=await CLOUD.from('clients').delete().eq('id',id);
   if(error)return cloudErr(error);await auditCloud('Müşteri silindi: '+c.name,'clients',id);await loadCloud();render();
 }
}
function createQuote(){V.data.quotes=V.data.quotes||[];let q={id:uid('TKL'),client:document.getElementById('qClient').value,type:document.getElementById('qType').value,property:document.getElementById('qProperty').value||'Adsız mülk',sqm:Number(document.getElementById('qSqm').value||0),service:document.getElementById('qService').value,amount:Number(document.getElementById('qAmount').value||0),status:'Bekliyor',createdAt:new Date().toISOString()};V.data.quotes.unshift(q);save('Teklif oluşturuldu: '+q.id);render()}
function acceptQuote(id){let q=V.data.quotes.find(x=>x.id===id);if(!q||q.status==='Kabul edildi')return;q.status='Kabul edildi';let prop=V.data.properties.find(x=>x.client===q.client&&x.name===q.property);if(!prop){prop={id:Date.now(),client:q.client,name:q.property,sqm:q.sqm,floor:'—',tour:'Bekliyor',qr:'Bekliyor',status:'Aktif',scans:0,views:0};V.data.properties.unshift(prop)}let jid=uid('VF');V.data.jobs.unshift({id:jid,title:q.property+' · '+q.service,client:q.client,sector:'emlak',status:'Kabul edildi',date:new Date().toLocaleDateString('tr-TR'),quoteId:q.id,propertyId:prop.id});V.data.tasks.unshift({title:q.property+' planlama',date:'Tarih belirlenecek',kind:'Çekim'});save('Teklif kabul edildi ve iş açıldı: '+jid);render()}
function resetDemo(){if(confirm('Bu tarayıcıdaki mevcut VERTEX verileri temizlensin mi?')){V.data=structuredClone(seed);localStorage.setItem(V.key,JSON.stringify(V.data));V.screen='dashboard';render()}}
function newQuote(){go('quotes')}
function presentation(){document.body.insertAdjacentHTML('beforeend','<div class="presentation" id="presentation"><button class="btn close" onclick="exitPresentation()">Yöneticiye Dön</button><div class="hero"><div class="presentation-logo"><img src="'+VERTEX_LOGO+'" alt="Vertex Flux"></div><div class="eyebrow">VERTEX FLUX</div><h1>Dijital Deneyim</h1><p>Müşteriniz için doğru hizmeti birlikte seçelim.</p>'+sectorCards()+'</div></div>')}
function exitPresentation(){let p=prompt('Yönetici PIN');if(p===V.data.pin)document.getElementById('presentation').remove();else alert('PIN yanlış')}
function logout(){sessionStorage.removeItem('vf_auth');login()}
function login(){document.getElementById('app').innerHTML='<div class="login"><div class="login-ambient a"></div><div class="login-ambient b"></div><div class="loginbox"><div class="login-logo"><img src="'+VERTEX_LOGO+'" alt="Vertex Flux"></div><div class="login-copy"><div class="eyebrow">VERTEX PRIVATE CONTROL SYSTEM</div><h1>FLUX <span>2.0</span></h1></div><p class="login-sub">Merkezi yönetim sistemine güvenli giriş</p><label class="pin-label">YÖNETİCİ PIN<input id="pin" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></label><button class="btn primary login-button" onclick="auth()">Sisteme Gir <span>→</span></button><button class="forgot-password" onclick="forgotPassword()">Şifremi Unuttum</button><div class="login-foot"><span>● Sistem çevrimiçi</span><span>SUPER ADMIN</span></div></div></div>'}
function auth(){if(document.getElementById('pin').value===V.data.pin){sessionStorage.setItem('vf_auth','1');render()}else alert('PIN yanlış')}

/* ===== VERTEX CLOUD ADAPTER / SUPABASE ===== */
const CLOUD = window.VertexCloud;
const trStatus={aktif:'Aktif',pasif:'Pasif',arsiv:'Arşiv',bekliyor:'Bekliyor',kabul_edildi:'Kabul edildi',planlandi:'Planlandı',cekildi:'Çekildi',duzenleniyor:'Düzenleniyor',musteri_onayi:'Müşteri onayı',teslim_edildi:'Teslim edildi',odeme_bekliyor:'Ödeme bekliyor',odendi:'Ödendi'};
function cloudErr(e){console.error(e);const m=e?.message||String(e);alert('Bulut işlemi başarısız: '+m+'\n\nBağlantıyı kontrol edip tekrar deneyin.');}
async function loadCloud(){
  const [cl,pr,qu,jo,ta,au]=await Promise.all([
    CLOUD.from('clients').select('*').order('created_at',{ascending:false}),
    CLOUD.from('properties').select('*').order('created_at',{ascending:false}),
    CLOUD.from('quotes').select('*').order('created_at',{ascending:false}),
    CLOUD.from('jobs').select('*').order('created_at',{ascending:false}),
    CLOUD.from('tasks').select('*').order('created_at',{ascending:false}),
    CLOUD.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(50)
  ]);
  const bad=[cl,pr,qu,jo,ta,au].find(x=>x.error); if(bad) throw bad.error;
  const cm=Object.fromEntries(cl.data.map(x=>[x.id,x.name]));
  V.data=structuredClone(seed);
  V.data.clients=cl.data.map(x=>({id:x.id,name:x.name,phone:x.phone||x.whatsapp||'',contact:x.contact_person||'',sector:x.sector,status:trStatus[x.status]||x.status,createdAt:x.created_at}));
  V.data.properties=pr.data.map(x=>({id:x.id,clientId:x.client_id,client:cm[x.client_id]||'—',name:x.title,sqm:Number(x.sqm||0),address:x.address||'',type:x.property_type||'',floor:x.floor||'—',tour:trStatus[x.tour_status]||x.tour_status,qr:trStatus[x.qr_status]||x.qr_status,status:trStatus[x.listing_status]||x.listing_status,scans:x.scans||0,views:x.views||0}));
  V.data.quotes=qu.data.map(x=>{let n={};try{n=JSON.parse(x.notes||'{}')}catch{} return {id:x.id,quoteNo:x.quote_no,clientId:x.client_id,client:cm[x.client_id]||'—',type:n.type||'Teklif',property:n.property||'—',sqm:n.sqm||0,service:n.service||'—',amount:Number(x.total||0),status:trStatus[x.status]||x.status,createdAt:x.created_at}});
  V.data.jobs=jo.data.map(x=>({id:x.id,title:x.title,clientId:x.client_id,client:cm[x.client_id]||'—',sector:'emlak',status:trStatus[x.status]||x.status,date:x.scheduled_at?new Date(x.scheduled_at).toLocaleDateString('tr-TR'):'—',quoteId:x.quote_id,propertyId:x.property_id}));
  V.data.tasks=ta.data.map(x=>({id:x.id,title:x.title,date:x.due_at?new Date(x.due_at).toLocaleString('tr-TR'):'Tarih yok',kind:'Görev',status:x.status}));
  V.data.audit=au.data.map(x=>({at:new Date(x.created_at).toLocaleString('tr-TR'),action:x.action}));
}
async function auditCloud(action,entity_type='',entity_id=null){const {data:{user}}=await CLOUD.auth.getUser(); if(!user)return; await CLOUD.from('audit_logs').insert({user_id:user.id,action,entity_type,entity_id});}
save=function(){};
login=function(){
 document.getElementById('app').innerHTML='<div class="login"><div class="login-ambient a"></div><div class="login-ambient b"></div><div class="loginbox"><div class="login-logo"><img src="'+VERTEX_LOGO+'" alt="Vertex Flux"></div><div class="login-copy"><div class="eyebrow">VERTEX PRIVATE CONTROL SYSTEM</div><h1>FLUX <span>2.0</span></h1></div><p class="login-sub">SUPER ADMIN · Güvenli bulut girişi</p><label class="pin-label">YÖNETİCİ ŞİFRESİ<div class="password-wrap"><input id="password" type="password" autocomplete="current-password" placeholder="Şifrenizi girin"><button type="button" class="password-toggle" onclick="togglePassword()">Göster</button></div></label><button class="btn primary login-button" onclick="auth()">Sisteme Gir <span>→</span></button><button type="button" class="forgot-password" onclick="forgotPassword()">Şifremi Unuttum</button><div class="login-foot"><span>● Güvenli bağlantı</span><span>VERTEX CLOUD</span></div></div></div>';
};
async function forgotPassword(){
 const email='muratkullak@gmail.com',redirectTo=location.origin+location.pathname;
 const b=document.querySelector('.forgot-password'); if(b){b.disabled=true;b.textContent='Gönderiliyor…'}
 try{
  const {error}=await CLOUD.auth.resetPasswordForEmail(email,{redirectTo});
  if(error)throw error;
  alert('Şifre sıfırlama bağlantısı gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.');
 }catch(e){
  console.error('PASSWORD_RESET',e);
  alert('Şifre sıfırlama servisine şu anda ulaşılamıyor. Sistem verileriniz etkilenmedi. Biraz sonra tekrar deneyin.');
 }finally{if(b){b.disabled=false;b.textContent='Şifremi Unuttum'}}
}
function recoveryScreen(){
 document.getElementById('app').innerHTML='<div class="login"><div class="loginbox"><div class="login-copy"><div class="eyebrow">VERTEX PASSWORD RECOVERY</div><h1>YENİ <span>ŞİFRE</span></h1></div><p class="login-sub">Yeni yönetici şifrenizi belirleyin.</p><label class="pin-label">YENİ ŞİFRE<div class="password-wrap"><input id="newPassword" type="password" autocomplete="new-password" placeholder="En az 8 karakter"><button type="button" class="password-toggle" onclick="toggleField(\'newPassword\',this)">Göster</button></div></label><label class="pin-label" style="margin-top:14px">ŞİFRE TEKRAR<div class="password-wrap"><input id="newPassword2" type="password" autocomplete="new-password" placeholder="Şifreyi tekrar girin"></div></label><button class="btn primary login-button" onclick="setNewPassword()">Şifreyi Güncelle <span>→</span></button></div></div>';
}
function toggleField(id,b){const p=document.getElementById(id);if(!p)return;const show=p.type==='password';p.type=show?'text':'password';b.textContent=show?'Gizle':'Göster'}
async function setNewPassword(){const a=document.getElementById('newPassword').value,b=document.getElementById('newPassword2').value;if(a.length<8)return alert('Şifre en az 8 karakter olmalı.');if(a!==b)return alert('Şifreler eşleşmiyor.');const {error}=await CLOUD.auth.updateUser({password:a});if(error)return cloudErr(error);alert('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.');await CLOUD.auth.signOut();history.replaceState(null,'',location.pathname);login();}
function togglePassword(){const p=document.getElementById('password'),b=document.querySelector('.password-toggle');if(!p)return;const show=p.type==='password';p.type=show?'text':'password';if(b)b.textContent=show?'Gizle':'Göster'}
auth=async function(){
 const email='muratkullak@gmail.com',password=document.getElementById('password').value;
 if(!password){alert('Şifrenizi girin.');return}
 const {error}=await CLOUD.auth.signInWithPassword({email,password}); if(error){alert('Giriş başarısız: '+error.message);return}
 try{await loadCloud();render()}catch(e){cloudErr(e)}
};
logout=async function(){await CLOUD.auth.signOut();sessionStorage.removeItem('vf_auth');login()};
addClient=async function(){
 let name=prompt('Emlak müşteri / ofis adı');if(!name)return;
 let phone=prompt('Telefon / WhatsApp')||'',contact=prompt('Yetkili kişi')||'';
 const {data:{user}}=await CLOUD.auth.getUser();
 const {error}=await CLOUD.from('clients').insert({name,phone,whatsapp:phone,contact_person:contact,sector:'emlak',status:'aktif',created_by:user.id});
 if(error)return cloudErr(error);await auditCloud('Emlak müşterisi eklendi: '+name,'clients');await loadCloud();render();
};
addProperty=async function(){
 let em=V.data.clients.filter(x=>x.sector==='emlak');if(!em.length){alert('Önce bir Emlak müşterisi ekleyin.');go('clients');return}
 let clientName=prompt('Müşteri / ofis adı',em[0].name);if(!clientName)return;let client=em.find(x=>x.name===clientName)||em[0];
 let name=prompt('Mülk adı (örn. Lara 3+1)');if(!name)return;let sqm=Number(prompt('Yaklaşık m²')||0),address=prompt('Adres / bölge')||'',type=prompt('Mülk tipi (Daire, Villa, Arsa...)')||'';
 const {data:{user}}=await CLOUD.auth.getUser();
 const {error}=await CLOUD.from('properties').insert({client_id:client.id,title:name,sqm,address,property_type:type,listing_status:'aktif',tour_status:'bekliyor',qr_status:'bekliyor',created_by:user.id});
 if(error)return cloudErr(error);await auditCloud('Mülk eklendi: '+name,'properties');await loadCloud();render();
};
addTask=async function(){
 let title=document.getElementById('taskTitle').value,d=document.getElementById('taskDate').value;if(!title)return;
 const {data:{user}}=await CLOUD.auth.getUser();const due=d?new Date(d).toISOString():null;
 const {error}=await CLOUD.from('tasks').insert({title,due_at:due,status:'bekliyor',priority:'normal',created_by:user.id});
 if(error)return cloudErr(error);await auditCloud('Görev eklendi: '+title,'tasks');await loadCloud();render();
};
propertyDetail=async function(id){
 let p=V.data.properties.find(x=>x.id===id);if(!p)return;let s=prompt('Mülk durumu: aktif / satildi / kiralandi / pasif / arsiv','aktif');if(!s)return;
 const {error}=await CLOUD.from('properties').update({listing_status:s}).eq('id',id);if(error)return cloudErr(error);await loadCloud();render();
};
createQuote=async function(){
 let clientName=document.getElementById('qClient').value,client=V.data.clients.find(x=>x.name===clientName);if(!client){alert('Önce müşteri ekleyin.');return}
 let notes={type:document.getElementById('qType').value,property:document.getElementById('qProperty').value||'Adsız mülk',sqm:Number(document.getElementById('qSqm').value||0),service:document.getElementById('qService').value};
 let total=Number(document.getElementById('qAmount').value||0),quote_no='TKL-'+Date.now().toString(36).toUpperCase();
 const {data:{user}}=await CLOUD.auth.getUser();
 const {error}=await CLOUD.from('quotes').insert({quote_no,client_id:client.id,sector:'emlak',status:'taslak',currency:'TRY',subtotal:total,total,notes:JSON.stringify(notes),created_by:user.id});
 if(error)return cloudErr(error);await auditCloud('Teklif oluşturuldu: '+quote_no,'quotes');await loadCloud();render();
};
acceptQuote=async function(id){
 let q=V.data.quotes.find(x=>x.id===id);if(!q||q.status==='Kabul edildi')return;
 const {data:{user}}=await CLOUD.auth.getUser();
 let prop=V.data.properties.find(x=>x.clientId===q.clientId&&x.name===q.property),propertyId=prop?.id||null;
 if(!propertyId){const ins=await CLOUD.from('properties').insert({client_id:q.clientId,title:q.property,sqm:q.sqm,listing_status:'aktif',tour_status:'bekliyor',qr_status:'bekliyor',created_by:user.id}).select('id').single();if(ins.error)return cloudErr(ins.error);propertyId=ins.data.id}
 let up=await CLOUD.from('quotes').update({status:'kabul_edildi'}).eq('id',id);if(up.error)return cloudErr(up.error);
 let job=await CLOUD.from('jobs').insert({client_id:q.clientId,property_id:propertyId,quote_id:id,title:q.property+' · '+q.service,status:'kabul_edildi',created_by:user.id}).select('id').single();if(job.error)return cloudErr(job.error);
 let task=await CLOUD.from('tasks').insert({job_id:job.data.id,client_id:q.clientId,title:q.property+' planlama',status:'bekliyor',priority:'normal',created_by:user.id});if(task.error)return cloudErr(task.error);
 await auditCloud('Teklif kabul edildi ve iş açıldı','jobs',job.data.id);await loadCloud();render();
};
resetDemo=function(){alert('Bulut sürümünde toplu veri silme kapalıdır. Kayıtlar güvenlik için tek tek yönetilir.')};
backup=async function(){await loadCloud();let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(V.data,null,2)],{type:'application/json'}));a.download='vertex-flux-cloud-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click()};
async function bootstrap(){
 V.sector=sessionStorage.getItem('vf_sector')||'all';
 if(!CLOUD){alert('Bulut bağlantısı yüklenemedi. Sayfayı yenileyin.');return login()}
 CLOUD.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')setTimeout(recoveryScreen,0)});
 try{
  const {data:{session},error}=await CLOUD.auth.getSession(); if(error)throw error;
  const recovery=location.hash.includes('type=recovery')||location.search.includes('type=recovery');
  if(recovery&&session)return recoveryScreen();
  if(!session)return login();
  await loadCloud();render();
 }catch(e){console.error('BOOTSTRAP',e);login()}
}
bootstrap();