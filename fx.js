/**
 * fx.js — USD/TRY kuru güncelleme
 *
 * Öncelik: TCMB günlük kur XML kaynağı (www.tcmb.gov.tr/kurlar/today.xml).
 * Tarayıcıdan CORS kısıtlaması nedeniyle erişilemezse (bazı kurumsal
 * kaynaklar tarayıcı-dışı istekleri engelliyor), otomatik olarak
 * ücretsiz/CORS-uyumlu bir yedek kur kaynağına düşer ve bunu kullanıcıya
 * AÇIKÇA belirtir (kaynak etiketiyle) — sessizce yanlış kaynak göstermez.
 *
 * NOT: Bu sandbox ortamının kendi ağ erişimi kısıtlı olduğu için TCMB
 * kaynağının tarayıcıdan (gerçek kullanıcı cihazından) çalışıp
 * çalışmadığı bu ortamda doğrulanamadı. Uygulamayı ilk kullandığında
 * Ayarlar > "Kur ve Analiz Güncelle" butonuna basıp hangi kaynağın
 * kullanıldığını (etikette görünür) kontrol et.
 */

async function fetchTcmbRate() {
  const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", { mode: "cors" });
  if (!res.ok) throw new Error("TCMB yanıt vermedi: " + res.status);
  const text = await res.text();
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const currencies = xml.getElementsByTagName("Currency");
  for (let i = 0; i < currencies.length; i++) {
    const cur = currencies[i];
    if (cur.getAttribute("CurrencyCode") === "USD") {
      const satisEl = cur.getElementsByTagName("BanknoteSelling")[0] || cur.getElementsByTagName("ForexSelling")[0];
      const rate = satisEl ? parseFloat(satisEl.textContent.replace(",", ".")) : NaN;
      if (!isNaN(rate) && rate > 0) return rate;
    }
  }
  throw new Error("TCMB XML içinde USD bulunamadı");
}

async function fetchFallbackRate() {
  // Ücretsiz, key gerektirmeyen, CORS destekli yedek kaynak.
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!res.ok) throw new Error("Yedek kur kaynağı yanıt vermedi: " + res.status);
  const data = await res.json();
  const rate = data && data.rates && data.rates.TRY;
  if (!rate) throw new Error("Yedek kaynakta TRY kuru bulunamadı");
  return rate;
}

/**
 * Kuru günceller. Dönüş: { rate, source, updatedAt }
 * Hem TCMB hem yedek kaynak başarısız olursa hata fırlatır — çağıran taraf
 * (app.js) bunu yakalayıp kullanıcıya "internet bağlantını kontrol et" der.
 */
async function updateExchangeRate() {
  try {
    const rate = await fetchTcmbRate();
    return { rate, source: "TCMB (Merkez Bankası)", updatedAt: new Date().toISOString() };
  } catch (e) {
    console.warn("TCMB kaynağı alınamadı, yedek kaynağa geçiliyor:", e.message);
    const rate = await fetchFallbackRate();
    return { rate, source: "Piyasa kuru (yedek kaynak — TCMB'ye ulaşılamadı)", updatedAt: new Date().toISOString() };
  }
}

function formatTRY(amount) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(amount);
}

function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
