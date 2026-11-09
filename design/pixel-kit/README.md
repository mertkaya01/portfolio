# Pixel art kit — Set 1 (Lise)

Set 1'in pixel art kaynakları. Bu klasör siteye girmez, sadece çizim kaynağıdır. Sitenin kullandığı
dosyalar `public/art/set1/` altında durur; aynı isimle üstüne yazılan her PNG, kod değişmeden sahnede
görünür.

## Dosyalar

| Dosya | Ne için |
|---|---|
| `beyond-the-court.gpl` | Palet, **Aseprite** için (*Palette → Load Palette*) |
| `beyond-the-court.aco` | Aynı palet, **Photoshop** için (*Swatches → Import Swatches*) |
| `beyond-the-court.hex` | Aynı palet, düz liste (Lospec ve diğer araçlar) |
| `palette.png` | Paletin görseli |
| `guides-320x180.png` | Telefonda görünen orta alan (x 70–249). Referans katman olarak kullan, **dışa aktarma** |
| `guides-preview-4x.png` | Aynı rehber, rahat bakmak için 4× büyük |
| `drafts/*.png` | Koddan çizilen taslak arka planlar (`npm run art:drafts`), üstüne boyamak için |
| `character/make-sheet.py` | Senin karakter çizimlerinden Set 1'in sprite sayfasını üreten betik |
| `character/mert-highschool.png` | Üretilen sprite sayfasının kopyası |

İzlemek için video kareleri `Desktop/portfolio-refs/_tracing/` klasöründe. İçlerinde başka insanlar
olduğu için repoya girmiyorlar.

## Kurulum

**Aseprite**
1. *File → New*: **320 × 180**, Color Mode: RGB.
2. *Palette → Load Palette* → `beyond-the-court.gpl`.
3. *Layer → New Reference Layer from File* → `guides-320x180.png`. Referans katmanlar dışa aktarılmaz.

**Photoshop**
1. *File → New*: **320 × 180 px**. *Preferences → General → Image Interpolation: Nearest Neighbor*.
2. Fırça değil **Pencil** aracı, anti-aliasing kapalı.
3. *Swatches → Import Swatches* → `beyond-the-court.aco`.
4. `guides-320x180.png` dosyasını en üstte kilitli bir katmana koy, dışa aktarmadan önce gizle.

## Görünüm: üstten RPG açısı

Set 1'in bütün sahneleri biraz yukarıdan bakan bir RPG gibi çizildi; karakterler de aynı açıda.

- Sahne **320 × 180**. Ekranda her piksel masaüstünde 3×–6×, telefonda 2× büyür.
- Telefonda sadece **x 70–249** görünür; önemli olan her şey bu aralıkta durmalı.
- Altyazı resmin altında, ayrı bir satırda durur. Resmin içinde yazı için yer bırakmaya gerek yok.
- Eşyalara 1 px koyu kontur verildi; gölgeler sağ alta düşüyor (ışık sol üstten).

## Karakter

Set 1'deki Mert, senin 64 px karakter çizimlerinden üretildi. Bunun için `character/make-sheet.py` şunları yapıyor:

- Renkleri temiz bir palete oturtuyor.
- Sakalı siliyor (lisede sakal yok).
- Arka görünümün hatlarına bir ön görünüm ekliyor.
- Voleybol duruşları üretiyor.
- Her kareyi bir de spor kıyafetiyle tekrar çiziyor.

```bash
python design/pixel-kit/character/make-sheet.py "../portfolio-refs/mertkaya_pixel_deneme"
```

Sayfa `public/art/set1/mert/mert.png`, kareler **28 × 40**: üstte 4, yanlarda 2 boş piksel; kollar
kalkınca sığsın diye.

| Kare | Ne |
|---|---|
| 0–1 | Sağa bakıyor, duruyor / adım |
| 2–3 | Sola bakıyor, duruyor / adım |
| 4–5 | Arkadan, duruyor / adım |
| 6–7 | Önden, duruyor / adım |
| 8 | Kollar yukarıda: pas, blok, sevinç |
| 9 | Manşet |
| 10 | Hazır duruşu |

İkinci satır (y 40–79) aynı karelerin spor kıyafetli halidir: forma, şerit, şort, dizlik. Sola bakan
duruşlar sağa bakanların aynadaki halidir.

Sahneler aynı sayfadan başka insanlar da çizer (sınıf arkadaşları, takım, öğretmen):

- Saç ve ceket renkleri değiştirilir.
- Yüz görünmez; çoğu arkadan ya da yandan.
- Gözün kendi rengi vardır, saç rengi değişince kırmızıya dönmez.

Dönem dönem saç:

- **Lise (2017–2021):** Kısa saç.
- **Üniversite:** Uzun saç, topuz. Mezuniyete bir dönem kala kesildi.
- **Şimdi:** Kısa, geriye taranmış saç ve kısa sakal.

## Sahneler

Kod: `src/quest/chapters/highschool/`. Her sahne bir arka plan PNG'si artı onun üstünde koddan çizilen
hareketli katmanlardır.

| Adım | Dosya | Arka plan | Hareket eden |
|---|---|---|---|
| Skorbord (ilk açılış) | `arena.ts` | `arena/background.png` | Işıklar yanar, kamera skorborda yaklaşır |
| Skorbord (yakın plan) | `scoreboard.ts` | `scoreboard/background.png` | LED yazılar sırayla yanar |
| `wake` | `room.ts` | `room/background.png` | Saat çalar, Mert kalkıp kapıdan çıkar |
| `bus` | `bus.ts` | `bus/background.png` | Otobüs yanaşır, Mert'i alıp gider |
| `class` | `class.ts` | `class/background.png` | Öğretmen yazar, sıra arkadaşı fısıldar |
| `lunch` | `yard.ts` | `yard/background.png` | Dört kişi pas, manşet ile topu döndürür |
| `training` | `court.ts` | `court/background.png` | Aydın 2020: smaç, çift blok, sevinç |
| `night` | `room.ts` | `room/background.png` | Bilgisayarda ders, sonra uyku |

Taslak arka planları yeniden üretmek için:

```bash
npm run art:drafts
```

Bu komut `public/art/set1/` ve `drafts/` klasörlerindeki dosyaları koddan yeniden çizer. Kendi
çizdiğin bir PNG'yi `public/art/set1/` altına koyduysan, komutu çalıştırmadan önce yedeğini al.

## Diğer setler

Diğer setler PNG kullanmıyor, tamamen koddan çiziliyor:

- **Set 2, karakalem:** `src/quest/chapters/exam/`. SVG, kendini çizen çizgiler, el yazısı (Caveat).
- **Set 3, ASCII:** `src/quest/chapters/university/`. 80 × 27 karakterlik amber terminal.
- **Set 4, vektör:** `src/quest/chapters/erasmus/`. Düz renkli SVG.
- **Set 5, 3D:** `src/quest/chapters/now/`. three.js ile düşük poligonlu salon ve final smaçı. Sadece Set 5 yaklaşınca yüklenir.
