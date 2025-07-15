/**
 * @jest-environment node
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Prisma CRUD: Student with Relations', () => {
  let departmentId: number
  let professorId: number
  let studentId: number

  it('should create a department', async () => {
    const dept = await prisma.department.create({
      data: {
        name: 'Engineering',
        email: 'eng@school.com',
        year: 2025,
      },
    })
    expect(dept).toHaveProperty('id')
    departmentId = dept.id
  })

  it('should create a professor linked to department', async () => {
    const prof = await prisma.professor.create({
      data: {
        name: 'Prof. John',
        email: 'john@school.com',
        degree: 'Bachelor',
        departmentId: departmentId,
      },
    })
    expect(prof).toHaveProperty('id')
    professorId = prof.id
  })

  it('should create a student linked to department & professor', async () => {
    const student = await prisma.student.create({
      data: {
        name: 'Rye Student',
        email: 'rye@student.com',
        course: 'BSCS',
        age: 21,
        status: 'ACTIVE',
        isEnroll: true,
        departmentId: departmentId,
        professorId: professorId,
      },
    })
    expect(student).toHaveProperty('id')
    studentId = student.id
  })

  it('should read the student and relations', async () => {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        professor: true,
      },
    })
    expect(student?.department.name).toBe('Engineering')
    expect(student?.professor.name).toBe('Prof. John')
  })

  it('should update the student status', async () => {
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { status: 'GRADUATED' },
    })
    expect(updated.status).toBe('GRADUATED')
  })

  it('should delete the student', async () => {
    const deleted = await prisma.student.delete({
      where: { id: studentId },
    })
    expect(deleted.id).toBe(studentId)
  })

  it('cleanup: delete professor & department', async () => {
    await prisma.professor.delete({ where: { id: professorId } })
    await prisma.department.delete({ where: { id: departmentId } })

    // Confirm they're gone
    const dept = await prisma.department.findUnique({ where: { id: departmentId } })
    expect(dept).toBeNull()
  })
})
