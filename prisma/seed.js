const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting JS seed...')

  await prisma.attendance.deleteMany().catch(() => {})
  await prisma.finance.deleteMany().catch(() => {})
  await prisma.student.deleteMany().catch(() => {})
  await prisma.session.deleteMany().catch(() => {})
  await prisma.class.deleteMany().catch(() => {})
  await prisma.admin.deleteMany().catch(() => {})

  const superAdminPassword = await bcrypt.hash('starlish@218', 10)
  const teacherPassword = await bcrypt.hash('admin123', 10)

  const adminsData = [
    { email: 'charlien@starlish.com', name: 'Charlien Liuw', password: superAdminPassword, role: 'super_admin' },
    { email: 'nadia@starlish.com', name: 'Nadia Dorothy', password: teacherPassword, role: 'teacher' },
    { email: 'fadiya@starlish.com', name: 'Fadiya', password: teacherPassword, role: 'teacher' },
    { email: 'laura@starlish.com', name: 'Laura', password: teacherPassword, role: 'teacher' },
    { email: 'dwilestari@starlish.com', name: 'Dwi Lestari', password: teacherPassword, role: 'teacher' },
    { email: 'nathania@starlish.com', name: 'Nathania Anggi Darmawan', password: teacherPassword, role: 'teacher' },
    { email: 'eunike@starlish.com', name: 'Eunike', password: teacherPassword, role: 'teacher' },
    { email: 'rika@starlish.com', name: 'Rika Puspita', password: teacherPassword, role: 'teacher' },
    { email: 'neni@starlish.com', name: 'Neni Prasetyani', password: teacherPassword, role: 'teacher' },
    { email: 'admin1@starlish.com', name: 'Admin 1', password: teacherPassword, role: 'teacher' },
    { email: 'admin2@starlish.com', name: 'Admin 2', password: teacherPassword, role: 'teacher' },
    { email: 'admin3@starlish.com', name: 'Admin 3', password: teacherPassword, role: 'teacher' },
  ]

  await Promise.all(adminsData.map((a) => prisma.admin.create({ data: { ...a, isActive: true } })))

  const classNames = ['Kelas 1','Kelas 2','Kelas 3','Kelas 4','Kelas 5','Kelas 6','Kelas 7','Kelas 8','Kelas 9','Kelas 10','Kelas 11','Kelas 12']
  const classes = []
  for (const name of classNames) {
    classes.push(await prisma.class.create({ data: { name } }))
  }

  const sessionTimes = [
    { name: 'Sesi 1', time: '10:00 - 11:30' },
    { name: 'Sesi 2', time: '11:30 - 13:00' },
    { name: 'Sesi 3', time: '13:30 - 15:00' },
    { name: 'Sesi 4', time: '15:00 - 16:30' },
    { name: 'Sesi 5', time: '17:00 - 19:30' },
  ]

  for (const cls of classes) {
    for (const s of sessionTimes) {
      await prisma.session.create({ data: { name: s.name, time: s.time, classId: cls.id } })
    }
  }

  console.log('🎉 Seed completed!')
  console.log('\n📋 Login Credentials:')
  console.log('Super Admin: charlien@starlish.com / starlish@218')
  console.log('Teacher password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
