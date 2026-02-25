# 📝 Form "Tambah Siswa Baru" - Dokumentasi Lengkap

## 📋 Daftar Isi
1. [Overview](#overview)
2. [Fitur Utama](#fitur-utama)
3. [Struktur Komponen](#struktur-komponen)
4. [Validasi & Business Logic](#validasi--business-logic)
5. [Backend Integration](#backend-integration)
6. [Cara Menggunakan](#cara-menggunakan)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Form **"Tambah Siswa Baru"** adalah dialog form yang responsif untuk menambahkan siswa baru ke sistem Rikosan dengan:

✅ **Frontend:** React Hook Form + shadcn/ui components  
✅ **Backend:** Next.js API Route (`POST /api/admin/students`)  
✅ **Database:** Turso (libSQL) / SQLite (development)  
✅ **Validasi:** Client-side + Server-side  
✅ **UI/UX:** Modal dialog dengan error handling yang baik  

---

## Fitur Utama

### 1. **Field ID Siswa**
- Format: Alfanumerik (S001, A001, B123, dll)
- Min 3 karakter, Max 10 karakter
- **Unik** di database (validasi backend)
- Auto uppercase
- Contoh: S001, A001, X2024

### 2. **Field Nama Lengkap**
- Required
- Max 255 karakter
- Support UTF-8 (nama Indonesia)
- Contoh: "Budi Santoso", "Siti Nurhaliza"

### 3. **Field Kelas**
- **Dropdown** dengan 12 kelas
- Setiap kelas sudah auto-linked dengan guru
- Required
- Format: "Kelas 1", "Kelas 2", ..., "Kelas 12"

### 4. **Field Pilih Sesi**
- **Dropdown** dengan 5 sesi per kelas
- Required
- Format: "Sesi N (HH:MM - HH:MM)"
- Jam session:
  - Sesi 1: 10:00 - 11:30
  - Sesi 2: 11:30 - 13:00
  - Sesi 3: 13:30 - 15:00
  - Sesi 4: 15:00 - 16:30
  - Sesi 5: 17:00 - 19:30

### 5. **Tombol**
- **Batal**: Reset form & close modal
- **Simpan**: Validate & submit ke API

### 6. **Error Handling**
- Field validation error di bawah input
- Toast error untuk duplicate ID
- Loading state saat submit
- Success message setelah save

---

## Struktur Komponen

### File Location
```
src/components/AddStudentForm.tsx  (280 lines)
src/app/admin/students/page.tsx    (updated integration)
```

### Component Props

```typescript
interface AddStudentFormProps {
  // Dialog control
  open: boolean
  onOpenChange: (open: boolean) => void
  
  // Callback setelah save
  onSuccess?: () => void
  
  // Data untuk dropdown
  classes: Array<{
    id: string           // Internal class ID
    name: string         // "Kelas 1", "Kelas 2", etc
  }>
  
  sessions: Array<{
    id: string           // Session ID
    name: string         // "Sesi 1", "Sesi 2", etc
    time: string | null  // "10:00 - 11:30"
  }>
}
```

### Component State

```typescript
interface FormData {
  studentId: string    // S001, A001, dll
  name: string         // Nama lengkap
  classId: string      // Class ID dari database
  sessionId: string    // Session ID dari database
}

interface FormErrors {
  studentId?: string   // "ID Siswa wajib diisi"
  name?: string        // "Nama Lengkap wajib diisi"
  classId?: string     // "Kelas wajib dipilih"
  sessionId?: string   // "Sesi wajib dipilih"
  submit?: string      // Error dari server
}
```

---

## Validasi & Business Logic

### Frontend Validation (Real-time)

```typescript
const validateForm = (): boolean => {
  const newErrors: FormErrors = {}

  // 1. Student ID validation
  if (!formData.studentId.trim()) {
    newErrors.studentId = 'ID Siswa wajib diisi'
  } else if (!/^[A-Z0-9]{3,}$/.test(formData.studentId.toUpperCase())) {
    newErrors.studentId = 'ID Siswa harus alfanumerik (min 3 karakter)'
  }

  // 2. Name validation
  if (!formData.name.trim()) {
    newErrors.name = 'Nama Lengkap wajib diisi'
  }

  // 3. Class validation
  if (!formData.classId) {
    newErrors.classId = 'Kelas wajib dipilih'
  }

  // 4. Session validation
  if (!formData.sessionId) {
    newErrors.sessionId = 'Sesi wajib dipilih'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### Backend Validation (Server)

```typescript
// POST /api/admin/students
- Student ID: Harus unik (case-insensitive)
- Name: Max 255 karakter
- Class ID: Harus ada di database
- Session ID: Harus milik class yang dipilih
- Output: Auto uppercase studentId
```

### Server Response Cases

| Case | Status | Response |
|------|--------|----------|
| Success | 200 | `{ student: {...} }` |
| Duplicate ID | 400 | `{ error: "ID siswa sudah digunakan" }` |
| Missing Field | 400 | `{ error: "ID siswa harus diisi" }` |
| Invalid Class | 400 | `{ error: "Kelas tidak valid" }` |
| Invalid Session | 400 | `{ error: "Sesi tidak valid" }` |
| Unauthorized | 401 | `{ error: "Unauthorized" }` |
| Server Error | 500 | `{ error: "Terjadi kesalahan" }` |

---

## Backend Integration

### API Endpoint

```typescript
// POST /api/admin/students
// Location: src/app/api/admin/students/route.ts

Request:
{
  "studentId": "S001",
  "name": "Budi Santoso",
  "classId": "kls_abc123",
  "sessionId": "sesi_1"
}

Response (200):
{
  "student": {
    "id": "student_xyz",
    "studentId": "S001",          // AUTO UPPERCASE
    "name": "Budi Santoso",
    "classId": "kls_abc123",
    "sessionId": "sesi_1",
    "createdAt": "2025-02-25T10:00:00Z",
    "class": { "id": "...", "name": "Kelas 1" },
    "session": { "id": "...", "name": "Sesi 1", "time": "10:00 - 11:30" }
  }
}
```

### Prisma Schema

```prisma
model Student {
  id        String   @id @default(cuid())
  studentId String   @unique  // S001, A001, dll
  name      String?
  classId   String   // FK to Class
  sessionId String?  // FK to Session
  
  class     Class    @relation(fields: [classId], references: [id])
  session   Session? @relation(fields: [sessionId], references: [id])
  
  @@index([classId])
  @@index([sessionId])
}
```

### Database Constraints

```sql
-- Unique constraint
CREATE UNIQUE INDEX idx_student_id ON Student(studentId);

-- Foreign key constraints
-- classId must exist in Class table
-- sessionId must exist in Session table AND belong to classId

-- Cascade delete
-- Delete attendance records if student deleted
```

---

## Cara Menggunakan

### 1. **Import Component**

```tsx
import { AddStudentForm } from '@/components/AddStudentForm'
```

### 2. **Setup State**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { AddStudentForm } from '@/components/AddStudentForm'

export default function StudentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    fetchClassesAndSessions()
  }, [])

  const fetchClassesAndSessions = async () => {
    // Fetch dari /api/admin/classes
    const res = await fetch('/api/admin/classes')
    const data = await res.json()
    setClasses(data.classes)
    
    // Get sessions dari first class
    if (data.classes.length > 0) {
      setSessions(data.classes[0].sessions)
    }
  }

  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Tambah Siswa
      </button>

      <AddStudentForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={() => {
          fetchClassesAndSessions() // Refresh
          setShowForm(false)
        }}
        classes={classes}
        sessions={sessions}
      />
    </div>
  )
}
```

### 3. **Integrate dengan Existing Students Page**

Sudah terintegrasi di `/src/app/admin/students/page.tsx`:

```tsx
<AddStudentForm
  open={showAddModal}
  onOpenChange={setShowAddModal}
  onSuccess={fetchData}  // Refresh data after add
  classes={classes}
  sessions={selectedClass?.sessions || []}
/>
```

### 4. **Handle Form Submission**

Form component mengirim POST ke `/api/admin/students` secara otomatis:
- Validasi client-side
- Loading state
- Error handling
- Success callback

---

## Testing

### 1. **Unit Test - Form Validation**

```typescript
// __tests__/AddStudentForm.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddStudentForm } from '@/components/AddStudentForm'

describe('AddStudentForm', () => {
  it('should show error if studentId is empty', async () => {
    render(
      <AddStudentForm
        open={true}
        onOpenChange={() => {}}
        classes={[]}
        sessions={[]}
      />
    )

    const saveBtn = screen.getByText('Simpan')
    await userEvent.click(saveBtn)

    expect(screen.getByText('ID Siswa wajib diisi')).toBeInTheDocument()
  })

  it('should show error if duplicate studentId', async () => {
    // Mock POST to return 400 with duplicate error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: 'ID siswa sudah digunakan'
        })
      })
    )

    // ... render and test
  })
})
```

### 2. **Integration Test - API & Form**

```bash
# Curl test - Add student
curl -X POST http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=<token>" \
  -d '{
    "studentId": "S001",
    "name": "Budi Santoso",
    "classId": "<class_id>",
    "sessionId": "<session_id>"
  }'

# Expected: 200 OK with student data
```

### 3. **Manual Testing Steps**

```
1. Login ke admin dashboard
2. Go to "Data Siswa" (Students page)
3. Klik "Tambah Siswa"
4. Isi form:
   - ID: S001
   - Nama: Budi Santoso
   - Kelas: Kelas 1 (dropdown)
   - Sesi: Sesi 1 - 10:00 - 11:30 (dropdown)
5. Klik "Simpan"
6. ✅ Modal close, student muncul di list
7. ✅ Data tersimpan di database

Test error cases:
- Leave ID empty → Error: "ID Siswa wajib diisi"
- Enter existing ID → Error: "ID siswa sudah digunakan"
- Leave name empty → Error: "Nama Lengkap wajib diisi"
- Click "Batal" → Form reset, modal close
```

### 4. **Performance Testing**

```
- Initial load: Form dialog should render in <100ms
- Submit: API call should complete in <1s
- Database: Unique index check on INSERT
```

---

## Troubleshooting

### Problem: "ID siswa sudah digunakan"

**Sebab:** Student ID sudah ada di database

**Solusi:**
```typescript
// Gunakan ID yang berbeda
// ✅ S001, S002, A001, A002
// ❌ Copy paste ID yang sudah ada

// Check existing IDs (admin):
SELECT studentId FROM Student ORDER BY studentId;
```

### Problem: "Kelas tidak valid"

**Sebab:** Class ID tidak ada atau invalid

**Solusi:**
```typescript
// Pastikan class ada di database
// Fetch ulang dari /api/admin/classes

const res = await fetch('/api/admin/classes')
const { classes } = await res.json()
console.log(classes) // Check available classes
```

### Problem: "Sesi tidak valid untuk kelas ini"

**Sebab:** Session ID tidak milik kelas yang dipilih

**Solusi:**
```typescript
// Filter sessions by selected class
const sessionsForClass = allSessions.filter(
  s => s.classId === selectedClassId
)

// Form component sudah handle ini otomatis
```

### Problem: Form tidak submit

**Sebab:** Validation error atau server unreachable

**Solusi:**
```typescript
// 1. Check browser console for errors
// 2. Check network tab for API call
// 3. Verify session cookie valid
// 4. Check server logs

tail -50 /tmp/server.log
```

### Problem: Style tidak muncul

**Sebab:** TailwindCSS atau shadcn/ui tidak loaded

**Solusi:**
```bash
# Rebuild CSS
npm run build

# Or development mode
npm run dev

# Check if tailwind.config.ts correct
# Check if globals.css imported
```

---

## Database Design

### Student Table Relationship

```sql
┌─────────────┐
│   Admin     │
└─────────────┘
      │
      │ (per class = 1 guru)
      ↓
┌─────────────┐         ┌───────────┐
│   Class     │────┬───→│  Session  │
│ (12 rows)   │    │    │ (5 per    │
└─────────────┘    │    │  class)   │
      ↑            │    └───────────┘
      │            │         ↑
      │            └────────┬┘
      │                     │
  classId              sessionId
      │                     │
      └──────┬──────────────┘
             │
        ┌────────────┐
        │  Student   │
        │(many rows) │
        └────────────┘
```

### Cascading Delete

```sql
-- Delete Student → Delete Attendance records
DELETE FROM Attendance WHERE Student.id = ?
DELETE FROM Student WHERE id = ?

-- Delete Class → Delete Sessions, Students, Attendances
-- (Not recommended in production)
```

---

## Performance Optimization

### 1. **Database Indexes**

```sql
-- Already created in schema:
- Student.studentId (UNIQUE)
- Student.classId
- Student.sessionId
- Class.id
- Session.id
```

### 2. **API Response Caching**

```typescript
// Frontend: Store classes/sessions in React state
const [classes, setClasses] = useState([])

// Only fetch once on mount:
useEffect(() => {
  if (classes.length === 0) {
    fetchClasses()
  }
}, [])
```

### 3. **Form Optimization**

```typescript
// Component uses:
- React.memo for form fields
- debounce untuk validation
- useCallback untuk handlers
```

---

## Security Considerations

### 1. **Authentication**
- ✅ All API endpoints protected (require session)
- ✅ JWT validation on backend

### 2. **Authorization**
- ✅ Only authenticated admins can add students
- ✅ Role-based access (super_admin, teacher)

### 3. **Data Validation**
- ✅ Client-side (UX)
- ✅ Server-side (Security)
- ✅ SQL injection prevention (Prisma ORM)

### 4. **Input Sanitization**
```typescript
// Form auto-sanitizes:
- Trim whitespace
- Uppercase studentId
- Limit field lengths
```

---

## Deployment Checklist

- [ ] Component tested locally
- [ ] API endpoint tested with Postman
- [ ] Form validation working
- [ ] Duplicate ID check working
- [ ] Database backup created
- [ ] Environment variables set on hosting
- [ ] HTTPS enabled
- [ ] Session security configured
- [ ] Rate limiting added (optional)
- [ ] Monitoring/logging enabled

---

## Related Files

| File | Purpose |
|------|---------|
| `src/components/AddStudentForm.tsx` | Form component |
| `src/app/admin/students/page.tsx` | Integration point |
| `src/app/api/admin/students/route.ts` | Backend API |
| `prisma/schema.prisma` | Database schema |
| `DEPLOYMENT.md` | Deployment guide |
| `API_DOCUMENTATION.md` | API docs (detailed) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-02-25 | Initial release |

---

## Support

Untuk pertanyaan atau issue:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) untuk hosting issues
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) untuk API questions
- Check browser console untuk JavaScript errors
- Check server logs: `tail -50 /tmp/server.log`

---

**Happy coding! 🚀**
