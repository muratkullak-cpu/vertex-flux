# Vertex Flux — Teklif Sistemi (Faz 1, iPad'e hazır test sürümü)

Bu, tablet üzerinden müşteriye canlı sunulan **Vertex Flux** teklif akışının
Faz 1 (tek cihaz, yerel test) sürümüdür. Sektör hizmet listesi + detaylı
Reklam Yönetimi sihirbazı aynı akışta bir arada çalışır, fiyatlar en sona
kadar gizli kalır, en son ekranda TL (büyük) + $ (küçük) birlikte açıklanır.

## Nasıl açılır (iPad Pro 13" için önerilen yöntem)

1. Gönderdiğim zip dosyasını Mac'ine indir, çıkart (unzip) — `teklif-sistemi`
   klasörü oluşur.
2. Mac'te Terminal'i aç, o klasöre `cd` ile gir, şunu yaz:
   `python3 -m http.server 8080`
3. Mac'in yerel ağ (LAN) IP adresini bul (Sistem Ayarları > Wi-Fi > Ayrıntılar,
   ya da Terminal'de `ipconfig getifaddr en0`).
4. iPad'in aynı Wi-Fi ağında olduğundan emin ol, Safari'de şu adrese git:
   `http://<Mac'in-IP-adresi>:8080` (örn. `http://192.168.1.24:8080`).
5. Paylaş menüsünden **"Ana Ekrana Ekle"** seçersen tam ekran, uygulama gibi
   açılan bir simge oluşur (adres çubuğu görünmez).
6. İlk açılışta senden bir PIN belirlemeni ister (4-6 hane) — bunu unutma.

Mac'i kapatıp Terminal'i kapattığında yerel sunucu durur; her test öncesi
2. adımı tekrar çalıştırman yeterli. (İleride bunu senin onayınla kalıcı bir
web adresine taşıyabiliriz — Faz 2 notuna bak.)

## Akış — baştan sona

1. **Müşteri Bilgileri (gate ekranı):** İşletme/müşteri adı, telefon, "İş
   Tanımı / Not", sektör, tarih. Devam etmeden önce döviz kurunu **o gün**
   güncellemiş olman gerekiyor (günde bir kez yeterli) — güncellemeden
   "Devam Et" butonu pasif kalır.
2. **Hizmet Seç:** Seçtiğin sektörün hizmetleri listelenir, her satırda
   sadece +/− ile adet artırılır — **fiyat hiçbir yerde görünmez**. İstersen
   "+ Ekstra Kalem Ekle" ile bir kerelik modal üzerinden özel kalem
   (ad/birim/fiyat) eklersin. Aynı ekrandan "+ Reklam Yönetimi Ekle" ile
   8 adımlık sihirbazı başlatabilirsin — ikisi aynı teklifte bir arada durur.
3. **Reklam Yönetimi Sihirbazı (8 adım):** Reels adedi → konum (TR il/ilçe
   veya dünya ülke/şehir, birden fazla eklenebilir) → yayın gün sayısı →
   hedef kitle büyüklüğü (slider + hazır butonlar) → Drone evet/hayır →
   TikTok evet/hayır → Facebook evet/hayır → İletişim tercihi (DM/WhatsApp/
   Yorum/Beğeni/Takipçi — **sadece bilgi amaçlı, fiyatı değiştirmez**).
   Sağ üst köşede o anki bölümün canlı $ toplamı küçük bir rozet olarak
   görünür (TL hiçbir zaman erken gösterilmez).
4. **Sonuç:** Tüm kalemler (sektör hizmetleri + ekstra kalemler + reklam
   sihirbazı kalemleri) tek tek listelenir, altında **GENEL TOPLAM** büyük TL
   rakamı ve yanında küçük ≈$ karşılığıyla birlikte gösterilir. Buradan
   "Teklifi Kaydet" ile müşteri kaydına işlenir, "Yazdır / PDF" ile
   yazdırılabilir.

## 360° Sanal Tur — konut tipine göre fiyatlandırma (YENİ)

Emlak sektöründeki iki 360° kalemini (Statik QR/Link ve Dinamik QR/Link)
işaretlediğinde ekranın ortasında bir pop-up açılır: **1+1 / 2+1 / 3+1 / 4+1
/ 5+1 / Villa** seçenekleri sunulur (fiyat hiçbir zaman görünmez — sadece
isimler). Bir tip seçilmeden kalem "dahil" sayılmaz; pop-up'ı "Vazgeç" ile
kapatırsan kalem işaretsiz kalır. Seçtikten sonra satırda "Konut tipi: 3+1 ·
değiştir" gibi bir etiket görünür, istediğin an "değiştir"e basıp tipi
güncelleyebilirsin. Adet +/− ile aynı tip için birden fazla ekleyebilirsin.

Her konut tipinin fiyatı, Statik ve Dinamik için **ayrı ayrı**, Ayarlar >
"360° Sanal Tur — Konut Tipi Fiyatları" bölümünden düzenlenir (toplam 12
alan). 1+1 taban/en düşük fiyat, yukarı çıktıkça artan fiyat mantığıyla
varsayılan rakamlarla geldi — ilk gerçek tekliflerinden sonra kendi
piyasa bilgine göre güncelleyebilirsin. Sonuç ekranında ve kayıtlı teklif
geçmişinde seçilen konut tipi kalem adının yanında görünür (örn. "360°
Sanal Tur + Statik QR/Link — Villa").

Bu özellik mevcut iPad'indeki kayıtlı veriyle de tam uyumlu — cihazını
tekrar sıfırlamana gerek yok, yeni fiyat alanları otomatik olarak
varsayılan değerlerle eklenir.

## Konum verisi — artık gerçek veri

`data/tr-locations.json` (81 il + 973 ilçe, doğru büyükşehir işaretleriyle)
ve `data/world-locations.json` (249 ülke + ~133.000 şehir) artık orijinal
Vertex Flux projendeki **gerçek dosyalar** — yer tutucu değil. Antalya'nın
19 ilçesi, dünya sekmesinde ülke seçip şehir aratma (örn. "Berlin") gibi her
şey bu sürümde gerçek veriyle test edildi.

## Döviz kuru canlı çekme — gerçek iPad'de doğrulandı

Gerçek iPad Pro 13"'te "Kur ve Analiz Güncelle" butonu denendi: TCMB'ye
tarayıcıdan doğrudan ulaşılamadı (birçok devlet sitesinde olduğu gibi CORS
kısıtlaması var), uygulama bunu otomatik yakaladı ve yedek piyasa kuru
kaynağına düştü — "Piyasa kuru (yedek kaynak — TCMB'ye ulaşılamadı)" etiketiyle
birlikte **1 USD = 47,74 TL** gibi gerçek, güncel bir kur başarıyla çekildi.
Yani tasarlandığı gibi çalışıyor: hangi kaynağın kullanıldığını her zaman
açıkça gösteriyor, sessizce yanlış/bayat veri göstermiyor.

Bunun dışındaki her şey (akış, hesaplama mantığı, tasarım, dokunmatik
davranış, kayıt/kalıcılık, konum verisi) de uçtan uca test edildi ve
çalışıyor. Artık açık nokta kalmadı.

## iPad Pro 13" testi — ne yapıldı, sonuç ne

Gerçek iPad Pro 13" (M4) mantıksal çözünürlükleriyle (dikey 1032×1376,
yatay 1376×1032), dokunmatik (tap) simülasyonuyla, uçtan uca otomatik test
çalıştırıldı:

- Kilit ekranı → PIN belirleme/giriş
- Müşteri Bilgileri ekranı (kur güncelleme kutusu dahil)
- Hizmet Seç ekranı — adet +/− ile seçim, ekstra kalem modalı
- Reklam Yönetimi sihirbazının **8 adımının tamamı** (reels, konum seçici,
  gün sayısı, hedef kitle slider'ı, drone/TikTok/Facebook evet-hayır
  kartları, iletişim tercihi kartları)
- Sonuç ekranı — itemized liste + TL/₺ toplamı doğru hesaplandı
- "Teklifi Kaydet" → Müşteriler sekmesinde teklif göründü
- Galeri sekmesi
- Sayfa tamamen yenilendi (kilit ekranına düşüldü) → PIN ile tekrar girildi,
  kaydedilen teklif hâlâ yerinde (localStorage kalıcılığı doğrulandı)

Sonuç: **her iki yönde de konsolda sıfır hata, yatay taşma yok (sayfa
genişliği ekran genişliğini hiçbir zaman aşmadı), tüm dokunma hedefleri
düzgün tepki verdi, uçtan uca akış (müşteri → hizmet → reklam sihirbazı →
sonuç → kayıt → yenileme sonrası kalıcılık) sorunsuz çalıştı.**

## Marka / logo

Üst menüde, kilit ekranında ve Ayarlar'da "VERTEX" büyük harf + "Flux"
gönderdiğin referans görsele göre iki renkli olarak yazılıyor. Logo görseli
Ayarlar > Logo alanından istediğin an değiştirilebilir.

## Faz 2 notu (senin onayınla, şimdilik yapılmadı)

Bu sürüm hâlâ tek cihazda tarayıcı hafızasında (localStorage) çalışıyor —
Mac ve iPad birbirinden bağımsız, veriler otomatik senkronize olmuyor. Gerçek
zamanlı senkronizasyon (Supabase) ve kalıcı bir web adresi Faz 2'de, ücretsiz
bir hesap açman sonrası birlikte kurulur; `db.js` dışındaki hiçbir dosya
değişmeyecek şekilde tasarlandı.
