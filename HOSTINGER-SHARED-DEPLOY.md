# Hostinger Shared Hosting'de Deploy Rehberi

Hostinger shared hosting PHP destekliyor, Node.js desteklemiyor. Bu yüzden:
- **Frontend** → Static HTML olarak Hostinger'a
- **Backend** → Render.com'da ücretsiz host

---

## ADIM 1: Backend'i Render.com'da Host Et (Ücretsiz)

### 1.1 GitHub'a Yükle

Önce projeyi GitHub'a yükleyin:

```bash
cd "D:/Kuran Rehberi"

# Git başlat
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluşturun, sonra:
git remote add origin https://github.com/KULLANICI_ADINIZ/kuran-rehberi.git
git branch -M main
git push -u origin main
```

### 1.2 Render.com'da Hesap Aç

1. https://render.com adresine gidin
2. GitHub ile giriş yapın

### 1.3 Backend Servisi Oluştur

1. Dashboard → **New +** → **Web Service**
2. GitHub repo'nuzu bağlayın
3. Ayarlar:
   - **Name:** kuran-rehberi-api
   - **Region:** Frankfurt (EU)
   - **Branch:** main
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

4. **Create Web Service** tıklayın

5. Deploy tamamlanınca URL alacaksınız:
   ```
   https://kuran-rehberi-api.onrender.com
   ```

### 1.4 Veritabanını Hazırla

Render'da ilk deploy'dan sonra veritabanı boş olacak.
Lokal'de oluşturduğunuz `kuran.db` dosyasını kullanmak için:

**Seçenek A: Persistent Disk (Ücretli)**
Render'da disk ekleyip veritabanını oraya koyabilirsiniz.

**Seçenek B: Build sırasında oluştur**
`package.json`'a ekleyin:
```json
"scripts": {
  "build": "npm run init-db && npm run import-data",
  "start": "node src/index.js"
}
```

Ve `data` klasörünü GitHub'a dahil edin (translations, morphology, surahs.json).

---

## ADIM 2: Frontend'i Build Et

### 2.1 API URL'sini Ayarla

`.env.production` dosyası oluşturun:

```bash
cd "D:/Kuran Rehberi/frontend"
```

`D:/Kuran Rehberi/frontend/.env.production` dosyası:
```
NEXT_PUBLIC_API_URL=https://kuran-rehberi-api.onrender.com
```

### 2.2 Static Build Al

```bash
cd "D:/Kuran Rehberi/frontend"
npm install
npm run build
```

Bu komut `out` klasörü oluşturur. İçinde tüm static dosyalar var.

---

## ADIM 3: Hostinger'a Yükle

### 3.1 Hostinger Panel'e Giriş

1. https://hpanel.hostinger.com adresine gidin
2. Hosting planınızı seçin

### 3.2 File Manager'ı Aç

1. Sol menüden **Files** → **File Manager**
2. `public_html` klasörüne girin
3. İçindeki tüm dosyaları silin (varsa)

### 3.3 Dosyaları Yükle

**Yöntem A: File Manager ile**
1. `out` klasöründeki TÜM dosyaları seçin
2. Sürükleyip `public_html`'e bırakın

**Yöntem B: FTP ile (Daha hızlı)**
1. Hostinger Panel → **Files** → **FTP Accounts**
2. FTP bilgilerini alın
3. FileZilla veya WinSCP kullanın:
   - Host: ftp.YOUR_DOMAIN.com
   - Username: FTP kullanıcı adı
   - Password: FTP şifresi
   - Port: 21
4. `out` klasörünün içeriğini `public_html`'e yükleyin

### 3.4 .htaccess Dosyası Ekle

`public_html` içine `.htaccess` dosyası oluşturun:

```apache
# Kuran Rehberi - Hostinger .htaccess

# CORS ayarları (API için)
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Gzip sıkıştırma
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 1 day"
</IfModule>

# URL Rewriting (SPA için)
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Mevcut dosya veya klasör varsa dokunma
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d

    # Trailing slash ekle
    RewriteCond %{REQUEST_URI} !/$
    RewriteCond %{REQUEST_URI} !\.html$
    RewriteRule ^(.*)$ $1/ [L,R=301]

    # index.html'e yönlendir
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /$1/index.html [L]
</IfModule>

# Güvenlik
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## ADIM 4: Domain Ayarları

### 4.1 SSL Sertifikası

1. Hostinger Panel → **SSL**
2. **Install SSL** tıklayın (ücretsiz Let's Encrypt)

### 4.2 HTTPS Yönlendirmesi

`.htaccess`'e ekleyin (en üste):
```apache
# HTTPS yönlendirmesi
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## ADIM 5: Test Et

1. https://YOUR_DOMAIN.com adresine gidin
2. Surelerin yüklendiğini kontrol edin
3. Arama özelliğini test edin
4. Bir sureye tıklayıp ayetlerin geldiğini kontrol edin

---

## Sorun Giderme

### "API bağlantı hatası"
- Render.com'daki backend URL'sinin doğru olduğundan emin olun
- `.env.production` dosyasını kontrol edin
- Tarayıcı Console'da hataları inceleyin

### "Sayfa bulunamadı (404)"
- `.htaccess` dosyasının doğru yüklendiğinden emin olun
- `out` klasöründeki tüm dosyaların yüklendiğini kontrol edin

### "Render ücretsiz plan yavaş"
- Ücretsiz planda servis 15 dk inaktivite sonrası uyur
- İlk istek 30-50 saniye sürebilir
- Ücretli plana geçerek ($7/ay) bu sorunu çözersiniz

---

## Dosya Yapısı (Hostinger'da)

```
public_html/
├── index.html
├── surah/
│   ├── 1/
│   │   └── index.html
│   ├── 2/
│   │   └── index.html
│   └── ... (114 sure)
├── search/
│   └── index.html
├── roots/
│   └── index.html
├── _next/
│   └── static/
│       ├── css/
│       └── chunks/
├── .htaccess
├── robots.txt
├── sitemap.xml
└── manifest.json
```

---

## Özet

| Bileşen | Platform | URL | Maliyet |
|---------|----------|-----|---------|
| Frontend | Hostinger | https://kuranrehberi.com | Hosting planı |
| Backend | Render.com | https://kuran-api.onrender.com | Ücretsiz |

**Toplam Maliyet:** Sadece Hostinger hosting planı (zaten sahipsiniz)
