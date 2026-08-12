/**
 * ads-calc.js — Reklam Yönetimi hesaplama motoru.
 * Vertex Flux'un js/calc.js dosyasındaki "Yedek Formül" mantığının birebir
 * portu. İletişim tercihi (DM/WhatsApp/Yorum/Beğeni/Takipçi) SADECE bilgi
 * amaçlıdır — fiyatı etkilemez (Vertex Flux'taki orijinal davranışla aynı,
 * kullanıcı ile netleştirildi).
 */

function ortalamaKonumCarpani(konumlar) {
  if (!konumlar.length) return 1;
  const toplam = konumlar.reduce((acc, k) => acc + k.carpan, 0);
  return toplam / konumlar.length;
}

function yedekFormulHesapla(teklif, ayarlar) {
  const konumCarpani = ortalamaKonumCarpani(teklif.konumlar);
  const tahminiGercekErisim = teklif.hedefKitleBuyuklugu * ayarlar.erisimVerimlilikKatsayisi;

  const metaToplamButce = (tahminiGercekErisim / 1000) * ayarlar.yedekCpmMeta * konumCarpani * teklif.yayinGunSayisi;
  const tiktokToplamButce = teklif.tiktokSecili
    ? (tahminiGercekErisim / 1000) * ayarlar.yedekCpmTikTok * konumCarpani * teklif.yayinGunSayisi
    : 0;

  return finalizeHesap(teklif, ayarlar, {
    gercekErisimOrtalama: Math.round(tahminiGercekErisim),
    konumCarpani,
    metaToplamButce,
    tiktokToplamButce
  });
}

function finalizeHesap(teklif, ayarlar, { gercekErisimOrtalama, konumCarpani, metaToplamButce, tiktokToplamButce }) {
  const reelsUretimToplam = teklif.reelsAdedi * ayarlar.reelsUretimFiyati;
  const reelsHizmetToplam = teklif.reelsAdedi * ayarlar.reelsHizmetBedeli;
  const droneUretim = teklif.droneSecili ? ayarlar.droneUretimFiyati : 0;
  const droneHizmet = teklif.droneSecili ? ayarlar.droneHizmetBedeli : 0;

  const reklamYonetimHizmetBedeli =
    (metaToplamButce * ayarlar.metaYonetimOrani) +
    (tiktokToplamButce * ayarlar.tiktokYonetimOrani);

  const toplamUretimBedeli = reelsUretimToplam + droneUretim;
  const toplamHizmetBedeli = reelsHizmetToplam + droneHizmet + reklamYonetimHizmetBedeli;
  const toplamReklamButcesi = metaToplamButce + tiktokToplamButce;
  const genelToplam = toplamUretimBedeli + toplamHizmetBedeli + toplamReklamButcesi;

  return {
    gercekErisimOrtalama,
    konumCarpani,
    kalemler: {
      reelsUretimToplam, reelsHizmetToplam,
      droneUretim, droneHizmet,
      metaToplamButce, tiktokToplamButce,
      reklamYonetimHizmetBedeli
    },
    toplamUretimBedeli,
    toplamHizmetBedeli,
    toplamReklamButcesi,
    genelToplam
  };
}

window.VertexAdsCalc = { ortalamaKonumCarpani, yedekFormulHesapla, finalizeHesap };
