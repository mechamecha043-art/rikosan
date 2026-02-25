import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { startOfMonth, endOfMonth, parseISO } from 'date-fns'

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

// GET attendance summary by month
export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: 2025-02
    const classId = searchParams.get('classId')

    if (!month) {
      return NextResponse.json(
        { error: 'Parameter month diperlukan (format: YYYY-MM)' },
        { status: 400 }
      )
    }

    // Parse month
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = startOfMonth(new Date(year, monthNum - 1, 1))
    const endDate = endOfMonth(new Date(year, monthNum - 1, 1))

    // Get all students in selected class or all students
    const studentWhere: any = {}
    if (classId) {
      studentWhere.classId = classId
    }

    const students = await db.student.findMany({
      where: studentWhere,
      include: {
        class: true,
        session: true,
        attendance: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            session: true,
          },
        },
      },
      orderBy: [{ class: { name: 'asc' } }, { studentId: 'asc' }],
    })

    // Calculate summary
    const summary: AttendanceSummary[] = students.map((student) => {
      const attendanceRecords = student.attendance || []
      const present = attendanceRecords.filter((a) => a.present === true).length
      const totalDays = attendanceRecords.length
      const absent = totalDays - present
      const attendanceRate = totalDays > 0 ? Math.round((present / totalDays) * 100) : 0

      return {
        studentId: student.studentId,
        name: student.name,
        classId: student.classId,
        className: student.class?.name || '-',
        sessionId: student.sessionId,
        sessionName: student.session?.name || null,
        totalDays,
        present,
        absent,
        attendanceRate,
      }
    })

    return NextResponse.json({
      month,
      summary,
      totalStudents: summary.length,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    })
  } catch (error) {
    console.error('Get attendance summary error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data laporan' },
      { status: 500 }
    )
  }
}
