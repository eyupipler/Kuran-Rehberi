# Kaynaklar

Bu belge, Kuran Rehberi'nde gösterilen metin, meal ve analiz verilerinin nereden geldiğini listeler. Amaç, kullanıcının ekranda gördüğü her bilginin izini sürebilmesidir.

Bir veride hata veya eksik lisans bilgisi fark ederseniz lütfen issue açın.

---

## 1. Kuran metni

| Alan | Bilgi |
|------|-------|
| İçerik | Arapça Kuran metni (Uthmani hat) |
| Kaynak | [Tanzil.net](https://tanzil.net) |
| Dosya | `data/translations/ar.uthmani.json` |
| Lisans | Creative Commons Attribution 3.0 (CC-BY 3.0) |
| Not | Tanzil metni değiştirilmeden aktarılmıştır. |

---

## 2. Türkçe mealler

Tüm Türkçe mealler `data/translations/tr.*.json` dosyalarında tutulur ve veritabanına `backend/src/db/import.js` ile aktarılır.

| Kod | Meal |
|-----|------|
| `tr.diyanet` | Diyanet İşleri |
| `tr.vakfi` | Diyanet Vakfı |
| `tr.yazir` | Elmalılı Hamdi Yazır |
| `tr.ates` | Süleyman Ateş |
| `tr.bulac` | Ali Bulaç |
| `tr.ozturk` | Yaşar Nuri Öztürk |
| `tr.golpinarli` | Abdülbaki Gölpınarlı |
| `tr.parliyan` | Abdullah Parlıyan |
| `tr.ugur` | Adem Uğur |
| `tr.hulusi` | Ahmed Hulusi |
| `tr.varol` | Ahmet Varol |
| `tr.yavuz` | Ali Fikri Yavuz |
| `tr.bayrakli` | Bayraktar Bayraklı |
| `tr.sadak` | Bekir Sadak |
| `tr.yildirim_celal` | Celal Yıldırım |
| `tr.kulunkoglu` | Cemal Külünkoğlu |
| `tr.edip` | Edip Yüksel |
| `tr.fizilal` | Fizilal-il Kuran |
| `tr.onan` | Gültekin Onan |
| `tr.yildirim_harun` | Harun Yıldırım |
| `tr.cantay` | Hasan Basri Çantay |
| `tr.hayrat` | Hayrat Neşriyat |
| `tr.kesir` | İbn-i Kesir |
| `tr.yorulmaz` | İlyas Yorulmaz |
| `tr.mihr` | İskender Ali Mihr |
| `tr.celik` | Kadri Çelik |
| `tr.esed` | Muhammed Esed |
| `tr.islamoglu` | Mustafa İslamoğlu |
| `tr.bilmen` | Ömer Nasuhi Bilmen |
| `tr.ongut` | Ömer Öngüt |
| `tr.piris` | Şaban Piriş |
| `tr.turkmen` | Sadık Türkmen |
| `tr.kutub` | Seyyid Kutub |
| `tr.yildirim_suat` | Suat Yıldırım |
| `tr.tefhim` | Tefhim-ul Kuran |
| `tr.yilmaz` | Hakkı Yılmaz |
| `tr.gunes` | Şinasi Güneş |

**Toplama kaynakları**

- [Tanzil.net](https://tanzil.net) — çoğu meal, CC-BY 3.0.
- [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api) — Tanzil'de bulunmayan mealler için toplayıcı depo (Unlicense).
- [apacikkuran.com](https://apacikkuran.com) — Şinasi Güneş meali (`backend/src/db/scrape-apacik.js`).
- Hakkı Yılmaz meali `backend/src/db/parse-yilmaz.js` ile ayrıştırılmıştır.

**Telif uyarısı**

Meallerin bir kısmı hâlâ telif korumasındadır. Bu depo mealleri araştırma ve kişisel kullanım amacıyla bir araya getirir. Hak sahibi olup içeriğin kaldırılmasını isteyen olursa issue açması yeterlidir; ilgili meal kaldırılır.

---

## 3. İngilizce mealler

| Kod | Meal |
|-----|------|
| `en.sahih` | Sahih International |
| `en.yusufali` | Abdullah Yusuf Ali |
| `en.pickthall` | Mohammad Marmaduke Pickthall |
| `en.arberry` | Arthur John Arberry |
| `en.haleem` | Abdel Haleem |
| `en.kamal` | Dr Kamal Omar |

Kaynak: Tanzil.net ve fawazahmed0/quran-api.

---

## 4. Morfoloji ve kelime kökleri

| Alan | Bilgi |
|------|-------|
| İçerik | Kelime bazlı morfolojik ayrıştırma, lemma, kelime türü, kök |
| Kaynak | [Quranic Arabic Corpus](https://corpus.quran.com) — Kais Dukes |
| Dosya | `data/morphology/quran-morphology.txt` |
| Lisans | GNU General Public License |
| Not | Kelime türü kısaltmalarının Türkçe karşılıkları `frontend/src/features/verse/partOfSpeech.ts` içinde eşlenir. |

---

## 5. Kök anlamları (Türkçe)

Kök anlamları iki kaynaktan gelir:

1. **Elle hazırlanmış sözlük** — `backend/src/db/root-dictionary.js`, `root-meanings-tr.js`, `roots-extra-tr.js`, `particles-tr.js`, `pronouns-tr.js`. Bu dosyalar bu depo için derlenmiştir.
2. **Türetilmiş anlamlar** — Sözlükte karşılığı olmayan kökler için, o kökten türeyen kelimelerin Türkçe karşılıkları sıklığa göre birleştirilir (`backend/src/routes/roots.js` içindeki `enrichRoots`).

Türetilmiş anlamlar arayüzde **"Anlam, kelime kullanımlarından türetilmiştir"** notuyla işaretlenir. Bunlar sözlük tanımı değildir, istatistiksel bir özettir.

---

## 6. Kelime bazlı Türkçe karşılıklar

| Alan | Bilgi |
|------|-------|
| Dosya | `data/word-translations-tr.json` |
| Yöntem | Morfoloji verisi ile Türkçe meallerin hizalanmasından üretilmiştir (`backend/src/db/fill-word-translations.js`) |
| Doğruluk | Otomatik hizalama olduğu için her kelimede birebir doğru olmayabilir. Meal içindeki vurgulama da bu veriye dayanır ve yaklaşık bir eşleştirmedir. |

---

## 7. İlgili ayetler

| Alan | Bilgi |
|------|-------|
| Dosya | `data/related-verses.json` |
| Yöntem | Bu depo için elle derlenmiş anlam bütünlüğü bağlantıları |
| Not | Tefsir otoritesi taşımaz; araştırmayı kolaylaştırmak için hazırlanmış bir yönlendirme listesidir. |

---

## 8. Sure bilgileri

| Alan | Bilgi |
|------|-------|
| İçerik | Sure adı, Arapça adı, ayet sayısı, Mekki/Medeni, iniş sırası |
| Dosya | `data/surahs.json` |
| Kaynak | Tanzil.net sure meta verisi |

---

## 9. Transliterasyon

Arapça metnin Latin okunuşu `frontend/src/utils/transliteration.ts` içinde kural tabanlı olarak üretilir. Harf harf yaklaşık bir dönüşümdür; tecvid kurallarını yansıtmaz ve telaffuz rehberi olarak kullanılmamalıdır.

---

## 10. Uygulamada bulunmayan veriler

Aşağıdakiler bilinçli olarak eklenmemiştir:

- **Ses kayıtları / kıraat** — Kullanım şartları netleştirilmiş güvenilir bir kaynak belirlenmeden ses dosyası eklenmeyecektir.
- **Tefsir metinleri** — Telif durumu netleşmeden eklenmeyecektir.

---

## Geri bildirim

Kaynak, lisans veya veri doğruluğuyla ilgili düzeltmeler için depoda issue açabilirsiniz.
