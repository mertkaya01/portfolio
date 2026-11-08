# Pixel art kit — Set 1 (High School)

Mert'in Set 1'i kendisinin çizmesi için hazırlanan kit. Bu klasör siteye girmez; sadece çizim kaynağıdır.
Bitmiş, dışa aktarılmış dosyalar sonra `public/art/set1/` klasörüne gidecek ve kod onları oynatacak.

## Dosyalar

| Dosya | Ne için |
|---|---|
| `beyond-the-court.gpl` | Palet, **Aseprite** için (*Palette → Load Palette*) |
| `beyond-the-court.aco` | Aynı palet, **Photoshop** için (*Swatches → Import Swatches*) |
| `beyond-the-court.hex` | Aynı palet, düz liste (Lospec ve diğer araçlar) |
| `palette.png` | Paletin görseli: 32 renk |
| `guides-320x180.png` | Güvenli alanlar. Referans katman olarak kullan, **asla dışa aktarma** |
| `guides-preview-4x.png` | Aynı rehber, rahat bakmak için 4× büyük |

İzlemek için video kareleri `Desktop/portfolio-refs/_tracing/` klasöründe. İçlerinde başka insanlar
olduğu için repoya girmiyorlar.

## Kurulum

**Aseprite**
1. *File → New*: **320 × 180**, Color Mode: RGB.
2. *Palette → Load Palette* → `beyond-the-court.gpl`.
3. *Layer → New Reference Layer from File* → `guides-320x180.png`. Referans katmanlar dışa aktarılmaz.
4. Rotoskop için aynı yolla bir video karesini referans katman olarak ekle, küçült ve üstünden çiz.

**Photoshop**
1. *File → New*: **320 × 180 px**. *Preferences → General → Image Interpolation: Nearest Neighbor*.
2. Fırça değil **Pencil** aracı. Anti-aliasing kapalı olsun.
3. *Swatches → Import Swatches* → `beyond-the-court.aco`.
4. `guides-320x180.png` dosyasını en üstte kilitli bir katmana koy, dışa aktarmadan önce gizle.
5. Animasyon için *Window → Timeline → Frame Animation*.

## Karakter: sen, dönem dönem

- **Lise (2017–2021):** Kısa saç.
- **Üniversite:** Uzun saç, topuz. Mezuniyete bir dönem kala kesildi.
- **Şimdi:** Orta boy, dalgalı ve yana ayrılmış saç, kısa sakal.
- **Formalar:**
  - Lisede, Aydın 2020: **1 numara**, mavi üzerine turuncu-beyaz şeritli forma, orta oyuncu.
  - Üniversitede: **9 numara**. Siyah-beyaz çapraz şeritli "Kültür Üniversitesi" forması ya da turuncu-kırmızı
    İKÜ forması.

## Ölçek

Sahne 320 × 180. Bir oyuncu yaklaşık **30 px** boyunda, yani 1.9 m. Buradan **1 m ≈ 16 px**.

- File (2.43 m): **38 px**. Rehberin sağ altındaki beyaz çubuk.
- Oyuncu: **30 px**. Rehberin sağ altındaki sarı çubuk.
- Top: **4 px** çap.
- Ekranda her piksel masaüstünde 4×–6×, telefonda 2× büyüyecek.

## Güvenli alanlar (rehber dosyası)

- **Kırmızı alan, x 0–111:** Masaüstünde yazı burada duruyor. Sakin ve koyu bırak: gökyüzü, gölgede
  bir duvar ya da boş bir zemin olabilir.
- **Mavi kesikli çizgiler, x 70–249:** Telefonda sadece bu orta bölüm görünür.
- **Yeşil çerçeve, x 112–249:** Her ekranda görünen alan. **Ana aksiyon buraya:** oyuncu, top, file.

## Katmanlar ve dışa aktarma

Her sahne (shot) için:
- **Arka plan:** Tek, sabit bir PNG (320 × 180).
- **Hareketli katmanlar:** Her biri ayrı. Oyuncu, top, martılar gibi.

Dışa aktarma:
- **Aseprite:** *File → Export Sprite Sheet*. Layout: *Horizontal Strip*. *Output → JSON Data* işaretli,
  format *Hash*. Her hareketli katman için ayrı yap.
- **Photoshop:** Kareleri tek tek PNG olarak çıkar (`kid-01.png`, `kid-02.png` …). Sprite sheet'e
  dönüştürmeyi ben yaparım.
- **Boyut:** Her zaman **1×** boyutta. Büyütmeyi kod yapıyor.
- **Arka plan:** Hareketli katmanlarda şeffaf.

Hız ve döngü: Pixel animasyonlar **8–12 fps**, döngüler 4–8 kare. Kareler arası geçişleri (dissolve)
çizmene gerek yok, kod yapıyor.

## Sitede şu an ne var (kodla çizilmiş taslaklar)

Dört sahnenin hepsi çalışıyor. Hepsi 320 × 180, saniyede 12 kare ve hareketli. Sahneler arası geçiş
piksel piksel dağılarak (dither dissolve) oluyor. Reduced motion açıksa her sahnenin tek bir anı sabit
gösteriliyor.

| Dosya (`public/art/set1/`) | Ne | Senin çizimin gelince |
|---|---|---|
| `shot1/background.png` | İstanbul silüeti ve güneş | Aynı isimle değiştir |
| `shot2/background.png` | Okul cephesi ve bahçe | Aynı isimle değiştir |
| `shot2/kid.png` | Manşet yapan sen. Sprite sheet: 16 kare × **40 × 50 px**, yan yana, 10 fps, ayaklar karenin (20, 48) noktasında | Aynı ölçüde çiz ve değiştir |
| `shot3/background.png` | Okul salonu | Aynı isimle değiştir |
| `shot4/background.png` | Aydın 2020 salonu | Aynı isimle değiştir |

Kodla çizilen katmanlar, şimdilik arka planın üstünde:
- **Shot 1:** Su parıltısı, martılar, vapur.
- **Shot 2:** Top, dalgalanan bayraklar, gölgen.
- **Shot 3 ve 4:** Oyuncular (iskelet tabanlı figürler) ve top.

Bunlardan herhangi birini kendin çizmek istersen, sprite sheet olarak çiz. Ben kodda o katmanı senin
dosyanla değiştiririm. Her shot'ın ayarı `src/quest/chapters/highschool/<shot>.ts` dosyasının sonunda.

- **Taslakları yeniden üretmek:** `npm run art:drafts`. Arka planlar hem `public/art/set1/` hem
  `drafts/` içine yazılır.
- **Dikkat:** Kendi çizimini koyduktan sonra bu komutu çalıştırırsan seninkinin üstüne yazar. Kendi
  dosyalarını önce yedekle ya da bana söyle, o shot'ı script'ten çıkarırım.

## Storyboard

Setin 4 satırı var, yani 4 sahne. Her biri 4–6 saniye; ziyaretçi Next'e basınca bir sonrakine geçiliyor.
Benim kodla çizdiğim style frame'ler kompozisyon taslağı olarak kullanılabilir.

### Shot 1 · "Istanbul, 2017."
- **Sahne:** Denizden bakışla altın saatte İstanbul. Tarihi yarımada silüeti (kubbeler, minareler),
  Galata Kulesi ve denize batan güneş.
- **Yerleşim:** Silüet ve güneş yeşil alanda. Sol taraf sakin gökyüzü ve deniz.
- **Hareket:**
  - Su parıltısı: 4 kare, 8 fps.
  - Martılar: 2 kare kanat çırpma, 4 fps. Kod onları gökyüzünde gezdirir.
  - İstersen bir vapur silüeti: tek kare yeter, kod yavaşça kaydırır.
- **Referans:** Benim 1. style frame'im. Varsa kendi İstanbul fotoğrafların.

### Shot 2 · "Fahreddin Kerim Gökay Anatolian High School — science track. Volleyball starts here."
- **Sahne:** Okulun cephesi.
  - Bina: Koyu turuncu ve krem cephe, iki yanda sivri kemerli alınlıklar, ortada kemerli pencereler.
  - Giriş: Üç kapılı merdivenli giriş, üstünde okul tabelası ve önünde bayraklar.
  - Önünde çizgili okul bahçesinde sen, manşet çalışıyorsun.
- **Işık:** Altın saat (karar verildi). Cepheye sağdan sıcak ışık vurur, bahçede sola düşen uzun gölgeler olur.
- **Taslak:** `drafts/shot2-background.png`. Kodla çizilmiş 320 × 180 bir alt çizim. Aseprite'ta açıp
  üstüne kendi çizimini yapabilirsin. Diğer sahnelerin taslakları da `drafts/` içinde.
- **Yerleşim:** Binanın gölgede kalan sol kanadı kırmızı alana düşebilir. Sen ve top yeşil alanda.
- **Hareket:**
  - Manşet döngüsü: 4–6 kare. Referans `lise-antrenman/lise-08` … `lise-13`, gri tişörtlü oyuncunun hazır
    duruşu ve manşeti.
  - Top: 6 kare ya da kod hareket ettirir.
  - Bayraklar: 3 kare dalgalanma.
- **Referans:** `fahreddin kerim gökay anadolu lisesi.jpg` ve `… 2.jpg`.
- **Not:** Cephede çok pencere var. Bu ölçekte her pencere 2 × 3 px civarı olur, sadeleştir.

### Shot 3 · "First match: I played libero. We lost badly."
- **Sahne:** Okul salonu. Krem duvarlar, alt kısmı mavi bant, açık renk parke, mavi orta daire ve tavanda
  sıra sıra lambalar.
- **Aksiyon:** Farklı renk formalı libero (sen) topa uzanıyor, top elinin hemen önüne düşüyor. Karşı takım
  seviniyor. Duvarda turuncu LED'li bir skorbord.
- **Hareket:**
  - Libero: Koşu → uzanma → kayma, 6 kare.
  - Top: Yere çarpıp sekme, 4 kare.
  - Karşı takım: Sevinç, 2 kare.
  - Skorbord: Yanıp sönme.
- **Referans:** `_tracing/lise-antrenman/` (salon), `volleyball court.jpeg` (skorbord, bayrak, tavan).
- **Not:** Skorbordda gerçek skoru hatırlıyorsan onu yaz. Hatırlamıyorsan rakam uydurmayalım, `– –` gibi
  bulanık bırak.

### Shot 4 · "Early 2020: the national high-school championship in Aydın. Middle blocker — hard, and great."
- **Sahne:** Aydın'daki salon.
  - Duvarlar: Krem, alt kısmı somon rengi.
  - Tavan: Mavi çelik kafes, asılı lambalar.
  - Detaylar: Türk bayrakları, "Aydın Gençlik ve Spor İl Müdürlüğü" pankartı, turuncu LED skorbord,
    birkaç seyircili tribün, turuncu-mavi saha.
- **Aksiyon:** Takım forması mavi üzerine turuncu-beyaz şeritli. Sen **1 numarayla** orta oyuncu olarak
  filede bloktasın, karşıdan smaç geliyor.
- **Hareket:**
  - Blok sıçraması: 6–8 kare. Referans `lise-antrenman/lise-28` … `lise-30` (filede blok) ve `spike-12` …
    `spike-16` (sıçrama fiziği).
  - Karşı smaççı: 6 kare. `spike-12` … `spike-18` karelerinin aynası.
  - Top.
  - Seyirci: 2 kare kıpırdanma.
- **Referans:** `lise voleybol video/9784853e….jpg`. Fotoğrafta filede zıplayan 1 numara sensin;
  kompozisyon için birebir. Salon detayları için `e39f24ab….jpg`. 1 numaralı oyuncu orada topu servis
  için tutuyor.

## Diğer setler için not edilenler

- `volleyball court.jpeg`: Üniversite döneminde gidilen başka bir üniversitenin salonu. Set 1 değil, Set 3
  ya da Set 5 için.
- **Set 4 · Erasmus** (`erasmus/` klasörü):
  - Brandenburg'da Havel kanalı üstünde köprü, Mart, koyu mavi gök, kırmızı tuğla fabrika binası.
  - Endüstri müzesi: sarı baret, mavi iş önlüğü, çelik konstrüksiyon.
  - Zaanse Schans yel değirmenleri (Instax fotoğrafı), Amsterdam sokakları, Dortmund ve analog film kareleri.
  - Arkadaşların yüzleri sadece referans. Çizimde silüet ya da sadeleştirilmiş figür olarak.
  - Kapıdaki oda tabelasında başka öğrencilerin isimleri var, onu kullanmayalım.

## Smaç (Set 5 ve final için, sonra)

`_tracing/spike/` içinde ağır çekim smacın 25 karesi var. Anahtar pozlar:

| Kare | Poz |
|---|---|
| 01–07 | koşu adımları |
| 08–09 | kollar geri ve ileri savruluyor |
| 10–11 | çömelme |
| 12 | sıçrama |
| 13–14 | vuruş kolu geride |
| 15–16 | topa temas |
| 17–18 | kolun devamı |
| 19–22 | iniş |

8 karelik bir pixel smaç için önerim: 04, 08, 10, 12, 14, 16, 18, 21.

## Gizlilik

- `graduation project- teslim.jpeg` fotoğrafında öğrenci numaraları görünüyor. Sadece referans olarak
  kalsın, asla siteye ya da repoya girmesin.
- Aile ve arkadaş fotoğrafları da sadece referans. Siteye girerlerse yalnızca silüet olarak.
