/**
 * @jest-environment node
 */
import { PrismaClient } from '../src/generated/prisma'
const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.$connect()
})

afterAll(async () => {
    await prisma.$disconnect()
})

describe('Prisma CRUD: Department', () => {
    let departmentId: number

    it('should create a department', async () => {
        const department = await prisma.department.create({
            data: {
                name: 'Information Technology',
                email: 'it@university.com',
                year: 2024,
            },
        })
        expect(department).toHaveProperty('id')
        expect(department.name).toBe('Information Technology')
        departmentId = department.id
    })

    it('should read the department', async () => {
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
        })
        expect(department?.email).toBe('it@university.com')
    })

    it('should update the department name', async () => {
        const updated = await prisma.department.update({
            where: { id: departmentId },
            data: { name: 'IT Updated' },
        })
        expect(updated.name).toBe('IT Updated')
    })

    it('should delete the department', async () => {
        const deleted = await prisma.department.delete({
            where: { id: departmentId },
        })
        expect(deleted.id).toBe(departmentId)

        const check = await prisma.department.findUnique({ where: { id: departmentId } })
        expect(check).toBeNull()
    })
})
