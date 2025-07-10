import { z } from "zod";

export const querySchema = z.object({
    limit: z.string().optional(),
    departmentId: z.string().optional(),
})

export const createSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    degree: z.enum(["Bachelor", "Masteral", "Doctoral"]),
    departmentId: z.number()
})

export const updateSchema = z.object({
    id: z.number(),
    name: z.string().optional(),
    email: z.string().email(),
    degree: z.enum(["Bachelor", "Masteral", "Doctoral"]).optional(),
    departmentId: z.number().optional()
})

export const deleteSchema = z.object({
    id: z.number(),
})