# 📚 Panduan Deployment Rikosan dengan Next.js + Turso

## Daftar Isi
1. [Overview](#overview)
2. [Arsitektur & Tech Stack](#arsitektur--tech-stack)
3. [Persiapan Turso](#persiapan-turso)
4. [Deployment ke Vercel](#deployment-ke-vercel)
5. [Deployment ke Fly.io](#deployment-ke-flyio)
6. [Deployment ke Render](#deployment-ke-render)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Rikosan** adalah aplikasi admin panel untuk manajemen kelas, siswa, absensi, dan keuangan.

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Database Dev**: SQLite
- **Database Prod**: Turso (libSQL, MySQL-compatible)
- **Authentication**: NextAuth + JWT
- **UI**: TailwindCSS + shadcn/ui

### Fitur Utama
✅ Sistem Login Admin  
✅ Manajemen Siswa (Tambah, Edit, Hapus)  
✅ Manajemen Kelas (12 Kelas × 5 Sesi)  
✅ Absensi & Laporan  
✅ Manajemen Keuangan  
✅ Import/Export Data Excel  

---

## Arsitektur & Tech Stack

### Frontend (Next.js Standalone)
```
src/
├── app/
│   ├── admin/       # Admin dashboard pages
│   ├── api/         # API routes (POST, PUT, DELETE)
│   └── page.tsx     # Landing page
├── components/      # UI components + AddStudentForm
└── lib/             # Auth, DB client
```

### Backend (API Routes)
```
/api/admin/students      # CRUD siswa ✅ Validasi unik ID
/api/admin/classes       # Manajemen kelas
/api/admin/attendance    # Absensi
/api/admin/finance       # Keuangan
/api/auth/login          # Login
```

### Database (Turso/libSQL)
```sql
-- 12 Kelas (Kelas 1 - Kelas 12)
-- 5 Sesi per Kelas (Sesi 1-5, 10:00-19:30)
-- Students dengan ID unik (S001, A001, dll)
-- Attendance records & Finance logs
```

---

## Persiapan Turso

### 1. Buat Account Turso

**Via CLI:**
```bash
npm install -g @tursodatabase/cli
turso auth signup
# Atau daftar di: https://turso.tech
```

**Via Web:**
- Kunjungi https://turso.tech/
- Sign up dengan email
- Verifikasi email

### 2. Buat Database Rikosan

```bash
turso db create rikosan-prod

# Output:
# Created database rikosan-prod
# Database URL: libsql://rikosan-prod-<username>.turso.io
# Auth token: <your_auth_token>
```

### 3. Dapatkan Credentials

```bash
turso db show rikosan-prod --json

# Output:
{
  "name": "rikosan-prod",
  "url": "libsql://rikosan-prod-<username>.turso.io",
  "auth_token": "eyJ0eXAi..."
}
```

### 4. Setup Environment Variables

**Simpan credentials untuk nanti:**
```
TURSO_DATABASE_URL=libsql://rikosan-prod-<username>.turso.io
TURSO_AUTH_TOKEN=eyJ0eXAi...
```

> ⚠️ **JANGAN commit credentials ke GitHub!** Simpan hanya di hosting platform secrets.

---

## Deployment ke Vercel

### Rekomendasi ⭐ (Terbaik untuk Next.js)

**Keuntungan:**
- Deployment dari GitHub (auto-deploy on push)
- Domain custom gratis
- Edge Functions
- Built-in analytics & monitoring
- Integrasi dengan Turso siap pakai

### Langkah-Langkah

#### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: Rikosan app"
git remote add origin https://github.com/username/rikosan.git
git push -u origin main
```

#### 2. Sign Up Vercel

- Kunjungi https://vercel.com
- Sign up dengan GitHub account
- Authorize Vercel untuk akses repository

#### 3. Import Project ke Vercel

1. **Dashboard Vercel** → "Add New" → "Project"
2. **Select Repository** → Pilih `rikosan`
3. **Configure Project:**
   - Framework: `Next.js`
   - Root Directory: `.`
   - Build Command: `npm run build`
   - Output Directory: `.next/standalone`

4. **Environment Variables:**
   - Klik "Environment Variables"
   - Tambahkan:
     ```
     TURSO_DATABASE_URL = libsql://rikosan-prod-<username>.turso.io
     TURSO_AUTH_TOKEN = eyJ0eXAi...
     DATABASE_URL = [SAMA DENGAN TURSO_DATABASE_URL]
     NEXTAUTH_SECRET = (generate baru, minimal 32 karakter)
     ```

   Untuk generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   # Contoh: kLQpMnVxZ9wJqK3lP2vR8sT1uWfYhGaBcD5eF4jI6nO=
   ```

5. **Deploy Deployment**
   - Klik "Deploy"
   - Tunggu ~3-5 menit
   - Akses di `rikosan.vercel.app`

#### 4. Setup Domain Custom (Opsional)

1. **Beli domain** di Namecheap, GoDaddy, atau Cloudflare
2. **Di Vercel Settings:**
   - Domains → Add
   - Masukkan domain Anda
   - Ikuti instruksi DNS

---

## Deployment ke Fly.io

### Alternatif yang Baik

**Keuntungan:**
- Harga murah (~$5/bulan)
- Deploy dari GitHub
- Support custom domain
- Database bisa hosted sendiri atau pakai Turso

### Langkah-Langkah

#### 1. Install Fly CLI

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Verifikasi
flyctl version
```

#### 2. Login & Setup App

```bash
flyctl auth login

cd /workspaces/rikosan

flyctl apps create rikosan
# Atau jika sudah ada: flyctl apps open
```

#### 3. Buat `fly.toml`

```toml
app = "rikosan"
primary_region = "sin" # Singapore (terdekat Indo)

[build]
builder = "paketobuildpacks"

[env]
TURSO_DATABASE_URL = "libsql://rikosan-prod-<username>.turso.io"

[deploy]
strategy = "rolling"

[[services]]
internal_port = 3000
protocol = "tcp"

[[services.ports]]
port = 80
handlers = ["http"]

[[services.ports]]
port = 443
handlers = ["tls", "http"]
```

#### 4. Set Secrets

```bash
flyctl secrets set \
  TURSO_AUTH_TOKEN="eyJ0eXAi..." \
  NEXTAUTH_SECRET="kLQpMnVxZ9wJqK3lP2vR8sT1uWfYhGaBcD5eF4jI6nO="
```

#### 5. Deploy

```bash
flyctl deploy

# Output:
# Deployed to rikosan.fly.dev
```

#### 6. Custom Domain

```bash
flyctl certs create yourdomain.com
# Ikuti instruksi DNS
```

---

## Deployment ke Render

### Alternatif dengan Free Tier

**Keuntungan:**
- Free tier tersedia (dengan unlimited free database)
- Deploy dari GitHub
- Auto-deploy on push
- Cocok untuk prototyping

### Langkah-Langkah

#### 1. Sign Up Render

- Kunjungi https://render.com
- Sign up dengan GitHub

#### 2. Buat Web Service

1. **Dashboard** → "New +" → "Web Service"
2. **Select Repository** → `rikosan`
3. **Configure:**
   - **Name:** `rikosan`
   - **Region:** `Singapore` (closest to Indonesia)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`

4. **Environment Variables:**
   ```
   TURSO_DATABASE_URL=libsql://rikosan-prod-<username>.turso.io
   TURSO_AUTH_TOKEN=eyJ0eXAi...
   DATABASE_URL=[SAMA DENGAN TURSO_DATABASE_URL]
   NEXTAUTH_SECRET=kLQpMnVxZ9wJqK3lP2vR8sT1uWfYhGaBcD5eF4jI6nO=
   NODE_ENV=production
   ```

5. **Deploy**
   - Klik "Create Web Service"
   - Tunggu ~5-10 menit
   - Akses di `rikosan.onrender.com`

#### 6. Custom Domain

- Settings → Custom Domains
- Ikuti instruksi DNS

---

## Deployment ke Cloudflare Pages

### Pilihan Gratis yang ``lebih manusiawi``

Cloudflare Pages memberikan hosting **free tier** untuk aplikasi Next.js. 
Strategi yang disarankan adalah menggunakan adapter `@cloudflare/next-on-pages`
agar API route dan sisi server dijalankan via Cloudflare Workers (Edge runtime).

### Langkah-Langkah

1. **Install tool dan dependensi**

```bash
npm install -D @cloudflare/next-on-pages wrangler
npm install -g wrangler
```

> ⚠️ **Important**: Cloudflare Pages otomatis mendeteksi `bun` dan menjalankan
> `bun install --frozen-lockfile`. Karena proyek ini menggunakan **npm** dan
> `package-lock.json`, bun akan mengeluh jika lockfile tidak sinkron
> (`lockfile had changes, but lockfile is frozen`). Untuk menghindari error
> tersebut, _override install command_ pada konfigurasi Pages:
>
> - buka dashboard Pages → project Anda → **Settings → Build & Deploy**
> - set **Install Command** menjadi `npm ci` atau `npm install`
> - set **Build Command** menjadi `npm run build:cf` (sesuai skrip tadi)
>
> Dengan begitu, proses build akan memakai npm/ci alih‑alih bun dan masalah
> "frozen lockfile" akan hilang.



2. **Login ke Cloudflare**

```bash
wrangler login
# atau gunakan `wrangler config` dan masukkan API token dengan scope Pages
```

3. **Siapkan `wrangler.toml`**

Letakkan di root proyek:

```toml
name = "rikosan"
main = "./.next/standalone/worker.js"  # auto-built nanti
compatibility_date = "2025-01-01"
type = "javascript"

[build]
command = "npm run build && npx @cloudflare/next-on-pages build"
[build.upload]
format = "service-worker"
```

> _Catatan_: adapter `next-on-pages` akan membuat file `worker.js`
> yang mengemas seluruh aplikasi Next.js menjadi Cloudflare Worker.

4. **Update script di `package.json`**

Tambahkan:

```json
"scripts": {
  "build": "next build",
  "build:cf": "npm run build && npx @cloudflare/next-on-pages build",
  "deploy:cf": "wrangler deploy --env production"
}
```

5. **Set environment variables via `wrangler`**

```bash
wrangler secret put TURSO_DATABASE_URL
wrangler secret put TURSO_AUTH_TOKEN
wrangler secret put NEXTAUTH_SECRET
# Atau melalui dashboard Pages > Settings > Environment Variables
```

6. **Deploy**

```bash
npm run build:cf
wrangler deploy
# URL: https://rikosan.pages.dev (default) atau custom domain
```

7. **Custom Domain (Opsional)**

- Di dashboard Cloudflare Pages, tambahkan domain
- Ikuti instruksi DNS (A/AAAA record ke Pages atau Cloudflare proxy)

### Tips & Catatan

- **Turso** tetap sebagai database production; connection string
  disimpan sebagai secret.
- Cloudflare Workers memiliki batas ukuran bundle (~1 MB).
  Jika build melebihi, aktifkan `zone_id` dan `analytics_engine` 
  atau gunakan Workers Unbound (biaya minim).
- Anda juga bisa men-deploy ke **Cloudflare Workers** secara manual
  menggunakan `wrangler deploy --name rikosan-worker`.

---

## Testing & Verification

### 1. Test Landing Page

```bash
curl -I https://rikosan.yourdom.com/
# Expected: HTTP 200

# Desktop browser:
# ✅ Logo & menu visible
# ✅ Hero image displayed
# ✅ All sections rendered
```

### 2. Test Admin Login

```bash
# Buka: https://rikosan.yourdom.com/admin/login
# Login dengan:
# Email: charlien@starlish.com
# Password: starlish@218

# ✅ Redirect ke /admin/dashboard
# ✅ Session cookie set
```

### 3. Test Add Student Form

```bash
# Di admin dashboard:
# 1. Klik "Tambah Siswa"
# 2. Isi form:
#    - ID: S001
#    - Nama: Budi Santoso
#    - Kelas: Kelas 1
#    - Sesi: Sesi 1 (10:00 - 11:30)
# 3. Klik "Simpan"

# ✅ Form hidden, data saved to Turso
# ✅ Student appear di daftar
```

### 4. Test API Endpoint

```bash
# Get students
curl -X GET https://rikosan.yourdom.com/api/admin/students \
  -H "Cookie: authToken=<token>"

# Add student
curl -X POST https://rikosan.yourdom.com/api/admin/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "S002",
    "name": "Ana Putri",
    "classId": "<class_id>",
    "sessionId": "<session_id>"
  }'

# ✅ Expected: 200 OK with student data
```

### 5. Test Database (Optional)

```bash
# Verifikasi data di Turso
turso db shell rikosan-prod

> SELECT COUNT(*) FROM Student;
5

> SELECT * FROM Session LIMIT 5;
```

---

## Troubleshooting

### Problem: Login gagal (HTTP 500)

**Sebab:** Database tidak accessible  
**Solusi:**
```bash
# 1. Verifikasi env variables
vercel env ls  # atau flyctl secrets list

# 2. Check TURSO_DATABASE_URL format:
# ✅ libsql://rikosan-prod-*.turso.io
# ❌ https://... (salah format)

# 3. Re-deploy
vercel redeploy  # atau flyctl deploy
```

### Problem: Images tidak muncul

**Sebab:** Static assets tidak di-copy  
**Solusi:**
```bash
# Sudah diperbaiki di postbuild script:
# "postbuild": "cp -r .next/static .next/standalone/.next/static && cp -r public .next/standalone/public"

# Re-deploy jika belum menggunakan versi terbaru
```

### Problem: Form validation error

**Sebab:** ID sudah ada di database  
**Solusi:**
```bash
# Gunakan ID berbeda, misal:
# ✅ S001, S002, A001, B001
# ❌ Duplikat ID
```

### Problem: Student ID besar huruf/kecil

**Info:** Sistem auto uppercase  
```
Input: s001 → Stored: S001 ✅
```

---

## Environment Variables Checklist

```env
# Production (Vercel/Fly/Render)
TURSO_DATABASE_URL=libsql://rikosan-prod-<username>.turso.io
TURSO_AUTH_TOKEN=<actual_token>
DATABASE_URL=libsql://rikosan-prod-<username>.turso.io
NEXTAUTH_SECRET=<32_char_random>
NODE_ENV=production

# Development (local)
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=development
NEXTAUTH_SECRET=<any_secret_for_dev>
```

---

## Performance Tips

### 1. Database Optimization
```sql
-- Add indexes di Turso
CREATE INDEX idx_student_classid ON Student(classId);
CREATE INDEX idx_attendance_studentid ON Attendance(studentId);
CREATE INDEX idx_session_classid ON Session(classId);
```

### 2. Caching Strategy
```typescript
// Revalidate every 1 hour
revalidatePath('/api/admin/students', 'layout')
```

### 3. Monitor Performance
- **Vercel Analytics:** Dashboard → Analytics
- **Fly.io Metrics:** `flyctl metrics`
- **Turso:** Dashboard → Metrics

---

## Security Checklist

- ✅ Credentials di secrets, BUKAN di `.env` files
- ✅ `.next/standalone/.env` di `.gitignore`
- ✅ `NEXTAUTH_SECRET` random & strong
- ✅ HTTPS enforced di production
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS & CSRF protection

---

## Database Migration (SQLite → Turso)

### Automatic (Recommended)

```bash
# 1. Update schema ke libSQL
cp prisma/schema.prisma prisma/schema.turso.prisma
# Edit: datasource db { provider = "libsql" }

# 2. Deploy ke Turso
DATABASE_URL="<turso_url>" npx prisma db push --schema prisma/schema.turso.prisma

# 3. Seed data
DATABASE_URL="<turso_url>" node prisma/seed.js
```

### Manual Data Export

```bash
# Export dari SQLite
sqlite3 prisma/prisma/dev.db ".dump" > backup.sql

# Import ke Turso
turso db shell rikosan-prod < backup.sql
```

---

## CI/CD Pipeline (GitHub Actions - Optional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm install
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Support & Resources

- **Turso Docs:** https://docs.turso.tech
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **Fly.io Docs:** https://fly.io/docs
- **Render Docs:** https://render.com/docs

---

## Ringkasan Quick Start

```bash
# 1. Siapkan Turso
turso auth signup
turso db create rikosan-prod
turso db show rikosan-prod --json  # Catat credentials

# 2. Deploy ke Vercel
git push
# → Connect repository di vercel.com
# → Set env vars
# → Deploy

# 3. Setup Domain
# → Beli domain di Namecheap/GoDaddy
# → Add custom domain di Vercel
# → Update DNS records

# 4. Test
# → Login ke admin panel
# → Add student
# → Verify data di Turso

# ✅ Done!
```

---

**Terima kasih sudah menggunakan Rikosan! 🚀**

Untuk pertanyaan atau bug report, hubungi tim development.
