# VERTEX Flux istek denetimi — 24 Eylül 2026

Kaynak: Murat'ın paylaştığı “Uygulama Fikri Geliştirme” konuşması ve bu deponun mevcut kodu. “Var” kodun bulunduğunu ifade eder; gerçek müşteriyle uçtan uca doğrulandığı anlamına gelmez. VERTEX'in tablet satış/yönetim paneli ile kuyumcunun müşterilerine açılacak uygulama ayrı ürünlerdir.

| İstek | Durum | Mevcut sınır / kalan iş |
| --- | --- | --- |
| Emlak, kuyum, otel için ayrı çalışma alanları | Var | Sektör ekranları ve ayrı fiyat katalogları bulunuyor. |
| Görselli, sayfa sayfa müşteri sunumları | Var | Üç sektörde temsili stok fotoğraf ve mobil ekran örnekleri var; gerçek müşteri örneği değil. |
| Müşteri, emlak mülkü ve teklif kaydı | Var | Üretimde gerçek müşteri kaydı bulunmadığından teklif → kabul → iş akışı arayüzde uçtan uca denenmedi. |
| İş, takvim, görev, ödeme kaydı | Kısmi | Ekranlar ve veri tabloları var; gerçek işte uçtan uca operasyon doğrulaması bekliyor. |
| Dinamik QR ve aylık tarama raporu | Kısmi | Sabit `/q/` adresi, değişen hedef, rapor ve yönetici tarafından başlatılan hedef kontrolü var. Özel alan adı `go.vertexflux.com`, otomatik periyodik kontrol ve tur erişilemiyorsa otomatik uyarı/onarım yok. QR kod görseli harici QR sağlayıcısından alınır. |
| Yedek ve eksik kayıtları geri yükleme | Kısmi | Kayıt yedeği ve eksik kayıt yüklemesi var; fiyat ayarları/yönetim geçmişi geri yükleme kapsamına alınmamış. |
| Müşteri sunumunda gizli bilgilerin saklanması | Kısmi | Ayrı sunum ve yönetici şifresiyle çıkış var; istenen PIN ile tüm gizli yönetim ekranlarını ayrı yetki seviyelerine bölme tamamlanmadı. |
| Gizli USD tabanı, TCMB kuru, müşteriye TL | Var | Manuel kur güncellemesi ve fiyat düzenleme var; fiyatların ticari doğrulaması ayrıca gerekiyor. |
| Sektör bazlı fiyat seçimi, paketler ve teklif toplamı | Kısmi | Emlak 360° turunda 150 m²/ilk kat baz, başlayan her ek 50 m² +750 ₺ ve sonraki her kat +500 ₺ kuralı uygulanır; portföy sayısı aynı kapsamın tekrarına çarpılır. Kural Murat'ın onayladığı ilk satış önerisidir, piyasa ortalaması olarak doğrulanmadı. Kuyum/otel adet bazlı otomatik tarife ve onaylı nihai ticari fiyatlar yok. |
| Antalya rakipleri, düşük/ortalama/yüksek fiyat ve maliyet marjı kıyası | Kısmi | Kaynaklı piyasa kayıtları ve birkaç yayımlanmış örnek var; kapsamlı ve güncel Antalya karşılaştırması, kaynak bazlı aralık ve tüm hizmetlerin maliyet/marj tablosu yok. |
| Google Ads bağlantısı ve canlı forecast | Kısmi | OAuth ve erişilebilen hesap sorgusu var; kampanya için gerçek gösterim/tıklama/CPC forecast entegrasyonu ve buna göre teklif fiyatlaması yok. |
| Meta bağlantısı ve hedef/gösterim bazlı anlık tahmin | Kısmi | OAuth/bağlantı kontrolü ve hedef, günlük bütçe, süre seçimi var; gerçek Meta reach/fiyat tahmini ve hedef gösterim kaydırıcısı yok. Bütçe × gün hesaplanıyor. |
| Aylık/yıllık üyelik, kredi, tahsilat ve turu askıya alma | Kısmi | Elle yenilenen abonelik ve kredi kayıtları var; otomatik tahsilat, yıllık dönem, tahsilat durumuna göre turu askıya alma yok. |
| Google yorum/statik/WhatsApp/Instagram QR, konum yönetimi | Eksik | Özel amaçlı akışlar ve yalnız yöneticinin konumu değiştirmesi uygulanmadı. Genel dinamik QR var. |
| Kendi tabletinden kuyumcuların müşteri uygulamalarını uzaktan yönetme | Eksik | Panelde müşteri ve teklif yönetimi var; ayrı kuyumcu vitrinlerine yönetici erişimi, tema/metin/logo yetkileri ve değişiklik bildirimi yok. |
| Çok kuyumculu müşteri vitrini, ürün, yorum, kaydetme, bildirim, mesaj, sipariş, kargo | Eksik | Bu depo VERTEX yönetim paneli; kuyumcuların son müşterilerine açılan mağaza/vitrin ürünü bulunmuyor. |
| Kuyumcu AI stüdyo: telefondan fotoğraf, iki stil, ürün sadakati, 9:16 görsel/video, önizleme ve yayınlama | Eksik | Sunumda temsili görseller var; üretim ve ürün doğruluğu denetimi yapan akış yok. |
| Kuyumcu AI günlük hak, bir kez ücretsiz yenileme, kredi satın alma ve gizli tahsilat | Eksik | Yönetim panelindeki genel kredi kayıtları bu satın alma/üretim sistemini sağlamıyor. |
| Altın gram/ayar/işçilik hesaplayıcısı, canlı emtia kurları, ürünlerde USD→TL fiyatı | Eksik | TCMB döviz kuru VERTEX hizmet tarifesi içindir; kuyumcu envanteri ve emtia fiyatlama sistemi değildir. |
| Gerçek otel/emlak turu, galeri ve müşteri referansı | Eksik | Satış sunumunda örnek fotoğraflar var; müşteri turu veya çekilmiş portföy yüklenmedi. |

## Öncelik sırası

1. VERTEX hizmet fiyatlarını gerçek kapsam/maliyet ve tarihli yerel kaynaklarla netleştir; eklenen emlak 360° kuralını gerçek işler üzerinden doğrula, oda/ürün katsayılarını yalnız onaylı kurallarla ekle.
2. Gerçek müşteri kaydı geldiğinde teklif → kabul → iş → takvim → teslim → ödeme akışını arayüzden doğrula.
3. QR hedef sağlığı, özel alan adı, basılı kod dayanıklılığı ve erişilemeyen tur uyarılarını tamamla.
4. Reklam tahminlerinin gerçek API verisi ile teklif hesaplamasını ve piyasa maliyet karşılaştırmasını tamamla; veri yoksa tahmin gösterme.
5. Kuyumcu müşteri uygulamasını ayrı kapsam, maliyet ve ürün doğrulama planıyla ele al. Bu panelin hazır olması o uygulamanın hazır olduğu anlamına gelmez.
