# 🚀 QUICK START - Form Tambah Siswa Baru

## 📌 TL;DR - Ringkasan Singkat

Form **"Tambah Siswa Baru"** sudah **siap pakai** dengan:

✅ **Frontend**: React component dengan validasi lengkap  
✅ **Backend**: Next.js API endpoint dengan database checks  
✅ **Database**: Turso (libSQL) untuk production, SQLite untuk dev  
✅ **Validasi**: Client-side + Server-side  
✅ **Hosting**: Rekomendasi Vercel/Fly.io/Render dengan Turso  

---

## 🎯 Fitur Form

### Field yang Tersedia
1. **ID Siswa** - Unik (S001, A001, etc)
2. **Nama Lengkap** - Required
3. **Kelas** - 12 pilihan (Kelas 1-12)
4. **Sesi** - 5 pilihan per kelas dengan jam:
   - Sesi 1: 10:00 - 11:30
   - Sesi 2: 11:30 - 13:00
   - Sesi 3: 13:30 - 15:00
   - Sesi 4: 15:00 - 16:30
   - Sesi 5: 17:00 - 19:30

### Tombol
- **Batal** → Reset form & tutup dialog
- **Simpan** → Validasi & simpan ke database

---

## 📂 File Location

```
src/components/AddStudentForm.tsx     ← Form component
src/app/admin/students/page.tsx       ← Sudah terintegrasi
src/app/api/admin/students/route.ts   ← Backend API
```

---

## 💻 Usage di Aplikasi

Form sudah terintegrasi di halaman **Data Siswa** (`/admin/students`):

```
1. Login ke admin panel
2. Menu → Data Siswa
3. Klik tombol "Tambah Siswa"
4. Isi form
5. Klik "Simpan"
```

---

## 🔌 Integration untuk Dev Baru

Jika ingin menggunakan form di halaman lain:

```tsx
import { AddStudentForm } from '@/components/AddStudentForm'

export default function Page() {
  const [open, setOpen] = useState(false)
  const [classes, setClasses] = useState([])

  return (
    <div>
      <button onClick={() => setOpen(true)}>Tambah Siswa</button>
      
      <AddStudentForm
        open={open}
        onOpenChange={setOpen}
        classes={classes}
        sessions={sessions}
        onSuccess={() => {
          // Refresh data setelah add
        }}
      />
    </div>
  )
}
```

---

## 🛢️ Database

Form menyimpan data ke tabel **Student**:

```sql
CREATE TABLE Student (
  id        TEXT PRIMARY KEY,
  studentId TEXT UNIQUE,        -- S001, A001 (auto uppercase)
  name      TEXT,
  classId   TEXT NOT NULL,       -- Kelas 1-12
  sessionId TEXT,                -- Sesi 1-5
  createdAt DATETIME,
  updatedAt DATETIME
);
```

---

## ✨ Validasi

### Frontend
- ID: Min 3 char, alphanumeric
- Nama: Required, min 1 char
- Kelas: Required
- Sesi: Required

### Backend
- ID: **UNIQUE** (400 error jika duplicate)
- Kelas: Must exist di database
- Sesi: Must milik class yang dipilih

---

## 🌍 Deployment Rekomendasi

### Pilihan Terbaik: **Vercel + Turso**

**Vercel:**
- Gratis tier dengan unlimited deploy
- Auto-deploy dari GitHub
- Domain custom bisa
- https://vercel.com

**Turso:**
- Database libSQL (MySQL-compatible)
- Gratis tier: 9GB storage
- Low latency (available globally)
- https://turso.tech

### Environment Variables (Production)

```env
# Di Vercel/Fly/Render settings:
TURSO_DATABASE_URL=libsql://rikosan-prod-username.turso.io
TURSO_AUTH_TOKEN=<YOUR_AUTH_TOKEN>
NEXTAUTH_SECRET=<RANDOM_32_CHAR>
```

---

## 📖 Dokumentasi Lengkap

Baca file dokumentasi untuk detail lebih:

1. **DEPLOYMENT.md** - Cara deploy ke Vercel/Fly.io/Render
2. **API_DOCUMENTATION.md** - Detail endpoint API
3. **FORM_DOCUMENTATION.md** - Seluruh dokumentasi form

---

## 🧪 Testing

### Test via Browser
1. Login: `charlien@starlish.com` / `starlish@218`
2. Ke halaman **Data Siswa**
3. Klik **Tambah Siswa**
4. Isi form dan submit

### Test via cURL

```bash
# Add student
curl -X POST http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "S001",
    "name": "Budi Santoso",
    "classId": "class_id_here",
    "sessionId": "session_id_here"
  }'

# Expected: 200 OK dengan student data
```

---

## ⚙️ Konfigurasi

### Ubah Jam Session

File: `prisma/seed.js`

```javascript
const sessionTimes = [
  { name: 'Sesi 1', time: '10:00 - 11:30' },
  { name: 'Sesi 2', time: '11:30 - 13:00' },
  { name: 'Sesi 3', time: '13:30 - 15:00' },
  { name: 'Sesi 4', time: '15:00 - 16:30' },
  { name: 'Sesi 5', time: '17:00 - 19:30' },
]

// Setelah edit:
npx prisma migrate reset --force
node prisma/seed.js
```

### Ubah Jumlah Kelas

File: `prisma/seed.js` - Edit loop 12 kelas ke jumlah yang diinginkan

---

## 🐛 Troubleshooting

### Error: "ID siswa sudah digunakan"
Gunakan ID yang berbeda. Setiap student harus punya ID unik.

### Error: "Kelas tidak valid"
Pastikan kelas sudah ada di database. Fetch dari `/api/admin/classes`.

### Form tidak muncul
Check browser console (F12) untuk JavaScript errors.

### Tidak bisa login
- Email/password salah
- Database tidak accessible
- Session expired

---

## 📱 Screenshots

### Form Dialog
```
┌─────────────────────────────────┐
│ Tambah Siswa Baru              │
│─────────────────────────────────│
│ ID Siswa (Unik) *              │
│ [S001              ]           │
│                                 │
│ Nama Siswa *                   │
│ [Budi Santoso      ]           │
│                                 │
│ Kelas *                        │
│ [Kelas 1           ▼]          │
│                                 │
│ Pilih Sesi *                   │
│ [Sesi 1 (10:00...) ▼]          │
│                                 │
│      [Batal] [Simpan]          │
└─────────────────────────────────┘
```

---

## 🔐 Security

✅ Password hashing (bcrypt)  
✅ HTTPS di production  
✅ JWT authentication  
✅ SQL injection prevention (Prisma)  
✅ CSRF protection  
✅ Credentials tidak di-commit  

---

## 📚 Tech Stack

```
Frontend:
- React 19
- TypeScript 5
- Framer Motion (animations)
- TailwindCSS 4
- shadcn/ui components

Backend:
- Next.js 16
- Node.js 20
- Prisma 6.11
- libSQL/Turso (prod)
- SQLite (dev)

Deployment:
- Vercel (recommended)
- Fly.io (alternative)
- Render (alternative)
```

---

## 📞 Support

**For detailed help:**
1. Read `DEPLOYMENT.md` for hosting issues
2. Read `API_DOCUMENTATION.md` for API details
3. Read `FORM_DOCUMENTATION.md` for form implementation
4. Check browser console (F12) for errors
5. Check server logs: `tail -50 /tmp/server.log`

---

## ✅ Checklist

- [x] Form component created
- [x] API endpoint implemented
- [x] Validation (client + server)
- [x] Integration dengan students page
- [x] Database schema ready
- [x] Deployment guide created
- [x] API documentation created
- [x] Form documentation created
- [x] Tested locally
- [x] Session times updated (10:00 - 19:30)

---

## 🎉 Next Steps

**Development:**
```bash
npm run dev
# Access: http://localhost:3000/admin/students
```

**Production:**
1. Buat account Turso (turso.tech)
2. Create database: `turso db create rikosan-prod`
3. Push ke Vercel
4. Set environment variables
5. Deploy! 🚀

---

**Created:** February 25, 2025  
**Status:** ✅ Production Ready  
**Support:** For issues, refer to documentation files above.
