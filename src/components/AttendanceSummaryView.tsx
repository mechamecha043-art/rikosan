'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Download,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  Check,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'

interface AttendanceSummary {
  studentId: string
  name: string | null
  classId: string
  className: string
  sessionId: string | null
  sessionName: string | null
  totalDays: number
  present: number
  absent: number
  attendanceRate: number
}

interface SummaryData {
  month: string
  summary: AttendanceSummary[]
  totalStudents: number
  startDate: string
  endDate: string
}

interface ClassData {
  id: string
  name: string
}

interface Props {
  classes: ClassData[]
}

export function AttendanceSummaryView({ classes }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [data, setData] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchSummary()
  }, [selectedMonth, selectedClass])

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('month', selectedMonth)
      if (selectedClass) {
        params.append('classId', selectedClass)
      }

      const response = await fetch(`/api/admin/attendance/summary?${params}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error fetching summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportToExcel = () => {
    if (!data?.summary) return

    // Create CSV content
    const headers = [
      'ID Siswa',
      'Nama',
      'Kelas',
      'Sesi',
      'Total Hari',
      'Hadir',
      'Tidak Hadir',
      'Persentase (%)',
    ]

    const rows = data.summary.map((item) => [
      item.studentId,
      item.name || '-',
      item.className,
      item.sessionName || '-',
      item.totalDays,
      item.present,
      item.absent,
      item.attendanceRate,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `laporan-absensi-${selectedMonth}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredData = data?.summary.filter((item) =>
    item.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Calculate statistics
  const stats = data?.summary.reduce(
    (acc, item) => ({
      totalPresent: acc.totalPresent + item.present,
      totalAbsent: acc.totalAbsent + item.absent,
      totalDays: acc.totalDays + item.totalDays,
      avgRate: acc.avgRate + item.attendanceRate,
    }),
    { totalPresent: 0, totalAbsent: 0, totalDays: 0, avgRate: 0 }
  ) || { totalPresent: 0, totalAbsent: 0, totalDays: 0, avgRate: 0 }

  if (stats.avgRate) {
    stats.avgRate = Math.round(stats.avgRate / (data?.summary.length || 1))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
            Laporan Absensi Bulanan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lihat statistik kehadiran siswa per bulan
          </p>
        </div>
        <Button
          onClick={fetchSummary}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Bulan
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full h-10 px-3 border rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Kelas (Opsional)
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full h-10 px-3 border rounded-lg text-sm bg-white"
          >
            <option value="">Semua Kelas</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Cari Siswa
          </label>
          <input
            type="text"
            placeholder="ID / Nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Statistics Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-medium">Total Siswa</p>
                <p className="text-lg font-bold text-blue-900">
                  {data.totalStudents}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-green-600 font-medium">Total Hadir</p>
                <p className="text-lg font-bold text-green-900">
                  {stats.totalPresent}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-red-600 font-medium">Total Tidak Hadir</p>
                <p className="text-lg font-bold text-red-900">
                  {stats.totalAbsent}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600 font-medium">Rata-rata</p>
                <p className="text-lg font-bold text-purple-900">
                  {stats.avgRate}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Table Card */}
      <Card>
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Data Absensi ({filteredData.length} siswa)
          </CardTitle>
          <Button
            onClick={handleExportToExcel}
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={!data?.summary.length}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : !data ? (
            <div className="text-center py-8 text-gray-500">
              Pilih bulan untuk melihat laporan
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data untuk periode ini
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-20">
                      ID
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500">
                      Nama
                    </th>
                    <th className="text-left p-3 text-xs font-medium text-gray-500 w-24">
                      Kelas
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-16">
                      Total Hari
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-16 bg-green-50">
                      Hadir
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-20 bg-red-50">
                      Tidak Hadir
                    </th>
                    <th className="text-center p-3 text-xs font-medium text-gray-500 w-20 bg-purple-50">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <motion.tr
                      key={item.studentId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-3 text-sm font-medium text-orange-600">
                        {item.studentId}
                      </td>
                      <td className="p-3 text-sm text-gray-900">
                        {item.name || '-'}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {item.className}
                      </td>
                      <td className="p-3 text-sm text-center font-medium">
                        {item.totalDays}
                      </td>
                      <td className="p-3 text-sm text-center bg-green-50">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold">
                          {item.present}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center bg-red-50">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold">
                          {item.absent}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-center bg-purple-50">
                        <div className="flex items-center justify-center gap-1">
                          <div
                            className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden"
                            style={{ background: '#e5e7eb' }}
                          >
                            <div
                              className="h-full bg-purple-500 transition-all"
                              style={{
                                width: `${item.attendanceRate}%`,
                              }}
                            />
                          </div>
                          <span className="font-bold text-purple-700 text-xs w-7">
                            {item.attendanceRate}%
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
