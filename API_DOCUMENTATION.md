# 📋 API Documentation - Manajemen Siswa

## Base URL
```
Development:  http://localhost:3000
Production:   https://rikosan.yourdom.com
```

## Authentication
Semua endpoint memerlukan session yang valid (HTTP-only cookie).

---

## Endpoints

### 1. GET `/api/admin/students` - Ambil Daftar Siswa

**Deskripsi:** Mengambil daftar semua siswa (dengan filter optional)

**Method:** `GET`

**Query Parameters:**
| Parameter | Type | Required | Deskripsi |
|-----------|------|----------|-----------|
| `classId` | string | No | Filter by class ID |

**Request:**
```bash
curl -X GET "http://localhost:3000/api/admin/students?classId=kls_123" \
  -H "Cookie: authToken=<session_cookie>"
```

**Response (200 OK):**
```json
{
  "students": [
    {
      "id": "student_abc123",
      "studentId": "S001",
      "name": "Budi Santoso",
      "classId": "kls_123",
      "sessionId": "sesi_1",
      "createdAt": "2025-02-25T10:00:00Z",
      "updatedAt": "2025-02-25T10:00:00Z",
      "class": {
        "id": "kls_123",
        "name": "Kelas 1"
      },
      "session": {
        "id": "sesi_1",
        "name": "Sesi 1",
        "time": "10:00 - 11:30"
      }
    }
  ]
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

---

### 2. POST `/api/admin/students` - Tambah Siswa Baru ⭐

**Deskripsi:** Membuat siswa baru dengan validasi unik ID

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "studentId": "S001",
  "name": "Budi Santoso",
  "classId": "kls_123",
  "sessionId": "sesi_1"
}
```

**Field Details:**
| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| `studentId` | string | ✅ Yes | Min 3 char, alphanumeric, UNIQUE |
| `name` | string | ✅ Yes | Max 255 char |
| `classId` | string | ✅ Yes | Must exist in Class table |
| `sessionId` | string | ❌ No | Must belong to selected class |

**Request Example (cURL):**
```bash
curl -X POST http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=<session_cookie>" \
  -d '{
    "studentId": "S001",
    "name": "Budi Santoso",
    "classId": "kls_123",
    "sessionId": "sesi_1"
  }'
```

**Request Example (JavaScript/TypeScript):**
```typescript
// Using fetch
const response = await fetch('/api/admin/students', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    studentId: 'S001',
    name: 'Budi Santoso',
    classId: 'kls_123',
    sessionId: 'sesi_1',
  }),
  credentials: 'include', // Send cookies
});

const data = await response.json();
if (response.ok) {
  console.log('Student created:', data.student);
} else {
  console.error('Error:', data.error);
}
```

**Response (200 OK):**
```json
{
  "student": {
    "id": "student_abc123",
    "studentId": "S001",
    "name": "Budi Santoso",
    "classId": "kls_123",
    "sessionId": "sesi_1",
    "createdAt": "2025-02-25T10:00:00Z",
    "updatedAt": "2025-02-25T10:00:00Z",
    "class": {
      "id": "kls_123",
      "name": "Kelas 1"
    },
    "session": {
      "id": "sesi_1",
      "name": "Sesi 1",
      "time": "10:00 - 11:30"
    }
  }
}
```

**Error Response (400 Bad Request) - Missing Field:**
```json
{
  "error": "ID siswa harus diisi"
}
```

**Error Response (400 Bad Request) - Duplicate ID:**
```json
{
  "error": "ID siswa sudah digunakan. Gunakan ID lain."
}
```

**Error Response (400 Bad Request) - Invalid Class:**
```json
{
  "error": "Kelas tidak valid"
}
```

**Error Response (400 Bad Request) - Invalid Session:**
```json
{
  "error": "Sesi tidak valid untuk kelas ini"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (500 Server Error):**
```json
{
  "error": "Terjadi kesalahan saat menyimpan data"
}
```

---

### 3. PUT `/api/admin/students` - Edit Siswa

**Deskripsi:** Mengupdate data siswa

**Method:** `PUT`

**Request Body:**
```json
{
  "id": "student_abc123",
  "name": "Budi Santoso Wijaya",
  "classId": "kls_124",
  "sessionId": "sesi_2"
}
```

**Field Details:**
| Field | Type | Required | Validasi |
|-------|------|----------|----------|
| `id` | string | ✅ Yes | Student internal ID |
| `name` | string | ❌ No | Max 255 char |
| `classId` | string | ❌ No | Must exist in Class table |
| `sessionId` | string | ❌ No | Must belong to selected class |

**Request Example:**
```bash
curl -X PUT http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=<session_cookie>" \
  -d '{
    "id": "student_abc123",
    "name": "Budi Santoso Wijaya",
    "classId": "kls_124"
  }'
```

**Response (200 OK):**
```json
{
  "student": {
    "id": "student_abc123",
    "studentId": "S001",
    "name": "Budi Santoso Wijaya",
    "classId": "kls_124",
    "sessionId": "sesi_2",
    "updatedAt": "2025-02-25T11:00:00Z",
    "class": { "id": "kls_124", "name": "Kelas 2" },
    "session": { "id": "sesi_2", "name": "Sesi 2", "time": "11:30 - 13:00" }
  }
}
```

---

### 4. DELETE `/api/admin/students` - Hapus Siswa

**Deskripsi:** Menghapus siswa & attendance records-nya

**Method:** `DELETE`

**Request Body:**
```json
{
  "id": "student_abc123"
}
```

**Request Example:**
```bash
curl -X DELETE http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Cookie: authToken=<session_cookie>" \
  -d '{
    "id": "student_abc123"
  }'
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "ID siswa harus diisi"
}
```

---

## Form Component Usage (AddStudentForm)

### Props

```typescript
interface AddStudentFormProps {
  // Dialog state
  open: boolean                    // Is modal open
  onOpenChange: (open: boolean) => void  // Close modal handler
  
  // Callbacks
  onSuccess?: () => void           // Called after successful save
  
  // Data
  classes: Array<{                // List of 12 classes
    id: string
    name: string
  }>
  sessions: Array<{               // List of 5 sessions
    id: string
    name: string
    time: string | null           // "10:00 - 11:30"
  }>
}
```

### Example Usage

```tsx
'use client'

import { useState } from 'react'
import { AddStudentForm } from '@/components/AddStudentForm'

export default function MyPage() {
  const [showForm, setShowForm] = useState(false)
  const [classes, setClasses] = useState([])
  const [sessions, setSessions] = useState([])

  // Fetch classes and sessions
  useEffect(() => {
    const fetchData = async () => {
      const classRes = await fetch('/api/admin/classes')
      const classData = await classRes.json()
      setClasses(classData.classes)
      
      // Get sessions for first class
      if (classData.classes.length > 0) {
        setSessions(classData.classes[0].sessions)
      }
    }
    
    fetchData()
  }, [])

  return (
    <div>
      <button onClick={() => setShowForm(true)}>
        Tambah Siswa
      </button>

      <AddStudentForm
        open={showForm}
        onOpenChange={setShowForm}
        onSuccess={() => {
          console.log('Student added!')
          setShowForm(false)
          // Refresh data
        }}
        classes={classes}
        sessions={sessions}
      />
    </div>
  )
}
```

---

## Validasi & Error Handling

### Frontend Validation (AddStudentForm)
- Student ID: Min 3 char, alfanumerik
- Nama: Min 1 char
- Kelas: Required
- Sesi: Required (after class selected)

### Backend Validation (API Route)
- Student ID: Harus unik (uppercase)
- Class ID: Harus ada di database
- Session ID: Harus milik class yang dipilih
- All required fields harus diisi

### Handling Errors

```typescript
const addStudent = async (formData) => {
  try {
    const response = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle specific errors
      if (data.error.includes('sudah digunakan')) {
        // Duplicate ID error
        setError('ID Siswa sudah ada, gunakan ID lain')
      } else if (data.error.includes('harus diisi')) {
        // Required field error
        setError(data.error)
      } else {
        // Generic error
        setError(data.error)
      }
      return
    }

    // Success
    console.log('Student saved:', data.student)
  } catch (error) {
    setError('Network error: ' + error.message)
  }
}
```

---

## Database Schema (Turso/libSQL)

```sql
-- Student Table
CREATE TABLE Student (
  id        TEXT PRIMARY KEY,
  studentId TEXT UNIQUE NOT NULL,  -- S001, A001, etc
  name      TEXT,
  classId   TEXT NOT NULL REFERENCES Class(id),
  sessionId TEXT REFERENCES Session(id),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_student_classid ON Student(classId);
CREATE INDEX idx_student_sessionid ON Student(sessionId);
CREATE INDEX idx_student_id ON Student(studentId);
```

---

## Rate Limiting (Optional)

Untuk production dengan banyak users, tambahkan rate limiting:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests/minute
})

export async function POST(request: Request) {
  // Validate rate limit first
  const { success } = await ratelimit.limit(userId)
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  // ... rest of handler
}
```

---

## Testing dengan Postman/Insomnia

### 1. Import Collection

```json
{
  "info": {
    "name": "Rikosan Student API",
    "description": "API endpoints for student management"
  },
  "item": [
    {
      "name": "Add Student",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/admin/students",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"studentId\":\"S001\",\"name\":\"Budi\",\"classId\":\"{{classId}}\",\"sessionId\":\"{{sessionId}}\"}"
        }
      }
    }
  ]
}
```

### 2. Set Variable

```
baseUrl = http://localhost:3000
classId = kls_123  (get from GET /api/admin/classes)
sessionId = sesi_1 (get from class.sessions)
```

---

## Troubleshooting

### Error: "Unauthorized"
**Solusi:** Login dulu di `/admin/login`, pastikan session cookie valid

### Error: "ID siswa sudah digunakan"
**Solusi:** Gunakan ID yang berbeda, check existing students

### Error: "Kelas tidak valid"
**Solusi:** Pastikan classId ada di database (GET /api/admin/classes)

### Error: "Sesi tidak valid untuk kelas ini"
**Solusi:** Pastikan sessionId milik class yang dipilih

---

**Last Updated:** February 25, 2025  
**API Version:** v1.0
