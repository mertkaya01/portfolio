# Set 4 fotoğrafları

Set 4'te fotoğraf açan dört nokta var: üçü Havel sahnesinde, biri TH Brandenburg sahnesinde. Bir
noktaya tıklanınca buradaki fotoğraf açılır. Bir fotoğrafı bu klasöre noktanın adıyla koyman
yeterli; kodda değişiklik gerekmez.

| Dosya adı     | Nokta                                                  |
| ------------- | ------------------------------------------------------ |
| `bridge.jpeg` | Havel sahnesi: köprüde, Mert'in yanı                   |
| `river.jpeg`  | Havel sahnesi: nehrin üstü (gün batımı)                |
| `museum.jpeg` | Havel sahnesi: sağdaki bina (Sanayi Müzesi)            |
| `campus.jpeg` | TH Brandenburg sahnesi: başlığın yanı (yurttan kampüs) |

- Uzantı `.jpg`, `.jpeg`, `.png`, `.webp` ya da `.avif` olabilir.
- Uzun kenarı en fazla 1600 px olsun. Telefon fotoğrafını küçültmeden koyma: site yavaşlar.
- Fotoğrafı olmayan nokta canlı sitede görünmez. Geliştirme sunucusunda kesik çizgili yer tutucu olarak görünür.
- Fotoğraflar repoya, yani herkese açık siteye girer. Başkalarının yüzü görünen fotoğraf koyma.
- Açıklamaları `src/i18n/messages/en.ts` ve `tr.ts` içindeki `photos` bölümünde.
