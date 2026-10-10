# VERTEX Flux — Strateji ve Pazar Analizi

**Hazırlanma:** 10 Ekim 2026 · **Kimin için:** Murat Kulak (Antalya, tek kişi, home ofis)
**Hedef:** En az 80.000 TL/ay net gelir · **Sermaye:** 100.000 TL (henüz gelmedi)

> Okuma notu: "Doğrulandı" diye işaretlemediğim rakamlar tahmindir. Kaynakların listesi en sonda. Türkiye'de il bazında güncel veri (emlak ofisi sayısı, durak sayısı, sanal tur fiyatları) internette yok. Bunları sahada 2 haftada kendin toplayacaksın. Planın ilk adımlarından biri bu.

---

## 0. Tek sayfalık özet

1. **Sorun takipçi sayısı değil.** Asıl sorun elinde **gösterecek tek bir gerçek iş olmaması** ve **çok fazla fikre aynı anda dağılman.** İşletme sahibi Instagram takipçine değil, kendi sektöründen tanıdığı birinin sonucuna bakar. 100 bin TL'yi takipçi reklamına harcamak bu sorunu çözmez.
2. **100 bin TL reklam bütçesi değil, senin 4–5 aylık hayatta kalma paran.** Başka gelirin yok. Bu paranın en fazla %15–20'si reklama gitmeli, o da takipçi değil **müşteri adayı** getiren reklama ve ancak örnek işlerin hazır olduktan sonra.
3. **İlk 90 gün tek bir pazara odaklan:** Antalya'da **yabancıya ve turiste satış yapan işletmelere çok dilli görsel içerik ve QR sistemleri.** Giriş kapısı **emlak**, yanında da hazır olan **Durak QR.**
4. **En büyük boşluk (hipotez):** Yabancıya ev satan inşaat projeleri için **aylık drone ile inşaat ilerleme raporu.** Alıcı yurtdışında ve evinin yapılışını görmek istiyor. Aylık ödenen, tekrar eden bir iş. Antalya'da sistemli yapan biri görünmüyor.
5. **Nöbetçi eczane QR'ı tek başına para kazandırmaz** (eczaneler reklam veremez, izinsiz durağa yapıştırmak da cezalı). Ama **Durak QR sayfasının içine** konduğunda durağın değerini artırır ve sana marka bilinirliği getirir. Doğru kullanım bu.
6. **Drone ile ticari iş yapmadan önce lisans şart:** 30 Temmuz 2026'da yürürlüğe giren yeni SHGM talimatına göre ticari uçuş için **P1 pilot lisansı** gerekiyor. Lisanssız ücretli çekim hem ceza hem de itibar riski.
7. **80 bin TL/ay gerçekçi ama ilk ay değil.** Gerçekçi takvim: 3. ayda 30–40 bin, 5–6. ayda 80 bin. Bunun yolu tek seferlik işten **aylık abonelik** gelirine geçmek.

---

## 1. Dürüst durum tespiti

### Elinde olanlar (güçlü yanların)
| Varlık | Neden değerli |
|---|---|
| Insta360 X5 + GO Ultra, DJI Mini 5 Pro, Neo 2, Pocket 4, Action 6 | 360° tur, havadan çekim, FPV hissi, vlog. Antalya'daki çoğu "fotoğrafçı"dan daha geniş bir araç seti. |
| Premiere, Illustrator, CapCut, Firefly, Higgsfield, Kling, Artlist | Çekimden yayına kadar her şeyi tek başına yapabiliyorsun. Artlist lisansı müzik sorununu da çözüyor. |
| **VERTEX Flux paneli (bu repo)** | Teklif, iş, ödeme takibi, dinamik QR, aylık tarama raporu, abonelik ve kredi. Çoğu ajansın bile olmayan bir **arka ofis** var. |
| **Durak QR sistemi** | Barış Taksi test sayfası hazır: konum, WhatsApp, arama, kartvizit, çok dil. **Satılabilir ilk ürün.** |
| Kuyumcu AI stüdyosu | Hazır ama canlıda test edilmedi. İkinci aşamanın ürünü. |
| Mavi tikli VERTEXflux | Güven sinyali. Az takipçiyle bile "gerçek işletme" görüntüsü veriyor. |
| Zaman | Tam gün bu işe ayırabiliyorsun. Tek kişilik işte en büyük avantaj bu. |

### Seni durduranlar
| Sorun | Gerçek etkisi |
|---|---|
| **Portföy yok** | "360 tur yapıyorum" demek ile "Konyaaltı'ndaki şu ofisin şu ilanı, 2 haftada 340 kez okutuldu" demek arasında dağ kadar fark var. |
| **Soğuk DM ve yorumla satış** | Türkiye'de esnaf tanımadığı bir hesaba DM'den dönmez. Bu takipçi sayısıyla değil, kanalla ilgili. Esnafa satış **yüz yüze ve WhatsApp'tan** olur. |
| **Odak dağınıklığı** | Emlak, kuaför, butik, kuyumcu, otel, taksi, eczane, drone, YouTube, 3 Instagram hesabı. Tek kişiyle hepsi aynı anda olmaz. |
| **Canlı site kapalı** | Vercel hesabı askıda. QR yönlendirmesi canlıda çalışmıyorsa **basılı QR'lar boşa çıkar.** Bu satıştan önce çözülmeli. |
| **Resmi yapı yok** | Şirket veya vergi kaydı yoksa kurumsal müşteriye fatura kesemezsin. Emlak ofisleri ve inşaat firmaları fatura ister. |
| **Drone lisansı (muhtemelen) yok** | Yeni mevzuatla ticari drone işi için P1 lisansı zorunlu. |

### "Takipçim az olduğu için ciddiye almıyorlar" tespitine dair
Kısmen doğru ama asıl sebep bu değil. Bir emlakçı bir hizmete şu 3 soruyla karar verir:
1. **Bana para kazandırır mı / iş yükümü azaltır mı?**
2. **Bunu benim gibi biri kullandı mı?** (sosyal kanıt = başka emlakçı, takipçi değil)
3. **Sana güvenebilir miyim?** (yüzünü görmek, fatura, telefonda ulaşabilmek)

Takipçi sayısı sadece 3. soruya küçük bir katkı yapar. 1. ve 2. soruyu **örnek iş** cevaplar.

---

## 2. 100 bin TL ve Meta reklamı: matematik

Türkiye'de Meta için bir rehberde verilen 2026 aralıkları (bağımsız doğrulanmadı): **CPM 35–65 TL**, tıklama başı **4–20 TL**. Reels'in feed'den yaklaşık %40 daha ucuz olduğu söyleniyor. Ayrıca **1 Temmuz 2026'dan itibaren Meta, Türkiye'de reklamlara %3 konum ücreti + KDV ekliyor** (100 TL reklam = 103 TL + KDV).

| Senaryo | 100.000 TL ne getirir (kaba tahmin) |
|---|---|
| Sadece gösterim | ~1,5–2,8 milyon gösterim |
| Takipçi kampanyası | Takipçi başı maliyet hedefe ve içeriğe göre çok değişir. Güvenilir bir TL rakamı bulamadım. Şunu söyleyebilirim: **ucuz takipçi genelde Antalya'daki işletme sahibi değil**, rastgele kişi olur. Senin müşterin olmaz. |
| Müşteri adayı kampanyası (Antalya, işletme sahibi, 30–60 yaş) | Asıl doğru kullanım bu. Gerçek maliyeti ancak **5–10 bin TL'lik testle** öğrenirsin. |

**Önerim:**
- Para gelince **hiçbir şeye dokunmadan önce 60–70 binini ayır.** Bu senin geçim paran.
- **10–15 bin TL:** Lisans, şirket kuruluşu, baskı (sticker, tabela), hosting/alan adı.
- **15–20 bin TL:** Reklam. Ama **ancak 3 örnek iş hazır olduktan sonra** ve **müşteri adayı/mesaj kampanyası** olarak. Hedef: "Antalya'da emlak ofisi sahibi → 30 saniyelik önce/sonra videosu → WhatsApp'tan ücretsiz demo iste."
- Takipçi kampanyasına **0 TL.** Takipçi, iyi içeriğin yan ürünü olarak gelsin.

---

## 3. Antalya pazarı: veriler ve okuması

### Turizm ve yabancılar (pazarın motoru)
- **Ocak–Temmuz 2026:** Antalya'ya yaklaşık **8,2–8,4 milyon** yabancı turist geldi. Bu, geçen yıla göre **%7 düşüş.** Sadece Temmuz'da 2,66 milyon.
- Sonuç: Turizm hâlâ dev ama daralıyor. Turizmciler **maliyet kısma** modunda. Pahalı ajans yerine **ucuz, hızlı, tek kişilik çözümlere** açıklar. Bu sana uygun.

### Yabancıya konut satışı
- Türkiye geneli **2025'te 21.534 adetle son 9 yılın en düşük seviyesi** (toplam satışların %1,3'ü). Antalya bu satışların her zaman en büyük payını alan il.
- Yorum: Pazar daralınca emlakçı **ilanını öne çıkarmak** zorunda kalır. Yurtdışındaki alıcıya evi **gelmeden gezdirmek** (360 tur, drone, çok dilli video) satışı kapatabilen bir araç. Kriz dönemleri pazarlama hizmeti için kötü değil, **doğru anlatılırsa** iyidir.

### Emlak sektörü
- Türkiye'de ~142 bin emlak danışmanı var (Mart 2025, TEDB). Yetki belgesinde mesleki yeterlilik şartı geldi. Sektör kurumsallaşıyor.
- **"E-tabela" dönemi:** Yetkili ofislere QR kodlu "E" tabela asılıyor. QR'ı okutan müşteri ofisin yetki belgesini Bakanlık sayfasında görüyor.
  - **Bu senin için çok iyi bir haber:** Emlakçı artık **QR kodun ne olduğunu biliyor ve QR = güven** diye öğreniyor. Sana kalan iş "ofisin E-tabelası var, ilan tabelanda da QR olsun, okutan evi gezsin" demek. Satış konuşman hazır.
- Antalya'daki ofis sayısını internetten bulamadım. Sahada sayacaksın (bkz. bölüm 8).

### Sağlık turizmi
- Antalya'da diş klinikleri özellikle güçlü büyüyor (resmi açıklama, sayı verilmemiş). Eylül 2025'ten beri tüm klinik ve ajanslar Sağlık Bakanlığı sistemine kayıt yapmak zorunda.
- Klinikler sürekli **İngilizce/Almanca içerik, hasta referans videosu, klinik turu** ister. 2. aşama için çok güçlü bir müşteri grubu.

### Taksi
- Antalya'da resmi durak/plaka sayısını bulamadım. 2023'te Şoförler Odası emniyete **622 korsan taksi** bildirdi. Duraklar korsan taksi ve transfer firmalarıyla rekabette zorlanıyor.
- Yorum: Durağın **turiste doğrudan ulaşması** (QR → WhatsApp → çağır) korsana karşı bir silah. Durak QR'ın satış hikâyesi bu olmalı.

---

## 4. Antalya'daki boşluklar (fırsat haritası)

Puanlama: **Talep** (müşterinin derdi ne kadar büyük), **Ödeme gücü**, **Senin uyumun** (ekipman + beceri), **Tekrar eden gelir.** Her biri 1–5. Hepsi **hipotez**, sahada doğrulanacak.

| # | Fırsat | Talep | Ödeme | Uyum | Tekrar | Toplam | Not |
|---|---|---|---|---|---|---|---|
| 1 | **İnşaat ilerleme raporu** (yabancıya satılan projeler: aylık drone + 360 + kısa video, çok dilli) | 5 | 5 | 5 | 5 | **20** | Alıcılar yurtdışında. Proje firması bunu satış aracı olarak kullanır. P1 lisansı şart. |
| 2 | **Emlak paketi** (360 tur + dikey video + drone + dinamik QR + aylık rapor) | 4 | 3 | 5 | 4 | **16** | Giriş kapısı. Yabancıya satış yapan ofisler öncelik. |
| 3 | **Google İşletme Profili + yorum QR'ı** (restoran, kuaför, klinik, otel) | 5 | 3 | 4 | 4 | **16** | Herkesin derdi "Google'da çıkmıyorum / yorumum az." VERTEX panelinde Google yorum QR'ı zaten var. |
| 4 | **Durak QR** (taksi) | 3 | 2 | 5 | 3 | **13** | Ürün hazır. Fiyatı düşük tut, ağ oluşturma aracı olarak kullan. |
| 5 | **Çok dilli QR menü / bilgi sayfası** (restoran, beach club, butik otel) | 4 | 3 | 4 | 3 | **14** | AI çeviri ile RU/DE/EN/TR. Rakip çok ama "kurulum + Google + yorum" paketi olarak farklılaşır. |
| 6 | **Klinik içerik aboneliği** (diş, saç ekimi, estetik) | 5 | 5 | 4 | 5 | **19** | Çok kazandırır ama bu sektörün dili zor: sağlık reklamı mevzuatı var. 2. aşama. |
| 7 | **Otel/villa kiralama içerik paketi** (drone + 360 + reels) | 4 | 4 | 5 | 2 | **15** | Sezon öncesi (Şubat–Nisan) yoğun. Takvime koy. |
| 8 | **Drone stok görüntü satışı** (Adobe Stock, Pond5 vb.) | 3 | 2 | 5 | 4 | **14** | Pasif gelir. YouTube için zaten çektiğin görüntüyü bir kez daha satarsın. |
| 9 | **AI WhatsApp asistanı** (emlak/klinik için 5 dilde ilk cevap) | 4 | 4 | 3 | 5 | **16** | Dünyadaki en büyük trend. 3. aşamada, ilk müşterilerin üzerine eklenir. |
| 10 | **Nöbetçi eczane QR** | 3 | 1 | 5 | 1 | **10** | Tek başına para etmez. Durak QR'ın bir özelliği ve marka bilinirliği olarak değerli. |

**Sonuç:** İlk 90 günün ürünleri **#2 Emlak paketi** (giriş kapısı), **#4 Durak QR** (hazır, hızlı satış, ağ) ve **#1 İnşaat ilerleme raporu** (büyük para, lisans gelince). **#3 Google yorum QR'ı** ise her müşteriye satılabilecek ek ürün.

---

## 5. Dünyada insanlar ne yapıyor (2026)

1. **AI mikro ajanslar:** Tek kişi veya 2–3 kişilik ekipler model geliştirmiyor. **Hazır araçları birbirine bağlıyorlar** (müşteri adayı toplama, randevu, otomatik takip mesajı). Fiyat modeli: **kurulum ücreti + aylık bakım.** Senin VERTEX paneli tam olarak bu modele uygun.
2. **Tavsiyeler:** Tek bir tekrarlayan, düşük riskli iş akışıyla başla, sonuçları kaydet, sistem oturunca genişlet.
3. **Uyarı:** Araçlar yaygınlaştıkça müşteri **daha hızlı ve daha ucuz** bekleyecek. Avantajın araç değil, **yerel güven + sektör bilgisi + saha çekimi** olmalı. Bunu kimse uzaktan yapay zekâyla kopyalayamaz.
4. **Instagram 2026:** Orijinal içerik ödüllendiriliyor. Repost ve filigranlı video cezalandırılıyor. Haftada 3–5 Reels öneriliyor. Takipçi olmayanlara öneri yaklaşık 3 dakikaya kadar olan videolarda çalışıyor. **Küçük hesapların Reels görüntülenme oranı büyük hesaplardan daha yüksek** (ikincil kaynak). Yani az takipçi dezavantaj değil.
5. **Ambient/drone YouTube kanalları:** Format çalışıyor (4K manzara + müzik, 20–30 dakikada sahne değişimi). Ama YouTube'un **"tekrarlanan/yeniden kullanılan içerik"** politikası bu kanalları sık vuruyor. Döngü (loop) videolardan kaçın, her videoda yeni çekim olsun.

---

## 6. Ürün ve fiyat önerileri (ilk teklif seti)

> Fiyatlar senin "statik 2.000 / dinamik 5.000" çıkış noktandan türetildi ve VERTEX panelindeki emlak kuralına uyumlu. **Piyasa ortalaması değil.** İlk 10 müşteride test et, sonra düzelt. KDV dahil/hariç durumunu mali müşavirinle netleştir.

### A) Emlak
| Paket | İçerik | Fiyat önerisi |
|---|---|---|
| **Başlangıç** (bir kerelik) | 360° tur (150 m²'ye kadar) + statik QR + QR'lı tabela etiketi | 2.500 TL |
| **Akıllı İlan** (önerilen) | 360° tur + **dinamik QR** + 30 sn dikey video + aylık tarama raporu (ilan satılana kadar) | 5.000 TL |
| **Premium / Yabancı alıcı** | Akıllı İlan + drone çekimi + EN/RU/DE altyazılı video + Google Haritalar uyumlu link | 9.000–12.000 TL |
| **Ofis aboneliği** (asıl hedef) | Ayda 2 ilan çekimi + dinamik QR'lar + aylık rapor + ofis Instagram'ı için 4 Reels | 7.500 TL/ay |

**Dinamik QR'ın satış cümlesi** (senin fikrin, güçlü):
> "Bu kod sizin. Ev satıldığında tabelayı atmazsınız. Ben yeni evi çekerim, aynı kodun içine koyarım. Her ay kaç kişinin ilanınıza baktığını raporla görürsünüz."

Bunun üzerine bir şey ekle:
> "Ev satıldığında kod boşa düşmesin. Satılana kadar 'Bu ev satıldı, benzer ilanlarımız burada' sayfasına yönlendiririm. Tabelanız hâlâ size müşteri getirir."

### B) İnşaat ilerleme raporu
| Paket | İçerik | Fiyat önerisi |
|---|---|---|
| **Aylık Rapor** | Ayda 1 drone uçuşu (aynı açılar, karşılaştırılabilir) + 60–90 sn video + 360° şantiye görüntüsü + EN/RU/DE kısa metin + alıcılar için dinamik QR sayfası | 15.000–25.000 TL/ay |
| Kurulum | Sabit çekim noktalarının belirlenmesi, ilk çekim, sayfa tasarımı | 10.000 TL (bir kerelik) |

### C) Durak QR
| Paket | İçerik | Fiyat önerisi |
|---|---|---|
| **Kurulum** | Durak sayfası (TR/EN/RU/DE), WhatsApp, arama, kartvizit, konum, 2 adet dayanıklı QR etiket | 1.500 TL |
| **Aylık** | Barındırma, bilgi güncelleme, aylık tarama raporu, **nöbetçi eczane ve en yakın hastane bilgisi** | 400–500 TL/ay |
| **Tanıtım teklifi** | İlk 10 durağa kurulum ücretsiz, 3 ay sonra aylık başlar | — |

### D) Her müşteriye eklenebilecek ürünler
- **Google yorum QR'ı + İşletme Profili düzenlemesi:** 2.500 TL kurulum.
- **Dinamik QR tek başına:** 300 TL/ay (link değişimi + rapor).

---

## 7. 80.000 TL/ay matematiği

Tek seferlik işle 80 bin kazanmak her ay sıfırdan başlamak demek. Hedef **aylık abonelik tabanı.**

**5–6. ay için hedef tablo:**
| Gelir kalemi | Adet | Birim | Aylık |
|---|---|---|---|
| Emlak ofis aboneliği | 5 | 7.500 TL | 37.500 TL |
| İnşaat ilerleme raporu | 1 | 18.000 TL | 18.000 TL |
| Durak QR aylık | 20 | 450 TL | 9.000 TL |
| Tek seferlik işler (Akıllı İlan, drone, otel çekimi) | 3–4 | ~5.000 TL | 17.500 TL |
| **Toplam** | | | **~82.000 TL** |

**Gerçekçi gidişat:**
| Ay | Hedef gelir | Ana iş |
|---|---|---|
| 1 (Ekim–Kasım) | 0–5 bin | Altyapı + ücretsiz örnek işler + saha sayımı |
| 2 | 10–20 bin | İlk ücretli emlak işleri, ilk 10 durak |
| 3 | 30–40 bin | İlk 2–3 abonelik, P1 lisansı, inşaat firmalarına teklif |
| 4–5 | 50–70 bin | Abonelik tabanı büyüyor, reklam testi |
| 6 | 80 bin+ | Sistem oturdu, 2. sektör (klinik veya otel) |

---

## 8. 90 günlük plan

### Hafta 1–2: Temel (satıştan önce mutlaka)
- [ ] **Canlı siteyi çalışır hale getir.** Vercel hesabı askıda. Ya hesabı aç ya da başka bir platforma taşıyalım (Cloudflare Pages gibi ücretsiz seçenekler var). Kendi alan adını (`go.vertexflux.com` gibi) bağla. **Çalışmayan QR basma.**
- [ ] **Mali müşavirle görüş:** Şahıs şirketi kuruluşu, fatura kesebilmek, KDV durumu. (42 yaşındasın, "genç girişimci" muafiyeti 29 yaş altı için. Seni kapsamaz.)
- [ ] **P1 drone lisansı için başvur.** SHGM onaylı ticari İHA eğitimi. Kursun başlama tarihini öğren. Antalya Havalimanı kontrol bölgesini İHATTYS haritasından çalış.
- [ ] **KVKK:** QR tarama raporlarında kişisel veri tutma (sadece sayı ve tarih). Gizlilik sayfası repoda zaten var.
- [ ] **3 örnek iş, ücretsiz:**
  1. **1 emlak ofisi:** Tanıdığın veya mahallendeki bir ofisin 1 ilanına ücretsiz Akıllı İlan. Karşılığında: tabelaya QR asılsın, 30 gün tarama verisi seninle paylaşılsın, kısa bir video yorum çekilsin.
  2. **Barış Taksi:** Canlıya al, QR'ı durağa as, 30 günlük tarama sayısını topla.
  3. **Kendi evin / bir arkadaşın evi:** 360 tur + drone ile "nasıl görünüyor" demosu.
- [ ] **Saha sayımı:** Konyaaltı ve Muratpaşa'da (Lara dahil) yürüyerek emlak ofislerini ve durakları say. Google Haritalar'dan liste çıkar. **Hangi ofisin yabancıya satış yaptığını** (vitrinde İngilizce/Rusça ilan) işaretle.

### Hafta 3–6: Yüz yüze satış
- [ ] **Günde 8–10 ziyaret,** haftada 4 gün. Tablette VERTEX sunum ekranı + örnek iş videosu.
- [ ] **İlk hedef: yabancıya satış yapan emlak ofisleri.** Satış cümlesi: "Yurtdışındaki alıcınız evi gelmeden gezsin. Tabelanızdaki QR'ı okutan da gezsin. Kaç kişinin baktığını her ay görün."
- [ ] **Duraklar:** Barış Taksi verisiyle git. "Geçen ay sizin durağınızın QR'ı X kez okutuldu, Y kişi direkt aradı."
- [ ] Her ziyareti VERTEX paneline müşteri olarak kaydet. Ziyaretten 2 gün sonra WhatsApp'tan kısa takip mesajı.
- [ ] **İlk 3 ofise "kurucu müşteri" fiyatı:** 3 ay boyunca %30 indirimli abonelik, karşılığında referans videosu.

### Hafta 7–12: Büyütme
- [ ] **P1 lisansı geldiyse:** Antalya'da yabancıya satış yapan inşaat projelerinin listesini çıkar (satış ofisleri, sahibinden ve yabancı emlak portallarındaki "off-plan" projeler). İlk projeye 1 ay ücretsiz rapor teklif et.
- [ ] **Reklam testi (para geldiyse):** 5–10 bin TL, Antalya, işletme sahipleri, mesaj hedefli kampanya. Videoda örnek işin olsun.
- [ ] **İçerik motoru** (bkz. bölüm 9).
- [ ] **Emlakçı WhatsApp grupları ve odalar:** Antalya Emlakçılar Odası / TEDB etkinliklerine katıl, ücretsiz 10 dakikalık "akıllı tabela" sunumu teklif et.

---

## 9. Instagram ve YouTube stratejisi

### 3 hesap tek kişi için fazla. Roller:
| Hesap | Rol | Paylaşım |
|---|---|---|
| **VERTEXflux** (mavi tik) | **Satış vitrini.** Hedef kitle Antalya'daki işletme sahibi. | Haftada 3 Reels |
| **beraflx** | **Antalya havadan.** Turist ve yerli için manzara, mekan keşfi. Takipçi büyütme hesabı. | Haftada 2–3 Reels (mevcut çekimlerden) |
| **vertextr** (YouTube) | **Uzun manzara + stok görüntü arşivi.** | Ayda 2 video |

### VERTEXflux için içerik formatları (rakip esnafı izleyen kişi için)
1. **Önce/sonra:** "Bu ilanın normal fotoğrafı vs. 360 turu" (ekran kaydı + telefonla QR okutma anı).
2. **Sahadan:** "Bugün Konyaaltı'nda bir emlakçıya akıllı tabela kurduk." (10 saniyelik Pocket 4 vlog).
3. **Rakam:** "Bu QR 30 günde 214 kez okutuldu." (Rapor ekranı.)
4. **Eğitici:** "Emlakçılar için 3 hata: tabelanızda neden QR olmalı."
5. **Durak:** "Turist durağa geldi, QR'ı okuttu, İngilizce sayfadan taksiyi aradı."

### Otomasyon (gerçekçi kurulum)
- **Çekim gerçek kalsın, kurgu ve dağıtım otomatik olsun.** Tamamen AI ile üretilmiş emlak içeriği güveni bozar ve yanıltıcı ilan riski taşır.
- Akış: **Çek → Premiere/CapCut şablonuyla kurgu → Claude ile 4 dilde açıklama ve altyazı → planlayıcıyla zamanla.** Bunu ben senin için şablon dosyalarına dökebilirim.
- Higgsfield/Kling'i **intro, geçiş, B-roll** için kullan. Ana görüntü yerine kullanma.

### YouTube (vertextr) için kurallar
- **Başlık ve açıklama çok dilli:** "Antalya from Above 4K | Konyaaltı Cliffs & Old Town | Drone Relaxing Film" ve altında TR/DE/RU açıklama.
- **Bölümler (chapters):** Konum adlarıyla. Yabancı izleyici "Kaleiçi", "Düden" diye arar.
- **Müzik:** Artlist lisansını kullan, lisans belgesini sakla (telif itirazında lazım).
- **Döngü yok:** Her video yeni çekim, 20–30 dakikada sahne değişsin. "Yeniden kullanılan içerik" politikası bu nişte risk.
- **Para:** YouTube Ortaklık Programı için 1.000 abone + 4.000 saat izlenme gerekiyor. Bu nişte uzun sürer. **Asıl gelir:** Aynı görüntüleri **stok sitelerine** (Adobe Stock, Pond5 vb.) yüklemek ve otel/emlak müşterisine "havadan Antalya" arşivi satmak.
- **Drone uçuş kuralları YouTube çekimleri için de geçerli.** Yasak bölgelerde (havalimanı, askeri alan) yapılan çekimi yayınlamak delil olur.

---

## 10. Nöbetçi eczane fikri: detaylı değerlendirme

**Fikrin güzel tarafı:** Gerçek bir kamu faydası var. İnsanlar gece "hangi eczane açık" diye arıyor. Logonla birlikte görünmek marka bilinirliği sağlar.

**Engeller:**
1. **Durağa izinsiz yapıştırma = idari para cezası.** Kabahatler Kanunu 42. madde. Belediyeler duraklara ve direklere izinsiz ilan için bu maddeyle ceza yazıyor. Aynı afişin çok sayıda yapıştırılması tek fiil sayılsa da logon görüneceği için cezanın kime yazılacağı belli olur.
2. **Eczanelerden para alamazsın.** Türk Eczacıları Birliği Deontoloji Tüzüğü eczacının reklamını yasaklıyor. "Nöbetteyken öne çıkar" diye ücret almak eczacıyı disipline sokar.
3. **Veri kaynağı:** Resmi liste Antalya Eczacı Odası'nın sitesinde yayınlanıyor. Bu listeyi otomatik çekmek için önce sitenin kullanım koşullarına bak. En iyisi odadan izin istemek. Hatalı bilgi gösterirsen gece mağdur olan birinin hikâyesi sana döner. Odanın da kendi uyarısı var: acil durumlarda nöbet değişebilir, önce aramak gerekir.
4. **Reklam geliri çok küçük kalır.** Bir web sayfasına konan reklamdan (AdSense) anlamlı para kazanmak için yüz binlerce ziyaret gerekir.

**Doğru kullanım:**
- **Durak QR sayfasına "Bugün nöbetçi eczaneler" bölümü ekle.** Durak sayfası, durağın izniyle durağın kendi alanına asılıyor. Yasal sorun yok. Durağın QR'ı daha sık okutulur (insanlar taksi için değil, eczane için bile okutur). Taksiye ihtiyacı olan da hemen arar ("eczaneye götürelim"). **Bu durağın aylık ücretini haklı çıkaran bir özellik.**
- **Odayla işbirliği teklifi:** "Antalya Eczacı Odası verisiyle, VERTEX altyapısıyla" ücretsiz bir sayfa. Oda kendi duyurularında paylaşırsa marka bilinirliği kazanırsın ve belediyeyle görüşmek için referansın olur.
- **İzinli noktalar:** Apartman panoları (yönetici izniyle), esnaf camları (dükkân sahibi izniyle), durağın kendi kulübesi.
- **Sponsorluk (ileride):** Sayfanın altında "Bu hizmet X Taksi Durağı katkısıyla" gibi eczane dışı yerel sponsor. Sağlıkla ilgili sponsorlarda (klinik vb.) sağlık reklamı mevzuatına dikkat.

**Hüküm:** Ürün olarak satma, **marka ve durak özelliği** olarak kullan. 1–2 günlük teknik iş. Durak sistemine eklemeyi öneririm.

---

## 11. "Bir şey bulmalıyım ki satmadan para kazandırsın" sorusu

Kendi ürününü (SaaS, uygulama, reklamlı sayfa) yapmak mümkün ama şu gerçeği bil: **Kendi ürünü para kazanacak seviyeye getirmek, hizmet satmaktan genelde çok daha uzun sürer** ve tek kişilik işte nakit akışını öldürür.

**Önerdiğim sıra:**
1. **Hizmet sat (0–6. ay):** Nakit akışı ve sektör bilgisi.
2. **Hizmeti paketle (6–12. ay):** Aynı işi 10 kez yaptıktan sonra abonelik ürünü olur (Durak QR, Akıllı İlan, İnşaat Raporu zaten bu yönde).
3. **Paketi yazılıma çevir (12. ay+):** VERTEX panelini başka şehirlerdeki fotoğrafçılara ve emlakçılara **aylık lisansla** sat. Asıl "satmadan kazanan" model bu. Altyapısı **bu repoda zaten var.**

**Pasif gelir kaynakları (hemen başlayabileceğin, küçük ama gerçek):**
- Drone stok görüntü (Adobe Stock gibi siteler).
- YouTube (uzun vadede).
- Durak/QR abonelikleri. Bunlar kurduktan sonra her ay az emekle gelir.

---

## 12. Riskler ve önlemler

| Risk | Önlem |
|---|---|
| Para gelmez veya geç gelir | Plan reklam parasına bağlı değil. İlk 6 hafta sıfır bütçeyle yürür. |
| Basılı QR'lar çalışmaz (site kapanır) | Kendi alan adı + yedek barındırma + günlük QR sağlık kontrolü (VERTEX'te var, canlıda doğrula). |
| Lisanssız drone işi | P1 gelene kadar drone'u **sadece kendi içeriğinde** kullan, ücretli işte 360 ve yer çekimi sat. |
| Emlakçı ödemeyi geciktirir | Abonelikte peşin ödeme, VERTEX'te gecikme uyarısı zaten var. Ödenmezse dinamik QR'ı "geçici kapalı" sayfasına al (panel destekliyor). |
| Tükenmişlik (tek kişi, çok fikir) | Bu belge "hayır" deme listen. 90 gün boyunca bölüm 4'teki ilk 3 ürün dışındaki işlere hayır. |
| AI ile yapılan içeriğin yanıltıcı olması | Emlak görsellerinde gerçek dışı düzenleme yok (mobilya eklemek bile "temsilidir" notu ister). |

---

## 13. Bu hafta yapılacak 5 şey

1. **Vercel/canlı site sorununu çözelim.** Bana "taşıyalım" de, seçenekleri çıkarayım.
2. **Mali müşavir randevusu al.**
3. **P1 ticari İHA eğitimi için 2 kurs fiyatı al.**
4. **Barış Taksi QR'ını fiziksel olarak durağa as** (site çalışınca) ve taramaları say.
5. **1 emlak ofisine git, ücretsiz örnek iş teklif et.** Tanıdık biri olması avantaj.

İstersen sıradaki adımda bunlardan birini hemen birlikte yapalım: nöbetçi eczane bölümünü Durak QR'a eklemek, satış konuşması metni ve WhatsApp mesaj şablonları, emlak ofisi ziyaret listesi şablonu veya inşaat raporu sunumu.

---

## Kaynaklar

- Meta reklam maliyetleri ve konum ücreti: [Webtekno – Meta Türkiye konum ücreti](https://www.webtekno.com/meta-turkiye-reklamlar-konum-ucreti-alacak-h218926.html), [Braverytechnology – Instagram reklam rehberi](https://braverytechnology.com/tr/instagram-reklami-nasil-verilir/), [Ideasoft – Instagram reklam rehberi](https://www.ideasoft.com.tr/instagram-reklam-rehberi/)
- Antalya turizm 2026: [İşçi Haber – Antalya ilk 7 ay](https://www.iscihaber.net/gundem/antalyaya-yilin-ilk-7-ayinda-kac-turist-geldi-hangi-ulkeler-one-cikti/251766), [DHA – Antalya ocak rekoru](https://www.dha.com.tr/gundem/antalya-turizminde-tum-zamanlarin-ocak-rekoru-2812992), [Bigpara – 2026'da Antalya'ya hava yolu ile gelen turist](https://bigpara.hurriyet.com.tr/haberler/genel-haberler/2026da-antalyaya-hava-yolu-ile-3-5-milyon-turist-geldi_ID102120742/)
- Yabancıya konut satışı: [Türkgün – son 9 yılın en düşük seviyesi](https://www.turkgun.com/ekonomi/tuik-acikladi-yabanciya-konut-satisinda-son-9-yilin-en-dusuk-seviyesi/353044)
- Emlak sektörü ve E-tabela: [Capital – E tabela](https://www.capital.com.tr/haberler/tum-haberler/yetkili-emlakci-ofislerinde-e-tabela-donemi), [NTV – E tabela](https://www.ntv.com.tr/ntvpara/yetkili-emlak-ofislerinde-e-tabela-donemi,L-FyV5FpLUiju5lMMkfmrw), [Habertürk – E tabelalar asılmaya başlandı](https://www.haberturk.com/yetkili-emlak-ofislerine-e-tabelalarin-asilmasina-baslandi-3814402-ekonomi), [Hürriyet – belge uyarısı](https://www.hurriyet.com.tr/ekonomi/cok-onemli-uyari-belgesi-olmayan-bunu-yapamayacak-41115380)
- Drone mevzuatı: [Alomaliye – İHA pilotları için yeni lisans dönemi](https://www.alomaliye.com/2026/07/30/iha-pilotlari-icin-yeni-lisans-donemi/), [Alomaliye – İHA pilotu başvurularında artış](https://www.alomaliye.com/2026/03/23/iha-pilotu-basvurularinda-patlama-2026da-yuzde-236-artis/), [Gıda Tarım Üniversitesi – Ticari İHA-1 eğitimi](https://www.gidatarim.edu.tr/duyurular/ticari-iha-1-pilot-egitimi-938)
- İzinsiz ilan cezası: [Mynet – zabıta izinsiz ilan denetimi](https://www.mynet.com/zabitadan-izinsiz-ilan-ve-afis-denetimi-180101910275), [Hukuki Haber – 2026 idari para cezaları](https://hukukihaber.net/2026-yili-idari-para-cezalari), [Adalet Bakanlığı – önödeme tablosu](https://alternatifcozumler.adalet.gov.tr/Resimler/SayfaDokuman/2026022510164953125.02.2026%20%C3%96n%C3%B6demeye%20Tabi%20Su%C3%A7lara%20%C4%B0li%C5%9Fkin%20Tablo.pdf)
- Eczane reklam yasağı: [Sözcü – eczaneler promosyon yasağı](https://www.sozcu.com.tr/eczaneler-promosyon-yasagini-boyle-deldi-wp2753125), [Türkiye Klinikleri – eczacılık ürünlerinin reklamı](https://turkiyeklinikleri.com/article/en-turkiyede-eczacilik-urunlerinin-reklami-191-1928-34961.html)
- Nöbetçi eczane uygulamaları: [App Store – Nöbetçi Eczaneleri](https://apps.apple.com/tr/app/id6445896212), [App Store – Nöbetçi Eczaneler Türkiye](https://apps.apple.com/us/app/-/id1445442406)
- Sağlık turizmi: [DHA – sağlık turizmi 2025 hedefi](https://www.dha.com.tr/saglik-yasam/saglik-turizminde-2025-hedefi-12-milyar-dolar-gelir-2687512), [Alanya Alaaddin Keykubat Üni. – Antalya dental turizm](https://acikerisim.alanya.edu.tr/items/87228bd9-1a52-4774-a0a7-9432f4b803c3)
- Taksi: [Cumhuriyet – korsan taksi](https://www.cumhuriyet.com.tr/turkiye/taksiciler-isyanda-korsan-taksiciler-yari-fiyata-tasiyor-2152842)
- Sanal tur ve rakipler: [Susesi – Matterport sanal tur](https://www.susesihotel.com/en/blog/discover-the-privileges-of-susesi-luxury-resort-virtual-tour/), [Teliportme – Matterport alternatifleri](https://teliportme.com/10-best-matterport-alternatives)
- AI ajans trendleri: [Mean CEO – AI Automation Trends 2026](https://blog.mean.ceo/?p=6880), [Self Employed – AI agents for solopreneurs](https://www.selfemployed.com/?p=103639), [AI Business – one-person company limits](https://aibusiness.vc/solo/one-person-company-ai-agents-limits-2026)
- Instagram algoritması: [SocialPilot – Reels algoritması 2026](https://www.socialpilot.co/de/blog/instagram-reels-algorithm), [Smash Balloon – Instagram algoritması 2026](https://smashballoon.com/how-the-instagram-algorithm-works/)
- YouTube ambient/drone: [OutlierKit – relaxation kanal analizi](https://outlierkit.com/channel/soothingrelaxation), [CreatorDB – relaxationfilm](https://creatordb.app/creatorstats/relaxationfilm/)
