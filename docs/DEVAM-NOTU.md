# Devam Notu (yeni oturum için tam bağlam)

> Yeni bir Claude oturumu açıldığında **ilk bu dosya okunur.** Murat'ın her şeyi baştan anlatmasına gerek kalmaz.
> Son güncelleme: 10 Ekim 2026.

## Murat kim
- Murat Kulak, Antalya, 1984. Tek kişi, home ofis, şirketi yok (şahıs şirketi kurulacak). Tek işi bu.
- **Hedef:** En az 80.000 TL/ay. 100.000 TL sermaye bekleniyor, henüz gelmedi.
- **Ekipman:** Insta360 X5 + GO Ultra, DJI Pocket 4, Action 6, Neo 2, Mini 5 Pro. Plan: Sony A7, DJI Avata 360.
- **Yazılım:** Premiere, Illustrator, CapCut Pro, Firefly, Express, Kuula, short.io, Higgsfield, Artlist, Kling, ElevenLabs.
- **Hesaplar:** Instagram VERTEXflux (mavi tik, iş), beraflx (çekimler), YouTube vertextr (drone manzara).
- **Henüz hiç iş almadı.** Satış hem yüz yüze hem dijital olabilir, dijitali tercih ediyor.

## Murat nasıl çalışmak istiyor (önemli)
- **Doğrudan, net, eksiksiz.** Yarım iş istemiyor. "Haklısın" deyip eksik bırakma.
- **İşin büyük kısmını Claude yapsın.** Ona "şuraya bas, ekran görüntüsü at" demeyi en aza indir. Bir şeyi yapamıyorsan nedenini ve tek seferlik çözümü baştan söyle.
- Türkçe yaz, kısa paragraflar, teknik jargon yok.

## Teknik durum
- Repo: `muratkullak-cpu/vertex-flux`. Canlı: https://vertex-flux.vercel.app (Vercel Pro, GitHub'a bağlı, `main`'e her push otomatik yayınlanır).
- Vercel harcama limiti 20$ olarak önerildi. Ayarlanıp ayarlanmadığı doğrulanmadı.
- Ortam: İnternet erişimi **Tamamı** (açık). `.claude/settings.json` main'e push iznini veriyor.
- Supabase projesi: `ujrgwowdxxazbjilstht`. Gizli anahtarlar Vercel ortam değişkenlerinde, koda yazılmaz.

## Yapılanlar
- `docs/STRATEJI-2026-10.md`: Pazar analizi, 90 günlük plan, fiyatlar, 80 bin TL/ay hesabı.
- `docs/FIRSATLAR-2026-10.md`: Dünyadan 20 iş modeli, Antalya'ya uyarlanmış.
- `docs/SATIS-KITI.md`: Fiyat listesi, saha konuşmaları, itiraz cevapları, WhatsApp şablonları.
- Barış Taksi durak sayfası canlıda: https://vertex-flux.vercel.app/durak/baris-taksi/ (4 dil, WhatsApp konumlu çağırma, nöbetçi eczane, hastane, 112). Yeni durak: `durak/_sistem/yeni_durak.py <json>`.

## Sıradaki işler (öncelik sırasıyla)
1. ✅ **Barış Taksi QR etiketi** hazır: `durak/baris-taksi/baski/` (10×15 cm PDF/PNG, QR okuma testi geçti). QR şimdilik doğrudan durak sayfasına gidiyor; Murat panelde dinamik QR açarsa etiket `/q/<slug>` ile yeniden üretilir.
2. **3D dijital ikiz:** Murat X5 ile bir ev çekecek. Gaussian splat modeli + satış sayfası yapılacak. Çekim gelene kadar sayfa iskeleti hazırlanabilir.
3. **beraflx → "Antalya'yı havadan":** Profil metni, 30 günlük paylaşım planı, 4 dilde açıklamalar.
4. **Google yorum paketi sayfası** (VERTEX'te yorum QR'ı zaten var).
5. Ticari drone işleri için **P1 lisansı** (SHGM, 30 Temmuz 2026 talimatı) alınana kadar drone ücretli işte satılmaz.

## Bilinen kısıtlar
- Claude kendi yetkilerini değiştiremez. Murat'ın hesaplarına (Vercel, Instagram, Meta) giriş yapamaz. Bunun için Mac'teki Chrome'da "Claude in Chrome" eklentisi kurulu ve test edildi (10 Ekim 2026); hesap içi buton işleri için Murat'a o panele yapıştıracağı hazır komut yazılır.
- Durağa izinsiz yapıştırma cezalı (Kabahatler K. 42). Etiketler sadece izinli yerlere (durağın kendi alanı) asılır.
- Eczanelerden reklam parası alınamaz (deontoloji). Nöbetçi eczane bölümü Google Haritalar aramasıyla çalışır, veri kazıma yok.
