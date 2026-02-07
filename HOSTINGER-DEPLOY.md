# Hostinger'da Next.js + Node.js Uygulaması Deploy Etme

## Seçenek 1: Hostinger VPS (Önerilen)

Hostinger VPS kullanıyorsanız, tam kontrol sizde olur.

### Adım 1: VPS'e Bağlanın
```bash
ssh root@YOUR_VPS_IP
```

### Adım 2: Node.js Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # v20.x olmalı
```

### Adım 3: PM2 Kurulumu (Process Manager)
```bash
npm install -g pm2
```

### Adım 4: Proje Dosyalarını Yükleyin
```bash
# Git ile
git clone https://github.com/YOUR_USERNAME/kuran-rehberi.git
cd kuran-rehberi

# Veya FTP/SFTP ile dosyaları yükleyin
```

### Adım 5: Backend Kurulumu
```bash
cd backend
npm install
npm run init-db
npm run import-data

# PM2 ile başlat
pm2 start src/index.js --name "kuran-api"
pm2 save
```

### Adım 6: Frontend Build & Başlatma
```bash
cd ../frontend
npm install
npm run build

# PM2 ile başlat
pm2 start npm --name "kuran-frontend" -- start
pm2 save

# Otomatik başlatma
pm2 startup
```

### Adım 7: Nginx Kurulumu (Reverse Proxy)
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/kuranrehberi
```

Nginx config:
```nginx
server {
    listen 80;
    server_name kuranrehberi.com www.kuranrehberi.com;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/kuranrehberi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Adım 8: SSL Sertifikası (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d kuranrehberi.com -d www.kuranrehberi.com
```

---

## Seçenek 2: Hostinger Shared Hosting (Sınırlı)

Shared hosting'de Node.js backend çalıştırmak zor. Alternatif:

### A) Sadece Frontend (Static Export)

Next.js'i static olarak export edip yükleyebilirsiniz:

```bash
# next.config.js'e ekle:
# output: 'export'

cd frontend
npm run build
# 'out' klasörü oluşur, bunu public_html'e yükleyin
```

**Not:** Bu durumda backend API çalışmaz. Vercel veya Railway gibi ücretsiz platformlarda backend host etmeniz gerekir.

### B) Backend İçin Alternatif Platformlar (Ücretsiz)

1. **Railway.app** - Node.js backend için ideal
2. **Render.com** - Ücretsiz tier mevcut
3. **Vercel** - Next.js için en iyi seçenek (Frontend + API Routes)
4. **Fly.io** - Ücretsiz tier mevcut

---

## Seçenek 3: Vercel'de Host Etme (En Kolay - Ücretsiz)

Vercel, Next.js'in yaratıcısı. En kolay deploy yöntemi:

### Adım 1: GitHub'a Yükleyin
```bash
cd "D:/Kuran Rehberi"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kuran-rehberi.git
git push -u origin main
```

### Adım 2: Vercel'e Bağlayın
1. https://vercel.com adresine gidin
2. GitHub ile giriş yapın
3. "New Project" → Repository'nizi seçin
4. Framework: Next.js (otomatik algılar)
5. Root Directory: `frontend`
6. Deploy!

### Adım 3: Backend için Vercel API Routes
Frontend'deki `/api` klasörüne backend kodlarını taşıyabilirsiniz. Vercel serverless functions olarak çalıştırır.

---

## Seçenek 4: Railway.app (Backend + Frontend Birlikte)

Railway, hem frontend hem backend için idealdir:

1. https://railway.app adresine gidin
2. GitHub repo'nuzu bağlayın
3. İki servis oluşturun:
   - Backend (Node.js)
   - Frontend (Next.js)
4. Environment variables ayarlayın
5. Deploy!

---

## Önemli Notlar

### Environment Variables
Production'da şu değişkenleri ayarlayın:
```
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=https://api.kuranrehberi.com
```

### Domain Ayarları (Hostinger)
1. Hostinger Panel → Domains → DNS Zone
2. A Record: @ → VPS IP adresi
3. A Record: www → VPS IP adresi
4. A Record: api → VPS IP adresi (backend için subdomain)

### SSL Sertifikası
- VPS: Let's Encrypt (ücretsiz)
- Vercel/Railway: Otomatik SSL

### Performans İpuçları
1. Cloudflare CDN kullanın (ücretsiz)
2. Resimleri optimize edin
3. Gzip sıkıştırma aktif edin
4. Browser caching ayarlayın

---

## Hızlı Başlangıç Özeti

| Platform | Zorluk | Maliyet | Önerilen |
|----------|--------|---------|----------|
| Vercel | Kolay | Ücretsiz | Frontend |
| Railway | Kolay | Ücretsiz* | Full-stack |
| Hostinger VPS | Orta | $5-10/ay | Full kontrol |
| Render | Kolay | Ücretsiz* | Backend |

*Ücretsiz tier limitleri var

**En kolay yol:** Vercel'de frontend, Railway'de backend host edin.
