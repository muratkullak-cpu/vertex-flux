/**
 * locations.js — Konum verisi (Türkiye il/ilçe + Dünya ülke/şehir) yükleyici.
 *
 * NOT: data/tr-locations.json ve data/world-locations.json şu an GEÇİCİ (yer
 * tutucu) veri içeriyor — 81 il tam listesi doğru, ama ilçe/şehir listeleri
 * Vertex Flux'un orijinal tam listesi (973 ilçe / ~133.000 şehir) yerine
 * temsili bir alt kümedir. Orijinal dosyalar cihazdan alınınca bu dosyaların
 * üzerine yazılacak, kod tarafında hiçbir değişiklik gerekmeyecek.
 */

let _trVeri = null;
let _dunyaVeri = null;

async function trVeriYukle() {
  if (!_trVeri) {
    const resp = await fetch('data/tr-locations.json');
    _trVeri = await resp.json();
  }
  return _trVeri;
}

async function dunyaVeriYukle() {
  if (!_dunyaVeri) {
    const resp = await fetch('data/world-locations.json');
    _dunyaVeri = await resp.json();
  }
  return _dunyaVeri;
}

function ulkeCarpani(seviye, ayarlar) {
  if (seviye === 1) return ayarlar.carpanDunyaTier1;
  if (seviye === 2) return ayarlar.carpanDunyaTier2;
  return ayarlar.carpanDunyaTier3;
}

function ilCarpani(buyuksehirMi, ayarlar) {
  return buyuksehirMi ? ayarlar.carpanBuyuksehir : ayarlar.carpanDigerIl;
}

window.VertexLocations = { trVeriYukle, dunyaVeriYukle, ulkeCarpani, ilCarpani };
