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

describe('Prisma CRUD: Professor linked to Department', () => {
    let departmentId: number
    let professorId: number

    it('should create a department', async () => {
        const department = await prisma.department.create({
            data: {
                name: 'Mathematics',
                email: 'math@university.com',
                year: 2024,
            },
        })
        departmentId = department.id
    })

    it('should create a professor under that department', async () => {
        const professor = await prisma.professor.create({
            data: {
                name: 'Prof. Alice',
                email: 'alice@university.com',
                degree: 'Masteral',
                departmentId,
            },
        })
        expect(professor).toHaveProperty('id')
        professorId = professor.id
    })

    it('should read professor with department relation', async () => {
        const prof = await prisma.professor.findUnique({
            where: { id: professorId },
            include: { department: true },
        })
        expect(prof?.department.name).toBe('Mathematics')
    })

    it('should update professor name', async () => {
        const updated = await prisma.professor.update({
            where: { id: professorId },
            data: { name: 'Prof. Alice Updated' },
        })
        expect(updated.name).toBe('Prof. Alice Updated')
    })

    it('should delete professor and department', async () => {
        await prisma.professor.delete({ where: { id: professorId } })
        await prisma.department.delete({ where: { id: departmentId } })
    })
})
