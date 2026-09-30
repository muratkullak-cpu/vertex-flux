# VERTEX Flux istek denetimi — 29 Eylül 2026

Kaynak: Murat'ın paylaştığı “Uygulama Fikri Geliştirme” konuşması ve bu deponun mevcut kodu. “Var” kodun bulunduğunu ifade eder; gerçek müşteriyle uçtan uca doğrulandığı anlamına gelmez. VERTEX'in tablet satış/yönetim paneli ile kuyumcunun müşterilerine açılacak uygulama ayrı ürünlerdir.

| İstek | Durum | Mevcut sınır / kalan iş |
| --- | --- | --- |
| Emlak, kuyum, otel için ayrı çalışma alanları | Var | Sektör ekranları ve ayrı fiyat katalogları bulunuyor. |
| Görselli, sayfa sayfa müşteri sunumları | Var | Üç sektörde temsili stok fotoğraf ve mobil ekran örnekleri var; gerçek müşteri örneği değil. |
| Müşteri, emlak mülkü ve teklif kaydı | Var | Üretimde gerçek müşteri kaydı bulunmadığından teklif → kabul → iş akışı arayüzde uçtan uca denenmedi. |
| İş, takvim, görev, ödeme kaydı | Kısmi | Ekranlar ve veri tabloları var; gerçek işte uçtan uca operasyon doğrulaması bekliyor. |
| Dinamik QR ve aylık tarama raporu | Kısmi | Sabit `/q/` adresi, değişen hedef, rapor, elle ve günlük zamanlanmış hedef kontrolü kodda var. Supabase'te test QR çözümleme ve sayaç doğrulandı; Vercel hesabı askıda olduğu için canlı yönlendirme ve zamanlanmış kontrol doğrulanamadı. Sağlık tablosunda henüz sonuç yok. Özel alan adı `go.vertexflux.com`, arızada harici bildirim/onarım yok. QR görseli harici sağlayıcıdan alınır. |
| Yedek ve eksik kayıtları geri yükleme | Kısmi | Kayıt yedeği ve eksik kayıt yüklemesi var; fiyat ayarları, yönetim geçmişi, abonelik dönemleri, müşteri dosyası ve kuyumcu kayıtları/kredi geçmişi kapsama alındı. Medya dosyalarının içeriği ve Auth hesapları yedek JSON’da yok. |
| Müşteri sunumunda gizli bilgilerin saklanması | Kısmi | Ayrı sunum ve yönetici şifresiyle çıkış var; 6–12 rakamlı hashli PIN ve beş hatada 15 dakika kilit var; sunumda yönetim DOM’u temizleniyor. PIN bir oturum kilididir, ayrı sunucu yetki seviyesi değildir. |
| Gizli USD tabanı, TCMB kuru, müşteriye TL | Var | Manuel kur güncellemesi ve fiyat düzenleme var; fiyatların ticari doğrulaması ayrıca gerekiyor. |
| Sektör bazlı fiyat seçimi, paketler ve teklif toplamı | Kısmi | Emlak 360° turunda 150 m²/ilk kat baz, başlayan her ek 50 m² +750 ₺ ve sonraki her kat +500 ₺ kuralı uygulanır; portföy sayısı aynı kapsamın tekrarına çarpılır. Kural Murat'ın onayladığı ilk satış önerisidir, piyasa ortalaması olarak doğrulanmadı. Kuyum/otel adet bazlı otomatik tarife ve onaylı nihai ticari fiyatlar yok. |
| Antalya rakipleri, düşük/ortalama/yüksek fiyat ve maliyet marjı kıyası | Kısmi | Kaynaklı piyasa kayıtları ve birkaç yayımlanmış örnek var; kapsamlı ve güncel Antalya karşılaştırması, kaynak bazlı aralık ve tüm hizmetlerin maliyet/marj tablosu yok. |
| Google Ads bağlantısı ve canlı forecast | Kısmi | OAuth ve erişilebilen hesap sorgusu var; kampanya için gerçek gösterim/tıklama/CPC forecast entegrasyonu ve buna göre teklif fiyatlaması yok. |
| Meta bağlantısı ve hedef/gösterim bazlı anlık tahmin | Kısmi | OAuth/bağlantı kontrolü ve hedef, günlük bütçe, süre seçimi var; gerçek Meta reach/fiyat tahmini ve hedef gösterim kaydırıcısı yok. Bütçe × gün hesaplanıyor. |
| Aylık/yıllık üyelik, kredi, tahsilat ve turu askıya alma | Kısmi | Elle yenilenen abonelik ve kredi kayıtları var; yıllık dönem ve tahsilata göre bağlı QR erişimini durdurma/açma eklendi. Otomatik kart tahsilatı yok; üçüncü taraf tur adresini kapatmaz. |
| Google yorum/statik/WhatsApp/Instagram QR, konum yönetimi | Var | Google yorum, WhatsApp, Instagram, Maps ve statik/dinamik seçimleri eklendi. QR ve şubeler admin izinleriyle yönetilir; QR görseli hâlâ harici servis kullanır. |
| Kendi tabletinden kuyumcuların müşteri uygulamalarını uzaktan yönetme | Kısmi | Panelden kuyumcuya özel vitrin açma, ad/WhatsApp/yayın ayarı ve mevcut kullanıcıyı e-posta ile o kuyumcuya atama kodu ve veritabanı var. Logo, renk, dört metin, şube ve panel içi güncelleme geçmişi eklendi; canlıda henüz doğrulanmadı. |
| Çok kuyumculu müşteri vitrini, ürün, yorum, kaydetme, bildirim, mesaj, sipariş, kargo | Kısmi | Ayrı koleksiyon adresi, izole ürün kaydı ve yalnız onaylı görsel yayınlama geliştirildi; onaylı yorum, kaydetme, takip ve vitrin içi bildirim var. WhatsApp iletişim bağlantısı var; uygulama içi mesaj, sipariş ve kargo yok. Canlı Vercel dağıtımı askıda. |
| Kuyumcu AI stüdyo: telefondan fotoğraf, iki stil, ürün sadakati, 9:16 görsel/video, önizleme ve yayınlama | Kısmi | Özel orijinal fotoğraf yükleme, model/stüdyo seçimi, 9:16 görsel üretim API kodu, karşılaştırmalı onay ve yayın akışı var. OPENAI_API_KEY ile gerçek ürün üzerinde test edilmedi. Ürün sadakati otomatik garanti edilemez; insan onayı gerekir. 4 saniyelik Sora video üretimi, özel önizleme ve ayrı onay/yayın kodu var; canlı sağlayıcı test edilmedi. |
| Kuyumcu AI günlük hak, bir kez ücretsiz yenileme, kredi satın alma ve gizli tahsilat | Kısmi | Kuyumcuya günlük bir ücretsiz yeni görsel, ürün başına bir ücretsiz yeniden üretim ve atomik kredi/iade eklendi. Admin kredi yükler; satın alma/checkout ve otomatik tahsilat yok. |
| Altın gram/ayar/işçilik hesaplayıcısı, canlı emtia kurları, ürünlerde USD→TL fiyatı | Eksik | TCMB döviz kuru VERTEX hizmet tarifesi içindir; kuyumcu envanteri ve emtia fiyatlama sistemi değildir. |
| Gerçek otel/emlak turu, galeri ve müşteri referansı | Eksik | Satış sunumunda örnek fotoğraflar var; müşteri turu veya çekilmiş portföy yüklenmedi. |

## Öncelik sırası

1. VERTEX hizmet fiyatlarını gerçek kapsam/maliyet ve tarihli yerel kaynaklarla netleştir; eklenen emlak 360° kuralını gerçek işler üzerinden doğrula, oda/ürün katsayılarını yalnız onaylı kurallarla ekle.
2. Gerçek müşteri kaydı geldiğinde teklif → kabul → iş → takvim → teslim → ödeme akışını arayüzden doğrula.
3. Vercel hesabı etkinleştirildikten sonra son kodu dağıt; test QR yönlendirmesini, günlük hedef kontrolünün veritabanına yazmasını ve telefon/tablet sunumlarını canlıda doğrula. Ardından özel alan adı, basılı kod dayanıklılığı ve erişilemeyen tur bildirimini tamamla.
4. Reklam tahminlerinin gerçek API verisi ile teklif hesaplamasını ve piyasa maliyet karşılaştırmasını tamamla; veri yoksa tahmin gösterme.
5. Vercel hesabı açılıp `OPENAI_API_KEY` eklendiğinde gerçek kuyum ürünüyle stüdyo üretimini, onay/yayını ve ayrı kuyumcu oturumunun izolasyonunu uçtan uca doğrula. Ardından video, yorum/kaydetme, bildirim, sipariş ve kredi satın alma modüllerini tamamla.

## 29 Eylül uygulama ve kontrol notu

Yeni özelliklerin veritabanı değişiklikleri uygulandı. Rol/mağaza ayrımı, yıllık tahsilat, QR durdurma/açma, PIN kilitlenmesi, çift teklif kabulü/ödeme engeli, günlük hak ve kredi iadesi testleri rollback ile geçti. Canlı URL hâlâ Deployment Paused; Vercel bağlantısında takım listesi boş. Bu nedenle canlı dağıtım ve gerçek müşteri/ürünle arayüz testi tamamlandı sayılmıyor. Yukarıdaki açık maddeler bilinçli olarak açık bırakıldı; “tüm istekler bitti” sonucu çıkarılamaz.
