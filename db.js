/**
 * db.js — Depolama katmanı (Faz 1: localStorage tabanlı)
 *
 * ÖNEMLİ: Bu dosya bilinçli olarak "gerçek bir veritabanı" gibi davranan
 * basit bir arayüz sunar (async fonksiyonlar, tutarlı isimlendirme).
 * Faz 2'de (Mac + iPad arası gerçek zamanlı bulut senkronizasyonu için)
 * bu dosyanın İÇİ Supabase çağrılarıyla değiştirilecek, ama app.js'in
 * geri kalanı DEĞİŞMEYECEK — çünkü hepsi bu DB.* fonksiyonlarını çağırıyor.
 */

const STORAGE_KEY = "teklifSistemi_v1";

function _loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Depolama okunamadı:", e);
    return null;
  }
}

function _saveRaw(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function _seedIfEmpty() {
  let state = _loadRaw();
  if (!state) {
    state = {
      settings: { ...DEFAULT_SETTINGS },
      sectors: JSON.parse(JSON.stringify(DEFAULT_SECTORS)),
      customers: [],
      quotes: []
    };
    _saveRaw(state);
  }
  // Eksik alanları tamamla (ileride yeni alan eklenirse eski veriyi bozmasın)
  let changed = false;
  if (!state.settings) { state.settings = { ...DEFAULT_SETTINGS }; changed = true; }
  for (const k in DEFAULT_SETTINGS) {
    if (!(k in state.settings)) { state.settings[k] = DEFAULT_SETTINGS[k]; changed = true; }
  }
  if (!state.sectors || !state.sectors.length) { state.sectors = JSON.parse(JSON.stringify(DEFAULT_SECTORS)); changed = true; }
  if (!state.customers) { state.customers = []; changed = true; }
  if (!state.quotes) { state.quotes = []; changed = true; }
  if (changed) _saveRaw(state);
  return state;
}

function uid(prefix) {
  return (prefix || "id") + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

const DB = {
  // ---------- Ayarlar ----------
  async getSettings() {
    return _seedIfEmpty().settings;
  },
  async updateSettings(patch) {
    const state = _seedIfEmpty();
    state.settings = { ...state.settings, ...patch };
    _saveRaw(state);
    return state.settings;
  },

  // ---------- Sektörler / Fiyat Kalemleri ----------
  async getSectors() {
    return _seedIfEmpty().sectors;
  },
  async getSector(sectorId) {
    const state = _seedIfEmpty();
    return state.sectors.find(s => s.id === sectorId) || null;
  },
  async updateItem(sectorId, itemId, patch) {
    const state = _seedIfEmpty();
    const sector = state.sectors.find(s => s.id === sectorId);
    if (!sector) return null;
    const item = sector.items.find(i => i.id === itemId);
    if (!item) return null;
    Object.assign(item, patch);
    _saveRaw(state);
    return item;
  },
  async addItem(sectorId, item) {
    const state = _seedIfEmpty();
    const sector = state.sectors.find(s => s.id === sectorId);
    if (!sector) return null;
    const newItem = {
      id: uid("item"),
      name: item.name,
      unit: item.unit || "adet",
      price: Number(item.price) || 0,
      verified: false,
      lastReviewed: new Date().toISOString().slice(0, 10)
    };
    sector.items.push(newItem);
    _saveRaw(state);
    return newItem;
  },
  async deleteItem(sectorId, itemId) {
    const state = _seedIfEmpty();
    const sector = state.sectors.find(s => s.id === sectorId);
    if (!sector) return false;
    sector.items = sector.items.filter(i => i.id !== itemId);
    _saveRaw(state);
    return true;
  },
  async addSector(name, icon) {
    const state = _seedIfEmpty();
    const newSector = { id: uid("sector"), name, icon: icon || "📦", items: [] };
    state.sectors.push(newSector);
    _saveRaw(state);
    return newSector;
  },

  // ---------- Müşteriler ----------
  async getCustomers() {
    const state = _seedIfEmpty();
    return [...state.customers].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  },
  async getCustomer(customerId) {
    const state = _seedIfEmpty();
    return state.customers.find(c => c.id === customerId) || null;
  },
  async addCustomer(data) {
    const state = _seedIfEmpty();
    const customer = {
      id: uid("cust"),
      name: data.name || "İsimsiz Müşteri",
      phone: data.phone || "",
      address: data.address || "",
      sectorId: data.sectorId || "",
      notes: data.notes || "",
      isTanimi: data.isTanimi || "",
      createdAt: new Date().toISOString()
    };
    state.customers.push(customer);
    _saveRaw(state);
    return customer;
  },
  async updateCustomer(customerId, patch) {
    const state = _seedIfEmpty();
    const c = state.customers.find(c => c.id === customerId);
    if (!c) return null;
    Object.assign(c, patch);
    _saveRaw(state);
    return c;
  },
  async deleteCustomer(customerId) {
    const state = _seedIfEmpty();
    state.customers = state.customers.filter(c => c.id !== customerId);
    state.quotes = state.quotes.filter(q => q.customerId !== customerId);
    _saveRaw(state);
    return true;
  },

  // ---------- Teklifler ----------
  async getQuotes() {
    const state = _seedIfEmpty();
    return [...state.quotes].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  },
  async getQuotesForCustomer(customerId) {
    const state = _seedIfEmpty();
    return state.quotes
      .filter(q => q.customerId === customerId)
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  },
  async addQuote(quote) {
    const state = _seedIfEmpty();
    const newQuote = {
      id: uid("quote"),
      customerId: quote.customerId,
      sectorId: quote.sectorId,
      items: quote.items, // [{itemId, name, qty, unitPrice, lineTotal}]
      totalTRY: quote.totalTRY,
      totalUSD: quote.totalUSD,
      usdTryRateUsed: quote.usdTryRateUsed,
      status: quote.status || "bekliyor", // bekliyor | onaylandi | reddedildi
      followUpDate: quote.followUpDate || null,
      note: quote.note || "",
      createdAt: new Date().toISOString()
    };
    state.quotes.push(newQuote);
    _saveRaw(state);
    return newQuote;
  },
  async updateQuote(quoteId, patch) {
    const state = _seedIfEmpty();
    const q = state.quotes.find(q => q.id === quoteId);
    if (!q) return null;
    Object.assign(q, patch);
    _saveRaw(state);
    return q;
  },
  async deleteQuote(quoteId) {
    const state = _seedIfEmpty();
    state.quotes = state.quotes.filter(q => q.id !== quoteId);
    _saveRaw(state);
    return true;
  },

  // ---------- Hatırlatıcılar (teklif.followUpDate üzerinden türetilir) ----------
  async getReminders() {
    const state = _seedIfEmpty();
    const todayStr = new Date().toISOString().slice(0, 10);
    return state.quotes
      .filter(q => q.followUpDate && q.status === "bekliyor")
      .map(q => {
        const customer = state.customers.find(c => c.id === q.customerId);
        return {
          quoteId: q.id,
          customerId: q.customerId,
          customerName: customer ? customer.name : "Bilinmeyen Müşteri",
          customerPhone: customer ? customer.phone : "",
          followUpDate: q.followUpDate,
          totalTRY: q.totalTRY,
          isOverdue: q.followUpDate < todayStr,
          isToday: q.followUpDate === todayStr
        };
      })
      .sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  },

  // ---------- Yedekleme ----------
  async exportAll() {
    return _seedIfEmpty();
  },
  async importAll(state) {
    _saveRaw(state);
    return true;
  },

  // ---------- Sıfırlama (test amaçlı) ----------
  async resetToDefaults() {
    const state = {
      settings: { ...DEFAULT_SETTINGS },
      sectors: JSON.parse(JSON.stringify(DEFAULT_SECTORS)),
      customers: [],
      quotes: []
    };
    _saveRaw(state);
    return state;
  }
};
