import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

beforeAll(async () => {
    await prisma.$connect()
})

afterAll(async () => {
    await prisma.$disconnect()
})

it('dummy test to satisfy Jest', () => {
    expect(1).toBe(1)
})
