import { z } from "zod";

export const querySchema = z.object({
    limit: z.string().optional(),
    departmentId: z.string().optional(),
})

export const createSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    age: z.number(),
    course: z.string(),
    isEnroll: z.boolean(),
    departmentId: z.number(),
    professorId: z.number()
})

export const updateSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    age: z.number().optional(),
    course: z.string().optional(),
    status: z.enum(['ACTIVE', 'GRADUATED', 'DROPPED']).optional(),
    isEnroll: z.boolean().optional(),
    departmentId: z.number().optional(),
    professorId: z.number().optional()
})

export const deleteSchema = z.object({
    id: z.number(),
})
