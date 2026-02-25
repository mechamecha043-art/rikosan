'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Loader2,
  X,
  CheckCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AddStudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  classes: Array<{ id: string; name: string }>
  sessions: Array<{ id: string; name: string; time: string | null }>
}

interface FormData {
  studentId: string
  name: string
  classId: string
  sessionId: string
}

interface FormErrors {
  studentId?: string
  name?: string
  classId?: string
  sessionId?: string
  submit?: string
}

export function AddStudentForm({
  open,
  onOpenChange,
  onSuccess,
  classes,
  sessions: allSessions,
}: AddStudentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    name: '',
    classId: '',
    sessionId: '',
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [filteredSessions, setFilteredSessions] = useState<typeof allSessions>([])

  // Filter sessions based on selected class
  useEffect(() => {
    if (formData.classId) {
      const sessionsForClass = allSessions.filter(s => {
        // Sessions are already filtered by classId from parent
        return true
      })
      setFilteredSessions(sessionsForClass)
      // Reset session selection when class changes
      setFormData(prev => ({ ...prev, sessionId: '' }))
    } else {
      setFilteredSessions([])
    }
  }, [formData.classId, allSessions])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.studentId.trim()) {
      newErrors.studentId = 'ID Siswa wajib diisi'
    } else if (!/^[A-Z0-9]{3,}$/.test(formData.studentId.trim().toUpperCase())) {
      newErrors.studentId = 'ID Siswa harus alfanumerik (min 3 karakter), contoh: S001, A001'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nama Lengkap wajib diisi'
    }

    if (!formData.classId) {
      newErrors.classId = 'Kelas wajib dipilih'
    }

    if (!formData.sessionId) {
      newErrors.sessionId = 'Sesi wajib dipilih'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: formData.studentId.trim().toUpperCase(),
          name: formData.name.trim(),
          classId: formData.classId,
          sessionId: formData.sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({
          submit: data.error || 'Gagal menyimpan data siswa',
        })
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        resetForm()
        onOpenChange(false)
        onSuccess?.()
      }, 1500)
    } catch (error) {
      setErrors({
        submit: 'Terjadi kesalahan saat menyimpan data',
      })
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: '',
      name: '',
      classId: '',
      sessionId: '',
    })
    setErrors({})
    setSuccess(false)
  }

  const handleCancel = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Tambah Siswa Baru</span>
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Isi semua form dengan benar sebelum menyimpan
          </DialogDescription>
        </DialogHeader>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-50 py-3 text-green-700"
          >
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Siswa berhasil ditambahkan!</span>
          </motion.div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID Siswa */}
            <div className="space-y-2">
              <Label htmlFor="studentId" className="font-medium">
                ID Siswa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="studentId"
                placeholder="Contoh: S001, A001, dst"
                value={formData.studentId}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    studentId: e.target.value,
                  }))
                  if (errors.studentId) {
                    setErrors(prev => ({ ...prev, studentId: undefined }))
                  }
                }}
                disabled={loading}
                className={errors.studentId ? 'border-red-500' : ''}
              />
              {errors.studentId && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.studentId}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Format: Alfanumerik unik (minimal 3 karakter)
              </p>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-medium">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: undefined }))
                  }
                }}
                disabled={loading}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Kelas */}
            <div className="space-y-2">
              <Label htmlFor="classId" className="font-medium">
                Kelas <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.classId} onValueChange={(value) => {
                setFormData(prev => ({
                  ...prev,
                  classId: value,
                }))
                if (errors.classId) {
                  setErrors(prev => ({ ...prev, classId: undefined }))
                }
              }} disabled={loading}>
                <SelectTrigger className={errors.classId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.classId && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.classId}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Pilih salah satu dari 12 kelas yang tersedia
              </p>
            </div>

            {/* Pilih Sesi */}
            <div className="space-y-2">
              <Label htmlFor="sessionId" className="font-medium">
                Pilih Sesi <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.sessionId} 
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    sessionId: value,
                  }))
                  if (errors.sessionId) {
                    setErrors(prev => ({ ...prev, sessionId: undefined }))
                  }
                }} 
                disabled={loading || !formData.classId}
              >
                <SelectTrigger className={errors.sessionId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={formData.classId ? "Pilih sesi" : "Pilih kelas dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} ({session.time || 'Waktu tidak tersedia'})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-session" disabled>
                      Pilih kelas dulu untuk melihat sesi
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.sessionId && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.sessionId}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Sesi 1: 10:00-11:30 | Sesi 2: 11:30-13:00 | Sesi 3: 13:30-15:00 | Sesi 4: 15:00-16:30 | Sesi 5: 17:00-19:30
              </p>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
