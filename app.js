/**
 * app.js — Uygulama mantığı ve arayüz render'ı (Faz 1: tek cihaz, localStorage)
 */

let DRAFT = null; // aktif teklif taslağı (hesaplama ekranında)

// ---------------- Yardımcılar ----------------
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function escapeHtml(s) { return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

// "VERTEX Flux" gibi isimlerde ilk kelimeyi büyük harf + açık renk, geri
// kalanını (yazıldığı gibi) accent mavisiyle iki tonlu gösterir.
function brandWordmarkHtml(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts[0].toLocaleLowerCase("tr") === "vertex") {
    const rest = parts.slice(1).join(" ");
    return `<span class="brand-vertex">${escapeHtml(parts[0].toLocaleUpperCase("tr"))}</span>` +
      (rest ? ` <span class="brand-flux">${escapeHtml(rest)}</span>` : "");
  }
  return escapeHtml(trimmed);
}
function todayISO() { return new Date().toISOString().slice(0, 10); }
function addDaysISO(n) { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function formatDateTR(iso) {
  if (!iso) return "-";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
}
function mapsLink(address) {
  if (!address) return "";
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
}

function openModal(html) {
  const root = $("#modalRoot");
  root.innerHTML = `<div class="modal-overlay" id="modalOverlay"><div class="modal-card">${html}</div></div>`;
  return root;
}
function closeModal() {
  $("#modalRoot").innerHTML = "";
}

function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:#0f2748;color:#fff;padding:10px 20px;border-radius:20px;z-index:500;font-size:0.9rem;box-shadow:0 4px 20px rgba(0,0,0,0.2);";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ---------------- Kilit Ekranı ----------------
async function initLockScreen() {
  const settings = await DB.getSettings();
  const lockScreen = $("#lockScreen");
  lockScreen.classList.remove("hidden");
  const firstRun = !settings.pin;

  $("#lockLogo").innerHTML = settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" alt="logo">` : "🔒";
  $("#lockTitle").innerHTML = settings.businessName ? brandWordmarkHtml(settings.businessName) : "Teklif Sistemi";
  $("#lockSubtitle").textContent = firstRun ? "İlk kurulum: bir PIN belirleyin (4-6 hane)" : "Devam etmek için PIN girin";
  $("#lockSubmitBtn").textContent = firstRun ? "PIN Belirle ve Başla" : "Giriş Yap";

  const input = $("#lockPinInput");
  const errorEl = $("#lockError");
  input.value = "";
  input.focus();

  $("#lockSubmitBtn").onclick = async () => {
    const val = input.value.trim();
    if (val.length < 4) {
      errorEl.textContent = "PIN en az 4 haneli olmalı.";
      errorEl.classList.remove("hidden");
      return;
    }
    if (firstRun) {
      await DB.updateSettings({ pin: val });
      unlockApp();
    } else {
      if (val === settings.pin) {
        unlockApp();
      } else {
        errorEl.textContent = "PIN yanlış, tekrar deneyin.";
        errorEl.classList.remove("hidden");
        input.value = "";
      }
    }
  };
  input.onkeydown = (e) => { if (e.key === "Enter") $("#lockSubmitBtn").click(); };
}

function unlockApp() {
  $("#lockScreen").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  initAppShell();
}

// ---------------- Uygulama İskeleti ----------------
async function initAppShell() {
  await refreshBrand();
  await refreshReminderBadge();
  setupTabs();
  showTab("dashboard");
}

async function refreshBrand() {
  const settings = await DB.getSettings();
  $("#brandName").innerHTML = brandWordmarkHtml(settings.businessName || "İşletme Adınız");
  const logoEl = $("#brandLogo");
  logoEl.innerHTML = settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" alt="logo">` : "📸";
}

async function refreshReminderBadge() {
  const reminders = await DB.getReminders();
  const dueCount = reminders.filter(r => r.isToday || r.isOverdue).length;
  const badge = $("#reminderBadge");
  if (dueCount > 0) {
    badge.textContent = dueCount;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function setupTabs() {
  $all(".tab-btn").forEach(btn => {
    btn.onclick = () => showTab(btn.dataset.tab);
  });
}

async function showTab(tab) {
  $all(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  $all(".screen").forEach(s => s.classList.add("hidden"));
  $(`#screen-${tab}`).classList.remove("hidden");

  if (tab === "dashboard") await renderDashboard();
  else if (tab === "calculator") await renderCalculatorStart();
  else if (tab === "customers") await renderCustomers();
  else if (tab === "gallery") await renderGallery();
  else if (tab === "settings") await renderSettings();
}

// ================= PANEL / DASHBOARD =================
async function renderDashboard() {
  const reminders = await DB.getReminders();
  const listEl = $("#reminderList");
  if (!reminders.length) {
    listEl.innerHTML = `<div class="empty-state">Şu an bekleyen hatırlatıcı yok. Teklif Hesapla ekranından yeni bir teklif oluşturup takip tarihi belirleyebilirsin.</div>`;
  } else {
    listEl.innerHTML = reminders.map(r => `
      <div class="reminder-card ${r.isOverdue ? "overdue" : ""}" data-customer="${r.customerId}">
        <div>
          <div class="r-name">${escapeHtml(r.customerName)}</div>
          <div class="r-meta">${r.customerPhone ? escapeHtml(r.customerPhone) + " · " : ""}Teklif: ${formatTRY(r.totalTRY)}</div>
        </div>
        <div class="r-date-tag">${r.isOverdue ? "Gecikti · " : r.isToday ? "Bugün · " : ""}${formatDateTR(r.followUpDate)}</div>
      </div>
    `).join("");
    $all(".reminder-card", listEl).forEach(card => {
      card.onclick = () => openCustomerDetail(card.dataset.customer);
    });
  }

  const customers = await DB.getCustomers();
  const quotes = await DB.getQuotes();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const quotesThisMonth = quotes.filter(q => (q.createdAt || "").slice(0, 7) === thisMonth);
  const approved = quotes.filter(q => q.status === "onaylandi");
  const approvedTotal = approved.reduce((sum, q) => sum + (q.totalTRY || 0), 0);

  $("#statsRow").innerHTML = `
    <div class="stat-card"><div class="num">${customers.length}</div><div class="label">Kayıtlı Müşteri</div></div>
    <div class="stat-card"><div class="num">${quotesThisMonth.length}</div><div class="label">Bu Ay Oluşturulan Teklif</div></div>
    <div class="stat-card"><div class="num">${approved.length}</div><div class="label">Onaylanan Teklif</div></div>
    <div class="stat-card"><div class="num">${formatTRY(approvedTotal)}</div><div class="label">Onaylanan Toplam Tutar</div></div>
  `;
}

// ================= HESAPLAMA — BAŞLANGIÇ =================
async function renderCalculatorStart() {
  $("#startFlowBtn").onclick = () => startFlow();
}

// ================= YENİ TEKLİF AKIŞI (tam ekran) =================
// FLOW: gate -> items -> ads-1..ads-8 -> reveal
let FLOW = null;
const ADS_HAZIR_KITLE = [10000, 50000, 100000, 200000, 500000, 1000000];
const ADS_ILETISIM_SECENEKLERI = [
  { deger: "whatsapp", etiket: "WhatsApp Mesajı", ikon: "💬" },
  { deger: "dm", etiket: "Instagram DM", ikon: "📩" },
  { deger: "yorum", etiket: "Yorum", ikon: "💭" },
  { deger: "begeni", etiket: "Beğeni", ikon: "❤️" },
  { deger: "takipci", etiket: "Takipçi", ikon: "➕" }
];

// 360° Sanal Tur kalemleri — konut tipine göre fiyat kademesi seçtiren kalemler.
const KONUT_TIPI_ITEM_IDS = ["e_360", "e_360_dinamik"];
const KONUT_TIPI_TIERS = [
  { key: "1+1", label: "1+1" },
  { key: "2+1", label: "2+1" },
  { key: "3+1", label: "3+1" },
  { key: "4+1", label: "4+1" },
  { key: "5+1", label: "5+1" },
  { key: "villa", label: "Villa" }
];
function konutTipiLabel(key) {
  const t = KONUT_TIPI_TIERS.find(x => x.key === key);
  return t ? t.label : key;
}

function emptyAdsDraft() {
  return {
    reelsAdedi: 1,
    konumlar: [],
    yayinGunSayisi: 7,
    hedefKitleBuyuklugu: 50000,
    droneSecili: null,
    tiktokSecili: null,
    facebookSecili: null,
    iletisimTercihi: null
  };
}

async function startFlow() {
  const sectors = await DB.getSectors();
  const settings = await DB.getSettings();
  FLOW = {
    step: "gate",
    sectorId: sectors[0].id,
    customer: { name: "", phone: "", isTanimi: "" },
    lineState: {},
    customItems: [],
    ads: null, // dolduktan sonra { draft, result }
    adsWizardStep: 1,
    fxJustUpdated: false
  };
  $("#flowRoot").classList.remove("hidden");
  document.body.style.overflow = "hidden";
  renderFlow();
}

function exitFlow() {
  FLOW = null;
  $("#flowRoot").classList.add("hidden");
  $("#fxCornerWidget").classList.add("hidden");
  document.body.style.overflow = "";
  showTab("dashboard");
}

function fxUpdatedToday(settings) {
  if (!settings.lastRateUpdate) return false;
  return settings.lastRateUpdate.slice(0, 10) === todayISO();
}

async function updateFxCorner(usdTotal) {
  const settings = await DB.getSettings();
  $("#fxCornerRate").textContent = settings.usdTryRate ? `1 USD = ${settings.usdTryRate.toFixed(2)} TL` : "1 USD = - TL";
  $("#fxCornerRunning").textContent = formatUSD(usdTotal || 0);
  $("#fxCornerWidget").classList.remove("hidden");
}

async function sectorItemsTotalTRY() {
  if (!FLOW) return 0;
  let total = 0;
  Object.values(FLOW.lineState).forEach(st => { if (st.included) total += st.qty * st.price; });
  FLOW.customItems.forEach(ci => { if (ci.included) total += ci.qty * ci.price; });
  return total;
}

async function adsCurrentTotalTRY() {
  if (!FLOW || !FLOW.adsDraftLive) return 0;
  const settings = await DB.getSettings();
  const result = VertexAdsCalc.yedekFormulHesapla(FLOW.adsDraftLive, settings);
  return result.genelToplam;
}

async function renderFlow() {
  const root = $("#flowRoot");
  const settings = await DB.getSettings();
  const logoHtml = settings.logoDataUrl ? `<img src="${settings.logoDataUrl}" alt="logo">` : "";

  let bodyHtml = "";
  if (FLOW.step === "gate") bodyHtml = await renderGateStep(settings);
  else if (FLOW.step === "items") bodyHtml = await renderItemsStep(settings);
  else if (FLOW.step && FLOW.step.startsWith("ads-")) bodyHtml = await renderAdsWizardStep(settings);
  else if (FLOW.step === "reveal") bodyHtml = await renderRevealStep(settings);

  root.innerHTML = `
    <div class="flow-wrap">
      <div class="flow-header">
        <div class="flow-logo">${logoHtml}<span>${brandWordmarkHtml(settings.businessName || "Vertex Flux")}</span></div>
      </div>
      ${bodyHtml}
    </div>
  `;

  bindFlowEvents();
}

// ---------- ADIM: Müşteri Bilgileri (gate) ----------
async function renderGateStep(settings) {
  const fxOk = fxUpdatedToday(settings);
  $("#fxCornerWidget").classList.add("hidden");
  return `
    <div class="flow-card">
      <h1 class="flow-title">Müşteri Bilgileri</h1>
      <div class="flow-field">
        <label>Müşteri / İşletme Adı *</label>
        <input type="text" id="gateName" placeholder="Örn. Cafe Lezzet" value="${escapeHtml(FLOW.customer.name)}">
      </div>
      <div class="flow-field">
        <label>Telefon (opsiyonel)</label>
        <input type="tel" id="gatePhone" placeholder="05xx xxx xx xx" value="${escapeHtml(FLOW.customer.phone)}">
      </div>
      <div class="flow-field">
        <label>İş Tanımı / Not</label>
        <textarea id="gateIsTanimi" rows="2" placeholder="Örn: villa 250 m², iç-dış çekim, akşam ışığı istendi...">${escapeHtml(FLOW.customer.isTanimi)}</textarea>
      </div>
      <div class="flow-field">
        <label>Sektör</label>
        <select id="gateSector">${(await DB.getSectors()).map(s => `<option value="${s.id}" ${s.id === FLOW.sectorId ? "selected" : ""}>${s.icon} ${escapeHtml(s.name)}</option>`).join("")}</select>
      </div>
      <div class="flow-field">
        <label>Tarih</label>
        <input type="text" value="${formatDateTR(todayISO())}" disabled>
      </div>

      <div class="fx-gate-box ${fxOk ? "done" : ""}" id="fxGateBox">
        <div>
          <div class="rate-line" id="fxGateRateLine">${settings.usdTryRate ? "1 USD = " + settings.usdTryRate.toFixed(2) + " TL" : "Kur henüz alınmadı"}</div>
          <div class="rate-src" id="fxGateSrcLine">${fxOk ? "Bugün güncellendi · " + escapeHtml(settings.rateSource || "") : "Devam etmeden önce kuru güncellemelisin (günde bir kez yeterli)"}</div>
        </div>
        <button class="btn btn-secondary btn-sm" id="fxGateUpdateBtn">🔄 Kuru Güncelle</button>
      </div>

      <div class="flow-nav">
        <button class="btn btn-ghost" id="gateCancelBtn">Vazgeç</button>
        <button class="btn btn-primary" id="gateContinueBtn" ${fxOk ? "" : "disabled"}>Devam Et</button>
      </div>
    </div>
  `;
}

// ---------- ADIM: Sektör Öğeleri ----------
async function renderItemsStep(settings) {
  const sector = await DB.getSector(FLOW.sectorId);
  sector.items.forEach(item => {
    if (!(item.id in FLOW.lineState)) {
      FLOW.lineState[item.id] = { included: false, qty: 1, price: item.price, name: item.name, unit: item.unit };
      if (KONUT_TIPI_ITEM_IDS.includes(item.id)) FLOW.lineState[item.id].konutTipi = null;
    }
  });

  const rows = sector.items.map(item => {
    const st = FLOW.lineState[item.id];
    const isKonutTipi = KONUT_TIPI_ITEM_IDS.includes(item.id);
    const unitLine = isKonutTipi
      ? `<div class="item-unit">${escapeHtml(item.unit)} · ${st.konutTipi
          ? `Konut tipi: <strong>${escapeHtml(konutTipiLabel(st.konutTipi))}</strong> · <button type="button" class="link-btn" data-konut-edit="${item.id}">değiştir</button>`
          : `<button type="button" class="link-btn" data-konut-edit="${item.id}">konut tipi seç</button>`}</div>`
      : `<div class="item-unit">${escapeHtml(item.unit)}</div>`;
    return `
      <div class="calc-item-row ${item.verified ? "" : "unverified"} ${st.included ? "checked" : ""}" data-item="${item.id}" ${isKonutTipi ? 'data-konut-item="1"' : ""}>
        <input type="checkbox" class="item-check" ${st.included ? "checked" : ""}>
        <div>
          <div class="item-name">${escapeHtml(item.name)} ${item.verified ? "" : '<span class="unverified-tag">tahmini</span>'}</div>
          ${unitLine}
        </div>
        <div class="qty-stepper">
          <button type="button" class="qty-mini-btn" data-qty-action="minus" data-item="${item.id}">−</button>
          <span class="qty-mini-val">${st.qty}</span>
          <button type="button" class="qty-mini-btn" data-qty-action="plus" data-item="${item.id}">+</button>
        </div>
      </div>
    `;
  }).join("");

  const customRows = FLOW.customItems.map(ci => `
    <div class="calc-item-row ${ci.included ? "checked" : ""}" data-custom="${ci.id}">
      <input type="checkbox" class="custom-check" ${ci.included ? "checked" : ""}>
      <div>
        <div class="item-name">${escapeHtml(ci.name || "İsimsiz kalem")}</div>
        <div class="item-unit">${escapeHtml(ci.unit || "adet")} · <button type="button" class="link-btn" data-custom-edit="${ci.id}">düzenle</button></div>
      </div>
      <div class="qty-stepper">
        <button type="button" class="qty-mini-btn" data-qty-action="minus" data-custom="${ci.id}">−</button>
        <span class="qty-mini-val">${ci.qty}</span>
        <button type="button" class="qty-mini-btn" data-qty-action="plus" data-custom="${ci.id}">+</button>
      </div>
    </div>
  `).join("");

  const adsBlock = FLOW.ads
    ? `<div class="ads-summary-row">
        <div><div class="t">📣 Reklam Yönetimi eklendi</div><div class="d">${FLOW.ads.draft.yayinGunSayisi} gün · ${FLOW.ads.draft.hedefKitleBuyuklugu.toLocaleString("tr-TR")} kişi hedef kitle</div></div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-sm btn-secondary" id="adsEditBtn">Düzenle</button>
          <button class="btn btn-sm btn-ghost" id="adsRemoveBtn">Kaldır</button>
        </div>
      </div>`
    : `<div class="ads-add-card">
        <div><div class="t">📣 Reklam Yönetimi eklemek ister misin?</div><div class="d">Hedef kitle, konum ve gün sayısına göre detaylı bütçe hesaplanır</div></div>
        <button class="btn btn-primary btn-sm" id="adsAddBtn">+ Reklam Yönetimi Ekle</button>
      </div>`;

  return `
    <div class="flow-card">
      <h1 class="flow-title">Hizmet Seç</h1>
      <div class="flow-sub">${sector.icon} ${escapeHtml(sector.name)} sektörü hizmetleri. Fiyatlar şimdilik gizli, en sonda toplu göreceksin.</div>

      ${adsBlock}

      <div id="calcItemsList" class="calc-items">${rows + customRows}</div>
      <button class="btn btn-ghost" id="calcAddCustomItemBtn">+ Ekstra Kalem Ekle</button>

      <div class="calc-note-field">
        <label>Not (opsiyonel)</label>
        <textarea id="calcNote" rows="2" placeholder="Örn: villa 250 m², iç-dış çekim, akşam ışığı istendi...">${escapeHtml(FLOW.note || "")}</textarea>
      </div>

      <div class="flow-nav">
        <button class="btn btn-ghost" id="itemsBackBtn">Geri</button>
        <button class="btn btn-primary" id="itemsContinueBtn">Teklifi Tamamla</button>
      </div>
    </div>
  `;
}

// ---------- ADIM: Reklam Yönetimi Sihirbazı (8 adım) ----------
function adsStepNumber() {
  return Number(FLOW.step.split("-")[1]);
}

async function renderAdsWizardStep(settings) {
  if (!FLOW.adsDraftLive) FLOW.adsDraftLive = emptyAdsDraft();
  const d = FLOW.adsDraftLive;
  const n = adsStepNumber();
  const progress = `
    <div class="flow-progress-label">Adım ${n} / 8 — Reklam Yönetimi</div>
    <div class="flow-progress-bar"><div class="flow-progress-fill" style="width:${(n/8)*100}%"></div></div>
  `;

  let inner = "";
  let title = "";
  let navDisabled = false;

  if (n === 1) {
    title = "Kaç adet Reels videosu istiyorsun?";
    inner = `
      <div class="stepper">
        <button class="stepper-btn" id="reelsMinus">−</button>
        <div class="stepper-val" id="reelsVal">${d.reelsAdedi}</div>
        <button class="stepper-btn" id="reelsPlus">+</button>
      </div>`;
  } else if (n === 2) {
    title = "Reklamların hangi il/ilçe veya ülke/şehirlere ulaşmasını istiyorsun?";
    inner = await renderLocationPicker();
    navDisabled = d.konumlar.length === 0;
  } else if (n === 3) {
    title = "Reklamın kaç gün yayınlanmasını istiyorsun?";
    inner = `
      <div class="stepper">
        <button class="stepper-btn" id="gunMinus">−</button>
        <div class="stepper-val" id="gunVal">${d.yayinGunSayisi}</div>
        <button class="stepper-btn" id="gunPlus">+</button>
      </div>`;
  } else if (n === 4) {
    title = "Hedef kitle büyüklüğün ne kadar?";
    const presetBtns = ADS_HAZIR_KITLE.map(v => `<button class="preset-btn ${d.hedefKitleBuyuklugu === v ? "selected" : ""}" data-val="${v}">${v.toLocaleString("tr-TR")}</button>`).join("");
    inner = `
      <div class="slider-value" id="kitleVal">${d.hedefKitleBuyuklugu.toLocaleString("tr-TR")} kişi</div>
      <input type="range" id="kitleSlider" min="1000" max="1000000" step="1000" value="${d.hedefKitleBuyuklugu}">
      <div class="preset-row">${presetBtns}</div>`;
  } else if (n === 5) {
    title = "Drone çekimi istiyor musun?";
    inner = yesNoCards("droneSecili", d.droneSecili, "🚁");
    navDisabled = d.droneSecili === null || d.droneSecili === undefined;
  } else if (n === 6) {
    title = "TikTok'ta da görünsün mü?";
    inner = yesNoCards("tiktokSecili", d.tiktokSecili, "🎵");
    navDisabled = d.tiktokSecili === null || d.tiktokSecili === undefined;
  } else if (n === 7) {
    title = "Facebook'ta da görünsün mü?";
    inner = yesNoCards("facebookSecili", d.facebookSecili, "📘");
    navDisabled = d.facebookSecili === null || d.facebookSecili === undefined;
  } else if (n === 8) {
    title = "Sana nasıl ulaşılmasını istersin?";
    inner = `<div class="choice-row">${ADS_ILETISIM_SECENEKLERI.map(s => `
      <div class="choice-card ${d.iletisimTercihi === s.deger ? "selected" : ""}" data-iletisim="${s.deger}"><span class="ic">${s.ikon}</span>${s.etiket}</div>
    `).join("")}</div>
    <p class="flow-sub" style="margin-top:20px;">Bu seçim sadece bilgi amaçlıdır, fiyatı değiştirmez.</p>`;
    navDisabled = !d.iletisimTercihi;
  }

  // Sağ üstteki köşe widget'ı — o anki sihirbaz seçimlerinin canlı USD toplamı
  const adsTotalTRY = await adsCurrentTotalTRY();
  const usd = settings.usdTryRate ? adsTotalTRY / settings.usdTryRate : 0;
  updateFxCorner(usd);

  return `
    <div class="flow-card">
      ${progress}
      <h1 class="flow-title">${title}</h1>
      ${inner}
      <div class="flow-nav">
        <button class="btn btn-ghost" id="adsBackBtn">Geri</button>
        <button class="btn btn-primary" id="adsNextBtn" ${navDisabled ? "disabled" : ""}>${n === 8 ? "Hesapla ve Bitir" : "İleri"}</button>
      </div>
    </div>
  `;
}

function yesNoCards(field, val, icon) {
  return `
    <div class="choice-row">
      <div class="choice-card ${val === true ? "selected" : ""}" data-yesno="${field}:true"><span class="ic">${icon}</span>Evet</div>
      <div class="choice-card ${val === false ? "selected" : ""}" data-yesno="${field}:false"><span class="ic">🚫</span>Hayır</div>
    </div>`;
}

async function renderLocationPicker() {
  const d = FLOW.adsDraftLive;
  const tab = FLOW.locTab || "tr";
  const chips = d.konumlar.map((k, i) => `<div class="loc-chip">${escapeHtml(k.etiket)}<button data-loc-del="${i}">✕</button></div>`).join("");

  let body = "";
  if (tab === "tr") {
    const trData = await VertexLocations.trVeriYukle();
    const ilOptions = trData.map(il => `<option value="${il.kod}" ${FLOW.trSeciliIl === il.kod ? "selected" : ""}>${escapeHtml(il.il)}${il.buyuksehir ? " (Büyükşehir)" : ""}</option>`).join("");
    let ilceBlock = "";
    if (FLOW.trSeciliIl) {
      const il = trData.find(x => x.kod === FLOW.trSeciliIl);
      const sel = FLOW.trSeciliIlceler || new Set();
      ilceBlock = `
        <label style="display:block;margin-top:14px;color:var(--text-dim);font-size:0.85rem;">
          <input type="checkbox" id="trTumIl" ${FLOW.trTumIl ? "checked" : ""}> Tüm il (${escapeHtml(il.il)})
        </label>
        <div class="ilce-grid">${il.ilceler.map(ilce => `<div class="ilce-chip ${sel.has(ilce) ? "selected" : ""}" data-ilce="${escapeHtml(ilce)}">${escapeHtml(ilce)}</div>`).join("")}</div>
        <button class="btn btn-primary btn-sm" style="margin-top:14px;" id="trKonumEkleBtn">Bu Konumu Ekle</button>
      `;
    }
    body = `<label style="display:block;color:var(--text-dim);font-size:0.85rem;margin-bottom:8px;">İl seçin</label>
      <select id="trIlSelect"><option value="">-- İl seçin --</option>${ilOptions}</select>${ilceBlock}`;
  } else {
    const world = await VertexLocations.dunyaVeriYukle();
    const ulkeOptions = world.countries.map(u => `<option value="${u.kod}" ${FLOW.dunyaSeciliUlke === u.kod ? "selected" : ""}>${u.bayrak} ${escapeHtml(u.ad)}</option>`).join("");
    let sehirBlock = "";
    if (FLOW.dunyaSeciliUlke) {
      const sehirler = world.cities[FLOW.dunyaSeciliUlke] || [];
      const q = (FLOW.dunyaArama || "").toLocaleLowerCase("tr");
      const filtered = q.length >= 1 ? sehirler.filter(s => s.toLocaleLowerCase("tr").includes(q)) : sehirler;
      sehirBlock = `
        <label style="display:block;margin-top:14px;color:var(--text-dim);font-size:0.85rem;">Şehir ara</label>
        <input type="text" id="dunyaSehirArama" placeholder="Şehir adı yazın..." value="${escapeHtml(FLOW.dunyaArama || "")}">
        <div class="loc-search-results">${filtered.map(s => `<div class="loc-search-item" data-sehir="${escapeHtml(s)}">${escapeHtml(s)}</div>`).join("") || '<div class="loc-search-item">Sonuç yok</div>'}</div>
      `;
    }
    body = `<label style="display:block;color:var(--text-dim);font-size:0.85rem;margin-bottom:8px;">Ülke seçin</label>
      <select id="dunyaUlkeSelect"><option value="">-- Ülke seçin --</option>${ulkeOptions}</select>${sehirBlock}`;
  }

  return `
    <div class="loc-tabs">
      <button class="loc-tab ${tab === "tr" ? "active" : ""}" id="locTabTr">🇹🇷 Türkiye</button>
      <button class="loc-tab ${tab === "dunya" ? "active" : ""}" id="locTabDunya">🌍 Dünya</button>
    </div>
    ${body}
    <div class="loc-chips">${chips}</div>
    ${d.konumlar.length === 0 ? '<div class="flow-warn">En az 1 konum eklemelisin.</div>' : ""}
  `;
}

// ---------- ADIM: Sonuç / Teklif ----------
async function renderRevealStep(settings) {
  $("#fxCornerWidget").classList.add("hidden");
  const sector = await DB.getSector(FLOW.sectorId);
  const rate = settings.usdTryRate || 1;

  let rows = "";
  let sectorTotal = 0;
  sector.items.forEach(item => {
    const st = FLOW.lineState[item.id];
    if (st && st.included) {
      const lt = st.qty * st.price;
      sectorTotal += lt;
      const tierSuffix = st.konutTipi ? ` — ${escapeHtml(konutTipiLabel(st.konutTipi))}` : "";
      rows += `<tr><td>${escapeHtml(item.name)}${tierSuffix}${st.qty > 1 ? " × " + st.qty : ""}</td><td>${formatTRY(lt)}</td></tr>`;
    }
  });
  FLOW.customItems.forEach(ci => {
    if (ci.included) {
      const lt = ci.qty * ci.price;
      sectorTotal += lt;
      rows += `<tr><td>${escapeHtml(ci.name || "Ekstra kalem")}${ci.qty > 1 ? " × " + ci.qty : ""}</td><td>${formatTRY(lt)}</td></tr>`;
    }
  });

  let adsTotal = 0;
  if (FLOW.ads) {
    const k = FLOW.ads.result.kalemler;
    const konumEtiket = FLOW.ads.draft.konumlar.map(x => x.etiket).join(", ");
    rows += `<tr><td>Reels Video Prodüksiyonu (${FLOW.ads.draft.reelsAdedi} adet)</td><td>${formatTRY(k.reelsUretimToplam + k.reelsHizmetToplam)}</td></tr>`;
    if (FLOW.ads.draft.droneSecili) rows += `<tr><td>Drone Çekimi</td><td>${formatTRY(k.droneUretim + k.droneHizmet)}</td></tr>`;
    rows += `<tr><td>Meta Reklam Yönetimi (${FLOW.ads.draft.yayinGunSayisi} gün, ${escapeHtml(konumEtiket)}${FLOW.ads.draft.facebookSecili ? " + Facebook" : ""})</td><td>${formatTRY(k.metaToplamButce + (k.metaToplamButce * settings.metaYonetimOrani))}</td></tr>`;
    if (FLOW.ads.draft.tiktokSecili) rows += `<tr><td>TikTok Reklam Yönetimi</td><td>${formatTRY(k.tiktokToplamButce + (k.tiktokToplamButce * settings.tiktokYonetimOrani))}</td></tr>`;
    adsTotal = FLOW.ads.result.genelToplam;
  }

  const genelToplam = sectorTotal + adsTotal;
  const genelToplamUSD = genelToplam / rate;

  return `
    <div class="flow-card">
      <h1 class="flow-title">Teklif — ${escapeHtml(FLOW.customer.name || "İsimsiz Müşteri")}</h1>
      <div class="flow-sub">${formatDateTR(todayISO())}${sector ? " · " + sector.icon + " " + escapeHtml(sector.name) : ""}</div>

      <table class="reveal-table"><thead><tr><th>Hizmet</th><th>Tutar</th></tr></thead><tbody>${rows || '<tr><td colspan="2" class="muted">Hiç kalem seçilmedi.</td></tr>'}</tbody></table>

      <div class="reveal-total-box">
        <div class="lbl">GENEL TOPLAM</div>
        <div class="val-wrap">
          <div class="try-val">${formatTRY(genelToplam)}</div>
          <div class="usd-val">≈ ${formatUSD(genelToplamUSD)}</div>
        </div>
      </div>

      <div class="flow-nav">
        <button class="btn btn-ghost" id="revealBackBtn">Geri</button>
        <button class="btn btn-secondary" id="revealPdfBtn">Yazdır / PDF</button>
        <button class="btn btn-primary" id="revealSaveBtn">Teklifi Kaydet</button>
      </div>
    </div>
  `;
}

// ---------- Olay bağlama ----------
function bindFlowEvents() {
  const root = $("#flowRoot");

  // GATE
  const gName = $("#gateName"); if (gName) gName.oninput = e => FLOW.customer.name = e.target.value;
  const gPhone = $("#gatePhone"); if (gPhone) gPhone.oninput = e => FLOW.customer.phone = e.target.value;
  const gTanimi = $("#gateIsTanimi"); if (gTanimi) gTanimi.oninput = e => FLOW.customer.isTanimi = e.target.value;
  const gSector = $("#gateSector"); if (gSector) gSector.onchange = e => { FLOW.sectorId = e.target.value; FLOW.lineState = {}; };
  const fxBtn = $("#fxGateUpdateBtn");
  if (fxBtn) fxBtn.onclick = async () => {
    fxBtn.textContent = "Güncelleniyor...";
    fxBtn.disabled = true;
    try {
      const result = await updateExchangeRate();
      await DB.updateSettings({ usdTryRate: result.rate, rateSource: result.source, lastRateUpdate: result.updatedAt });
      toast("Kur güncellendi: " + result.source);
      await renderFlow();
    } catch (e) {
      toast("Kur güncellenemedi. İnternet bağlantını kontrol et.");
      fxBtn.textContent = "🔄 Kuru Güncelle";
      fxBtn.disabled = false;
    }
  };
  const gCancel = $("#gateCancelBtn"); if (gCancel) gCancel.onclick = exitFlow;
  const gContinue = $("#gateContinueBtn");
  if (gContinue) gContinue.onclick = async () => {
    if (!FLOW.customer.name.trim()) { toast("Lütfen müşteri / işletme adını girin."); return; }
    const settings = await DB.getSettings();
    if (!fxUpdatedToday(settings)) { toast("Devam etmeden önce döviz kurunu güncellemelisin."); return; }
    FLOW.step = "items";
    renderFlow();
  };

  // ITEMS
  $all(".calc-item-row[data-item]", root).forEach(row => {
    const itemId = row.dataset.item;
    const st = FLOW.lineState[itemId];
    const isKonutTipi = KONUT_TIPI_ITEM_IDS.includes(itemId);
    const checkbox = row.querySelector(".item-check");
    const sync = () => { st.included = checkbox.checked; row.classList.toggle("checked", st.included); updateItemsCornerWidget(); };
    checkbox.onchange = () => {
      if (isKonutTipi && checkbox.checked) {
        checkbox.checked = false; // konut tipi seçilmeden dahil edilmez
        openKonutTipiModal(itemId, () => renderFlow());
        return;
      }
      sync();
    };
    row.addEventListener("click", e => {
      if (e.target === checkbox || e.target.closest(".qty-stepper") || e.target.closest("[data-konut-edit]")) return;
      if (isKonutTipi && !checkbox.checked) {
        openKonutTipiModal(itemId, () => renderFlow());
        return;
      }
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });
  $all("[data-konut-edit]", root).forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    openKonutTipiModal(btn.dataset.konutEdit, () => renderFlow());
  });
  $all(".calc-item-row[data-custom]", root).forEach(row => {
    const ciId = row.dataset.custom;
    const ci = FLOW.customItems.find(x => x.id === ciId);
    const checkbox = row.querySelector(".custom-check");
    checkbox.onchange = e => { ci.included = e.target.checked; row.classList.toggle("checked", ci.included); updateItemsCornerWidget(); };
    row.addEventListener("click", e => {
      if (e.target === checkbox || e.target.closest(".qty-stepper") || e.target.closest("[data-custom-edit]")) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event("change"));
    });
  });
  $all("[data-qty-action]", root).forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    const delta = btn.dataset.qtyAction === "plus" ? 1 : -1;
    const itemId = btn.dataset.item;
    let target;
    if (itemId) target = FLOW.lineState[itemId];
    else target = FLOW.customItems.find(x => x.id === btn.dataset.custom);
    if (!target) return;
    if (itemId && KONUT_TIPI_ITEM_IDS.includes(itemId) && delta > 0 && !target.konutTipi) {
      openKonutTipiModal(itemId, () => renderFlow());
      return;
    }
    target.qty = Math.max(0, (target.qty || 0) + delta);
    target.included = target.qty > 0;
    renderFlow();
  });
  $all("[data-custom-edit]", root).forEach(btn => btn.onclick = e => {
    e.stopPropagation();
    const ci = FLOW.customItems.find(x => x.id === btn.dataset.customEdit);
    openCustomItemModal(ci);
  });
  const addCustomBtn = $("#calcAddCustomItemBtn");
  if (addCustomBtn) addCustomBtn.onclick = () => openCustomItemModal(null);
  const noteEl = $("#calcNote"); if (noteEl) noteEl.oninput = e => { FLOW.note = e.target.value; };
  const adsAddBtn = $("#adsAddBtn");
  if (adsAddBtn) adsAddBtn.onclick = () => { FLOW.adsDraftLive = FLOW.ads ? FLOW.ads.draft : emptyAdsDraft(); FLOW.step = "ads-1"; renderFlow(); };
  const adsEditBtn = $("#adsEditBtn");
  if (adsEditBtn) adsEditBtn.onclick = () => { FLOW.adsDraftLive = FLOW.ads.draft; FLOW.step = "ads-1"; renderFlow(); };
  const adsRemoveBtn = $("#adsRemoveBtn");
  if (adsRemoveBtn) adsRemoveBtn.onclick = () => { FLOW.ads = null; renderFlow(); };
  const itemsBack = $("#itemsBackBtn"); if (itemsBack) itemsBack.onclick = () => { FLOW.step = "gate"; renderFlow(); };
  const itemsContinue = $("#itemsContinueBtn");
  if (itemsContinue) itemsContinue.onclick = () => { FLOW.step = "reveal"; renderFlow(); };
  if ($("#calcItemsList")) updateItemsCornerWidget();

  // ADS WIZARD
  const d = FLOW.adsDraftLive;
  const reelsMinus = $("#reelsMinus"); if (reelsMinus) reelsMinus.onclick = () => { d.reelsAdedi = Math.max(0, d.reelsAdedi - 1); renderFlow(); };
  const reelsPlus = $("#reelsPlus"); if (reelsPlus) reelsPlus.onclick = () => { d.reelsAdedi = Math.min(50, d.reelsAdedi + 1); renderFlow(); };
  const gunMinus = $("#gunMinus"); if (gunMinus) gunMinus.onclick = () => { d.yayinGunSayisi = Math.max(1, d.yayinGunSayisi - 1); renderFlow(); };
  const gunPlus = $("#gunPlus"); if (gunPlus) gunPlus.onclick = () => { d.yayinGunSayisi = Math.min(90, d.yayinGunSayisi + 1); renderFlow(); };
  const kitleSlider = $("#kitleSlider");
  if (kitleSlider) kitleSlider.oninput = e => {
    d.hedefKitleBuyuklugu = parseInt(e.target.value, 10);
    $("#kitleVal").textContent = d.hedefKitleBuyuklugu.toLocaleString("tr-TR") + " kişi";
    adsCurrentTotalTRY().then(async trTotal => { const s = await DB.getSettings(); updateFxCorner(s.usdTryRate ? trTotal / s.usdTryRate : 0); });
  };
  $all(".preset-btn", root).forEach(btn => btn.onclick = () => { d.hedefKitleBuyuklugu = Number(btn.dataset.val); renderFlow(); });
  $all("[data-yesno]", root).forEach(card => card.onclick = () => {
    const [field, val] = card.dataset.yesno.split(":");
    d[field] = val === "true";
    renderFlow();
  });
  $all("[data-iletisim]", root).forEach(card => card.onclick = () => { d.iletisimTercihi = card.dataset.iletisim; renderFlow(); });

  // Konum seçici
  const locTabTr = $("#locTabTr"); if (locTabTr) locTabTr.onclick = () => { FLOW.locTab = "tr"; renderFlow(); };
  const locTabDunya = $("#locTabDunya"); if (locTabDunya) locTabDunya.onclick = () => { FLOW.locTab = "dunya"; renderFlow(); };
  const trIlSelect = $("#trIlSelect");
  if (trIlSelect) trIlSelect.onchange = e => { FLOW.trSeciliIl = e.target.value || null; FLOW.trSeciliIlceler = new Set(); FLOW.trTumIl = false; renderFlow(); };
  const trTumIl = $("#trTumIl");
  if (trTumIl) trTumIl.onchange = async e => {
    FLOW.trTumIl = e.target.checked;
    const trData = await VertexLocations.trVeriYukle();
    const il = trData.find(x => x.kod === FLOW.trSeciliIl);
    FLOW.trSeciliIlceler = FLOW.trTumIl ? new Set(il.ilceler) : new Set();
    renderFlow();
  };
  $all(".ilce-chip", root).forEach(chip => chip.onclick = () => {
    const ilce = chip.dataset.ilce;
    if (!FLOW.trSeciliIlceler) FLOW.trSeciliIlceler = new Set();
    if (FLOW.trSeciliIlceler.has(ilce)) FLOW.trSeciliIlceler.delete(ilce); else FLOW.trSeciliIlceler.add(ilce);
    renderFlow();
  });
  const trEkleBtn = $("#trKonumEkleBtn");
  if (trEkleBtn) trEkleBtn.onclick = async () => {
    const trData = await VertexLocations.trVeriYukle();
    const settings = await DB.getSettings();
    const il = trData.find(x => x.kod === FLOW.trSeciliIl);
    const carpan = VertexLocations.ilCarpani(il.buyuksehir, settings);
    if (FLOW.trTumIl || !FLOW.trSeciliIlceler || FLOW.trSeciliIlceler.size === 0) {
      d.konumlar.push({ etiket: `${il.il} (Tüm İl)`, carpan });
    } else {
      FLOW.trSeciliIlceler.forEach(ilce => d.konumlar.push({ etiket: `${il.il} / ${ilce}`, carpan }));
    }
    FLOW.trSeciliIl = null; FLOW.trSeciliIlceler = new Set(); FLOW.trTumIl = false;
    renderFlow();
  };
  const dunyaUlkeSelect = $("#dunyaUlkeSelect");
  if (dunyaUlkeSelect) dunyaUlkeSelect.onchange = e => { FLOW.dunyaSeciliUlke = e.target.value; FLOW.dunyaArama = ""; renderFlow(); };
  const dunyaSehirArama = $("#dunyaSehirArama");
  if (dunyaSehirArama) { dunyaSehirArama.oninput = e => { FLOW.dunyaArama = e.target.value; renderFlow(); }; dunyaSehirArama.focus(); }
  $all(".loc-search-item[data-sehir]", root).forEach(item => item.onclick = async () => {
    const world = await VertexLocations.dunyaVeriYukle();
    const settings = await DB.getSettings();
    const ulke = world.countries.find(u => u.kod === FLOW.dunyaSeciliUlke);
    const carpan = VertexLocations.ulkeCarpani(ulke.seviye, settings);
    d.konumlar.push({ etiket: `${item.dataset.sehir}, ${ulke.ad}`, carpan });
    FLOW.dunyaSeciliUlke = ""; FLOW.dunyaArama = "";
    renderFlow();
  });
  $all("[data-loc-del]", root).forEach(btn => btn.onclick = () => { d.konumlar.splice(Number(btn.dataset.locDel), 1); renderFlow(); });

  const adsBack = $("#adsBackBtn");
  if (adsBack) adsBack.onclick = () => {
    const n = adsStepNumber();
    if (n === 1) { FLOW.step = "items"; } else { FLOW.step = "ads-" + (n - 1); }
    renderFlow();
  };
  const adsNext = $("#adsNextBtn");
  if (adsNext) adsNext.onclick = async () => {
    const n = adsStepNumber();
    if (n < 8) { FLOW.step = "ads-" + (n + 1); renderFlow(); return; }
    const settings = await DB.getSettings();
    const result = VertexAdsCalc.yedekFormulHesapla(FLOW.adsDraftLive, settings);
    FLOW.ads = { draft: FLOW.adsDraftLive, result };
    FLOW.adsDraftLive = null;
    FLOW.step = "items";
    renderFlow();
  };

  // REVEAL
  const revealBack = $("#revealBackBtn"); if (revealBack) revealBack.onclick = () => { FLOW.step = "items"; renderFlow(); };
  const revealPdf = $("#revealPdfBtn"); if (revealPdf) revealPdf.onclick = () => window.print();
  const revealSave = $("#revealSaveBtn"); if (revealSave) revealSave.onclick = handleSaveFlowQuote;
}

async function updateItemsCornerWidget() {
  const settings = await DB.getSettings();
  const trTotal = await sectorItemsTotalTRY();
  const usd = settings.usdTryRate ? trTotal / settings.usdTryRate : 0;
  updateFxCorner(usd);
}

// Ekstra (özel) kalem adı/fiyatı — ekranda sürekli görünmesin diye ayrı bir
// modal içinde bir kerelik girilir (müşteri karşıda dururken kalıcı rakam
// görünmemesi için).
function openCustomItemModal(existing) {
  openModal(`
    <h3>${existing ? "Kalemi Düzenle" : "Ekstra Kalem Ekle"}</h3>
    <div class="field"><label>Kalem adı</label><input type="text" id="ciName" value="${existing ? escapeHtml(existing.name) : ""}" placeholder="Örn. Özel drone rota planlama"></div>
    <div class="field"><label>Birim</label><input type="text" id="ciUnit" value="${existing ? escapeHtml(existing.unit || "adet") : "adet"}"></div>
    <div class="field"><label>Fiyat (₺)</label><input type="number" id="ciPrice" min="0" value="${existing ? existing.price : 0}"></div>
    <div class="modal-actions">
      ${existing ? '<button class="btn btn-danger" id="ciDeleteBtn" style="margin-right:auto;">Sil</button>' : ""}
      <button class="btn btn-secondary" id="ciCancelBtn">Vazgeç</button>
      <button class="btn btn-primary" id="ciSaveBtn">Kaydet</button>
    </div>
  `);
  $("#ciCancelBtn").onclick = closeModal;
  const deleteBtn = $("#ciDeleteBtn");
  if (deleteBtn) deleteBtn.onclick = () => {
    FLOW.customItems = FLOW.customItems.filter(x => x.id !== existing.id);
    closeModal();
    renderFlow();
  };
  $("#ciSaveBtn").onclick = () => {
    const name = $("#ciName").value.trim();
    const unit = $("#ciUnit").value.trim() || "adet";
    const price = Number($("#ciPrice").value) || 0;
    if (!name) { toast("Kalem adı gerekli."); return; }
    if (existing) {
      existing.name = name; existing.unit = unit; existing.price = price;
    } else {
      FLOW.customItems.push({ id: uid("custom"), name, unit, qty: 1, price, included: true });
    }
    closeModal();
    renderFlow();
  };
}

// 360° Sanal Tur kalemleri için konut tipi (1+1...Villa) seçtiren, fiyatı
// asla göstermeyen pop-up. Bir tip seçilene kadar kalem "dahil" sayılmaz.
async function openKonutTipiModal(itemId, onDone) {
  const sector = await DB.getSector(FLOW.sectorId);
  const item = sector.items.find(i => i.id === itemId);
  const st = FLOW.lineState[itemId];
  const settings = await DB.getSettings();
  const tierPrices = (settings.konutTipiFiyatlari && settings.konutTipiFiyatlari[itemId]) || {};

  openModal(`
    <h3>Konut Tipi Seç</h3>
    <div class="flow-sub" style="margin:-8px 0 16px;">${escapeHtml(item ? item.name : "")}</div>
    <div class="konut-tipi-row">
      ${KONUT_TIPI_TIERS.map(t => `<button type="button" class="konut-tipi-btn ${st.konutTipi === t.key ? "selected" : ""}" data-konut-tier="${t.key}">${escapeHtml(t.label)}</button>`).join("")}
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="konutCancelBtn">Vazgeç</button>
    </div>
  `);

  $("#konutCancelBtn").onclick = closeModal;
  $all("[data-konut-tier]").forEach(btn => btn.onclick = () => {
    const tierKey = btn.dataset.konutTier;
    st.konutTipi = tierKey;
    st.price = (tierPrices[tierKey] != null) ? tierPrices[tierKey] : (item ? item.price : st.price);
    st.included = true;
    if (!st.qty || st.qty < 1) st.qty = 1;
    closeModal();
    onDone();
  });
}

async function handleSaveFlowQuote() {
  const sector = await DB.getSector(FLOW.sectorId);
  const settings = await DB.getSettings();
  const items = [];
  let totalTRY = 0;
  sector.items.forEach(item => {
    const st = FLOW.lineState[item.id];
    if (st && st.included) {
      const lt = st.qty * st.price;
      totalTRY += lt;
      const name = st.konutTipi ? `${item.name} — ${konutTipiLabel(st.konutTipi)}` : item.name;
      items.push({ itemId: item.id, name, qty: st.qty, unitPrice: st.price, lineTotal: lt });
    }
  });
  FLOW.customItems.forEach(ci => {
    if (ci.included) {
      const lt = ci.qty * ci.price;
      totalTRY += lt;
      items.push({ itemId: ci.id, name: ci.name || "Ekstra kalem", qty: ci.qty, unitPrice: ci.price, lineTotal: lt });
    }
  });
  if (FLOW.ads) {
    const k = FLOW.ads.result.kalemler;
    const adsLineTotal = FLOW.ads.result.genelToplam;
    totalTRY += adsLineTotal;
    items.push({ itemId: "ads_bundle", name: "Reklam Yönetimi (detaylı hesaplama)", qty: 1, unitPrice: adsLineTotal, lineTotal: adsLineTotal });
  }

  if (!items.length) { toast("Lütfen en az bir hizmet kalemi seçin."); return; }

  let customer = await findOrCreateCustomer();
  const totalUSD = settings.usdTryRate ? totalTRY / settings.usdTryRate : 0;

  await DB.addQuote({
    customerId: customer.id,
    sectorId: FLOW.sectorId,
    items,
    totalTRY,
    totalUSD,
    usdTryRateUsed: settings.usdTryRate,
    status: "bekliyor",
    followUpDate: addDaysISO(10),
    note: FLOW.note || ""
  });

  toast("Teklif kaydedildi.");
  exitFlow();
  await refreshReminderBadge();
}

async function findOrCreateCustomer() {
  const customers = await DB.getCustomers();
  const existing = customers.find(c => c.name.trim().toLowerCase() === FLOW.customer.name.trim().toLowerCase());
  if (existing) return existing;
  return DB.addCustomer({
    name: FLOW.customer.name,
    phone: FLOW.customer.phone,
    sectorId: FLOW.sectorId,
    notes: "",
    isTanimi: FLOW.customer.isTanimi
  });
}

// ================= MÜŞTERİLER =================
async function renderCustomers() {
  const customers = await DB.getCustomers();
  const reminders = await DB.getReminders();
  const sectors = await DB.getSectors();

  function draw(list) {
    if (!list.length) {
      $("#customerTableWrap").innerHTML = `<div class="empty-state">Henüz müşteri eklenmedi.</div>`;
      return;
    }
    $("#customerTableWrap").innerHTML = `
      <table class="customer-table">
        <thead><tr><th>İsim</th><th>Telefon</th><th>Sektör</th><th>Adres</th><th>Sonraki Hatırlatma</th></tr></thead>
        <tbody>
          ${list.map(c => {
            const sector = sectors.find(s => s.id === c.sectorId);
            const rem = reminders.filter(r => r.customerId === c.id).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate))[0];
            return `
              <tr data-id="${c.id}">
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${escapeHtml(c.phone || "-")}</td>
                <td>${sector ? `<span class="tag-chip">${sector.icon} ${escapeHtml(sector.name)}</span>` : "-"}</td>
                <td>${c.address ? `<a class="map-link" href="${mapsLink(c.address)}" target="_blank" onclick="event.stopPropagation()">${escapeHtml(c.address.slice(0, 30))}${c.address.length > 30 ? "…" : ""}</a>` : "-"}</td>
                <td>${rem ? (rem.isOverdue ? "⚠️ " : rem.isToday ? "🔔 " : "") + formatDateTR(rem.followUpDate) : "-"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
    $all("#customerTableWrap tr[data-id]").forEach(row => {
      row.onclick = () => openCustomerDetail(row.dataset.id);
    });
  }

  draw(customers);

  $("#customerSearch").oninput = (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = customers.filter(c => c.name.toLowerCase().includes(q) || (c.phone || "").includes(q));
    draw(filtered);
  };

  $("#addCustomerBtn").onclick = () => openCustomerForm(null, sectors[0].id, async () => { await renderCustomers(); });
}

async function openCustomerForm(existing, defaultSectorId, onSaved) {
  const sectors = await DB.getSectors();
  openModal(`
    <h3>${existing ? "Müşteriyi Düzenle" : "Yeni Müşteri"}</h3>
    <div class="field"><label>İsim</label><input type="text" id="cfName" value="${existing ? escapeHtml(existing.name) : ""}"></div>
    <div class="field"><label>Telefon</label><input type="tel" id="cfPhone" value="${existing ? escapeHtml(existing.phone) : ""}"></div>
    <div class="field"><label>Sektör</label>
      <select id="cfSector">${sectors.map(s => `<option value="${s.id}" ${((existing ? existing.sectorId : defaultSectorId) === s.id) ? "selected" : ""}>${s.icon} ${escapeHtml(s.name)}</option>`).join("")}</select>
    </div>
    <div class="field"><label>Adres</label><input type="text" id="cfAddress" value="${existing ? escapeHtml(existing.address) : ""}" placeholder="Otomatik harita linki oluşturulur"></div>
    <div class="field"><label>Not</label><textarea id="cfNotes" rows="2">${existing ? escapeHtml(existing.notes) : ""}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="cfCancelBtn">Vazgeç</button>
      <button class="btn btn-primary" id="cfSaveBtn">Kaydet</button>
    </div>
  `);
  $("#cfCancelBtn").onclick = closeModal;
  $("#cfSaveBtn").onclick = async () => {
    const data = {
      name: $("#cfName").value.trim() || "İsimsiz Müşteri",
      phone: $("#cfPhone").value.trim(),
      sectorId: $("#cfSector").value,
      address: $("#cfAddress").value.trim(),
      notes: $("#cfNotes").value.trim()
    };
    let saved;
    if (existing) saved = await DB.updateCustomer(existing.id, data);
    else saved = await DB.addCustomer(data);
    closeModal();
    toast("Müşteri kaydedildi.");
    if (onSaved) onSaved(saved);
  };
}

async function openCustomerDetail(customerId) {
  const customer = await DB.getCustomer(customerId);
  if (!customer) return;
  const quotes = await DB.getQuotesForCustomer(customerId);
  const sectors = await DB.getSectors();
  const sector = sectors.find(s => s.id === customer.sectorId);

  const statusLabel = { onaylandi: "✅ Onaylandı", bekliyor: "⏳ Bekliyor", reddedildi: "❌ Reddedildi" };

  openModal(`
    <h3>${escapeHtml(customer.name)}</h3>
    <p class="muted">
      ${customer.phone ? escapeHtml(customer.phone) + " · " : ""}${sector ? sector.icon + " " + escapeHtml(sector.name) : ""}
    </p>
    ${customer.address ? `<p><a class="map-link" href="${mapsLink(customer.address)}" target="_blank">📍 ${escapeHtml(customer.address)}</a></p>` : ""}
    ${customer.notes ? `<p class="muted">${escapeHtml(customer.notes)}</p>` : ""}
    <h3 style="margin-top:20px;">Teklif Geçmişi</h3>
    <div style="max-height:220px; overflow-y:auto;">
      ${quotes.length ? quotes.map(q => `
        <div style="padding:10px 0; border-top:1px solid var(--border);">
          <div><strong>${formatTRY(q.totalTRY)}</strong> — ${statusLabel[q.status] || q.status}</div>
          <div class="muted" style="font-size:0.8rem;">${formatDateTR(q.createdAt.slice(0,10))}${q.followUpDate ? " · takip: " + formatDateTR(q.followUpDate) : ""}</div>
        </div>
      `).join("") : `<p class="muted">Henüz teklif oluşturulmadı.</p>`}
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger" id="cdDeleteBtn">Sil</button>
      <button class="btn btn-secondary" id="cdEditBtn">Düzenle</button>
      <button class="btn btn-primary" id="cdCloseBtn">Kapat</button>
    </div>
  `);
  $("#cdCloseBtn").onclick = closeModal;
  $("#cdEditBtn").onclick = () => openCustomerForm(customer, customer.sectorId, async () => { closeModal(); await renderCustomers(); await renderDashboard(); });
  $("#cdDeleteBtn").onclick = async () => {
    if (confirm(`${customer.name} silinsin mi? Tüm teklif geçmişi de silinecek.`)) {
      await DB.deleteCustomer(customerId);
      closeModal();
      toast("Müşteri silindi.");
      await renderCustomers();
      await refreshReminderBadge();
    }
  };
}

// ================= GALERİ =================
async function renderGallery() {
  const settings = await DB.getSettings();
  const grid = $("#galleryGrid");

  if (!settings.instagramPosts || !settings.instagramPosts.length) {
    grid.innerHTML = `<div class="empty-state">Henüz gönderi eklenmedi. Ayarlar &gt; Galeri bölümünden Instagram gönderi linki ekleyebilirsin.</div>`;
  } else {
    grid.innerHTML = settings.instagramPosts.map(url => `
      <div class="gallery-card">
        <div class="ig-embed-wrap">
          <blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(url)}" data-instgrm-version="14" style="margin:0;width:100%;"></blockquote>
        </div>
        <div class="gallery-card-actions">
          <button class="btn btn-sm btn-secondary share-ig-btn" data-url="${escapeHtml(url)}">📤 Paylaş / AirDrop</button>
        </div>
      </div>
    `).join("");

    // Instagram embed script'ini yükle (varsa yeniden işlet)
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const s = document.createElement("script");
      s.src = "https://www.instagram.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    }

    $all(".share-ig-btn", grid).forEach(btn => {
      btn.onclick = async () => {
        const url = btn.dataset.url;
        if (navigator.share) {
          try { await navigator.share({ title: "Çalışma Örneği", url }); } catch (e) { /* kullanıcı iptal etti */ }
        } else {
          await navigator.clipboard.writeText(url);
          toast("Link kopyalandı (bu cihazda paylaşım menüsü desteklenmiyor).");
        }
      };
    });
  }

  $("#galleryManageBtn").onclick = () => showTab("settings");
}

// ================= AYARLAR =================
async function renderSettings() {
  const settings = await DB.getSettings();

  $("#settingsBusinessName").value = settings.businessName || "";
  $("#settingsBusinessName").onchange = async (e) => {
    await DB.updateSettings({ businessName: e.target.value });
    await refreshBrand();
  };

  $("#logoPreview").innerHTML = settings.logoDataUrl ? `<img src="${settings.logoDataUrl}">` : "📸";
  $("#logoFileInput").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await DB.updateSettings({ logoDataUrl: reader.result });
      await renderSettings();
      await refreshBrand();
      toast("Logo güncellendi.");
    };
    reader.readAsDataURL(file);
  };

  $("#savePinBtn").onclick = async () => {
    const val = $("#settingsNewPin").value.trim();
    if (val.length < 4) { toast("PIN en az 4 haneli olmalı."); return; }
    await DB.updateSettings({ pin: val });
    $("#settingsNewPin").value = "";
    toast("PIN güncellendi.");
  };

  // Döviz kuru
  function drawRate(s) {
    $("#currentRateText").textContent = s.usdTryRate ? `1 USD = ${s.usdTryRate.toFixed(2)} TL` : "-";
    $("#rateSourceText").textContent = (s.rateSource || "Henüz güncellenmedi") +
      (s.lastRateUpdate ? " · " + new Date(s.lastRateUpdate).toLocaleString("tr-TR") : "");
  }
  drawRate(settings);

  $("#updateRateBtn").onclick = async () => {
    $("#updateRateBtn").textContent = "Güncelleniyor...";
    $("#updateRateBtn").disabled = true;
    try {
      const result = await updateExchangeRate();
      await DB.updateSettings({ usdTryRate: result.rate, rateSource: result.source, lastRateUpdate: result.updatedAt });
      drawRate(await DB.getSettings());
      toast("Kur güncellendi: " + result.source);
    } catch (e) {
      toast("Kur güncellenemedi. İnternet bağlantını kontrol et.");
      console.error(e);
    } finally {
      $("#updateRateBtn").textContent = "🔄 Kur ve Analiz Güncelle";
      $("#updateRateBtn").disabled = false;
    }
  };

  // Fiyat listesi
  const sectors = await DB.getSectors();
  const sectorSelect = $("#settingsSectorSelect");
  const prevVal = sectorSelect.value;
  sectorSelect.innerHTML = sectors.map(s => `<option value="${s.id}">${s.icon} ${escapeHtml(s.name)}</option>`).join("");
  if (prevVal) sectorSelect.value = prevVal;
  sectorSelect.onchange = drawPriceTable;

  async function drawPriceTable() {
    const sector = await DB.getSector(sectorSelect.value);
    const wrap = $("#settingsPriceTable");
    wrap.innerHTML = `
      <table class="price-table">
        <thead><tr><th>Hizmet</th><th>Birim</th><th>Fiyat (TL)</th><th>Durum</th><th></th></tr></thead>
        <tbody>
          ${sector.items.map(item => `
            <tr data-id="${item.id}">
              <td><input type="text" class="pt-name" value="${escapeHtml(item.name)}"></td>
              <td><input type="text" class="pt-unit" value="${escapeHtml(item.unit)}" style="width:80px;"></td>
              <td><input type="number" class="pt-price" value="${item.price}"></td>
              <td>${item.verified ? '<span class="tag-chip" style="background:#e2f3e8;color:#1f8a4c;">Antalya verisi</span>' : '<span class="unverified-tag">tahmini</span>'}<br><span class="muted" style="font-size:0.72rem;">${formatDateTR(item.lastReviewed)}</span></td>
              <td><button class="btn btn-sm btn-danger pt-delete">Sil</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
    $all("tr[data-id]", wrap).forEach(row => {
      const itemId = row.dataset.id;
      const save = async () => {
        await DB.updateItem(sectorSelect.value, itemId, {
          name: row.querySelector(".pt-name").value,
          unit: row.querySelector(".pt-unit").value,
          price: Number(row.querySelector(".pt-price").value) || 0,
          lastReviewed: todayISO()
        });
      };
      row.querySelector(".pt-name").onchange = save;
      row.querySelector(".pt-unit").onchange = save;
      row.querySelector(".pt-price").onchange = save;
      row.querySelector(".pt-delete").onclick = async () => {
        if (confirm("Bu hizmet kalemi silinsin mi?")) {
          await DB.deleteItem(sectorSelect.value, itemId);
          await drawPriceTable();
          toast("Kalem silindi.");
        }
      };
    });
  }
  await drawPriceTable();

  $("#addItemBtn").onclick = async () => {
    const name = $("#newItemName").value.trim();
    const unit = $("#newItemUnit").value.trim() || "adet";
    const price = Number($("#newItemPrice").value) || 0;
    if (!name) { toast("Hizmet adı gerekli."); return; }
    await DB.addItem(sectorSelect.value, { name, unit, price });
    $("#newItemName").value = ""; $("#newItemUnit").value = ""; $("#newItemPrice").value = "";
    await drawPriceTable();
    toast("Yeni kalem eklendi.");
  };

  // Reklam Yönetimi sihirbazı — varsayılan ayarlar
  const ADS_SETTINGS_FIELDS = [
    ["reelsUretimFiyati", "Reels üretim birim fiyatı (₺)", 1],
    ["reelsHizmetBedeli", "Reels hizmet bedeli (₺)", 1],
    ["droneUretimFiyati", "Drone çekim üretim fiyatı (₺)", 1],
    ["droneHizmetBedeli", "Drone hizmet bedeli (₺)", 1],
    ["metaYonetimOrani", "Meta yönetim oranı (0-1)", 0.01],
    ["tiktokYonetimOrani", "TikTok yönetim oranı (0-1)", 0.01],
    ["yedekCpmMeta", "Meta CPM taban (₺/1000 gösterim)", 1],
    ["yedekCpmTikTok", "TikTok CPM taban (₺/1000 gösterim)", 1],
    ["erisimVerimlilikKatsayisi", "Erişim verimlilik katsayısı (0-1)", 0.01],
    ["carpanBuyuksehir", "Konum çarpanı — Türkiye Büyükşehir", 0.1],
    ["carpanDigerIl", "Konum çarpanı — Türkiye Diğer İl", 0.1],
    ["carpanDunyaTier1", "Konum çarpanı — Dünya Gelişmiş Ülkeler", 0.1],
    ["carpanDunyaTier2", "Konum çarpanı — Dünya Orta Seviye Ülkeler", 0.1],
    ["carpanDunyaTier3", "Konum çarpanı — Dünya Diğer Ülkeler", 0.1]
  ];
  const adsGrid = $("#adsSettingsGrid");
  if (adsGrid) {
    adsGrid.innerHTML = ADS_SETTINGS_FIELDS.map(([key, label, step]) => `
      <label>${label}</label>
      <input type="number" step="${step}" class="ads-setting-input" data-key="${key}" value="${settings[key]}">
    `).join("");
    $all(".ads-setting-input", adsGrid).forEach(input => {
      input.onchange = async () => {
        await DB.updateSettings({ [input.dataset.key]: Number(input.value) || 0 });
        toast("Ayar güncellendi.");
      };
    });
  }

  // 360° Sanal Tur — konut tipine göre fiyat kademeleri
  const KONUT_TIPI_SETTINGS_ITEMS = [
    { itemId: "e_360", label: "Statik QR/Link" },
    { itemId: "e_360_dinamik", label: "Dinamik QR/Link" }
  ];
  const konutGrid = $("#konutTipiSettingsGrid");
  if (konutGrid) {
    konutGrid.innerHTML = KONUT_TIPI_SETTINGS_ITEMS.map(cfg => `
      <div class="konut-tipi-settings-group">
        <h4>${escapeHtml(cfg.label)}</h4>
        <div class="ads-settings-grid">
          ${KONUT_TIPI_TIERS.map(t => `
            <label>${t.label}</label>
            <input type="number" step="1" class="konut-tipi-price-input" data-item="${cfg.itemId}" data-tier="${t.key}"
              value="${(settings.konutTipiFiyatlari && settings.konutTipiFiyatlari[cfg.itemId] && settings.konutTipiFiyatlari[cfg.itemId][t.key]) || 0}">
          `).join("")}
        </div>
      </div>
    `).join("");
    $all(".konut-tipi-price-input", konutGrid).forEach(input => {
      input.onchange = async () => {
        const cur = await DB.getSettings();
        const nested = { ...(cur.konutTipiFiyatlari || {}) };
        nested[input.dataset.item] = { ...(nested[input.dataset.item] || {}), [input.dataset.tier]: Number(input.value) || 0 };
        await DB.updateSettings({ konutTipiFiyatlari: nested });
        toast("Fiyat güncellendi.");
      };
    });
  }

  // Galeri / Instagram
  $("#settingsIgHandle").value = settings.instagramHandle || "";
  $("#settingsIgHandle").onchange = async (e) => { await DB.updateSettings({ instagramHandle: e.target.value }); };

  function drawIgList(s) {
    $("#igPostList").innerHTML = (s.instagramPosts || []).map((url, i) => `
      <div class="ig-post-row">
        <a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url.slice(0, 50))}${url.length > 50 ? "…" : ""}</a>
        <button class="btn btn-sm btn-danger ig-remove" data-i="${i}">Sil</button>
      </div>
    `).join("") || `<p class="muted">Henüz gönderi linki eklenmedi.</p>`;
    $all(".ig-remove").forEach(btn => {
      btn.onclick = async () => {
        const cur = await DB.getSettings();
        cur.instagramPosts.splice(Number(btn.dataset.i), 1);
        await DB.updateSettings({ instagramPosts: cur.instagramPosts });
        drawIgList(await DB.getSettings());
      };
    });
  }
  drawIgList(settings);

  $("#addIgPostBtn").onclick = async () => {
    const url = $("#newIgPostUrl").value.trim();
    if (!url.startsWith("http")) { toast("Geçerli bir Instagram linki girin."); return; }
    const cur = await DB.getSettings();
    const posts = cur.instagramPosts || [];
    posts.push(url);
    await DB.updateSettings({ instagramPosts: posts });
    $("#newIgPostUrl").value = "";
    drawIgList(await DB.getSettings());
    toast("Gönderi eklendi.");
  };

  // Yedekleme
  $("#exportBtn").onclick = async () => {
    const data = await DB.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `teklif-sistemi-yedek-${todayISO()}.json`;
    a.click();
  };
  $("#importFileInput").onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        await DB.importAll(data);
        toast("Yedek yüklendi. Sayfa yenileniyor...");
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        toast("Dosya okunamadı, geçerli bir yedek dosyası seçin.");
      }
    };
    reader.readAsText(file);
  };

  $("#resetBtn").onclick = async () => {
    if (confirm("TÜM veriler (müşteriler, teklifler, fiyat değişiklikleri) silinip varsayılana dönecek. Emin misin?")) {
      await DB.resetToDefaults();
      toast("Sıfırlandı. Sayfa yenileniyor...");
      setTimeout(() => location.reload(), 1000);
    }
  };
}

// ---------------- Başlangıç ----------------
document.addEventListener("DOMContentLoaded", () => {
  initLockScreen();
});
