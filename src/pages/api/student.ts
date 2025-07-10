/**
 * @swagger
 * /api/student:
 *   get:
 *     summary: Get all students
 *     tags: [STUDENT]
 *     responses:
 *       200:
 *         description: List of students
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { querySchema, createSchema, updateSchema, deleteSchema } from "@/schemas/student";
import { handleZodError } from "@/utils/handleZodError";

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5;     // max requests per window

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
        const rateLimitKey = `rl:students:${ip}`;

        const requests = await redis.incr(rateLimitKey);
        if (requests === 1) {
            await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
        }

        if (requests > RATE_LIMIT_MAX) {
            return res.status(429).json({ error: "Too many requests, please slow down." });
        }

        switch (req.method) {
            case "GET": {
                const query = querySchema.parse(req.query);
                const limit = query.limit ? parseInt(query.limit) : undefined;
                const departmentId = query.departmentId ? Number(query.departmentId) : undefined;

                const cacheKey = `students:${departmentId ?? "all"}:${limit ?? "all"}`;
                const cached = await redis.get(cacheKey);

                if (cached) {
                    console.log("Returning from Redis cache");
                    return res.status(200).json(JSON.parse(cached));
                }

                const students = await prisma.student.findMany({
                    take: limit,
                    where: departmentId ? { departmentId } : undefined,
                    include: {
                        department: true,
                        professor: true,
                    },
                });

                await redis.set(cacheKey, JSON.stringify(students), "EX", 60);
                console.log("Returning from DB & stored in cache");
                return res.status(200).json(students);
            }

            /**
             * @swagger
             * /api/student:
             *   post:
             *     summary: Create a new student
             *     tags: [STUDENT]
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *           schema:
             *             type: object
             *             required:
             *               - name
             *               - email
             *               - age
             *               - course
             *               - isEnroll
             *               - departmentId
             *               - professorId
             *             properties:
             *               name:
             *                 type: string
             *               email:
             *                 type: string
             *               age:
             *                 type: integer
             *               course:
             *                 type: string
             *               isEnroll:
             *                 type: boolean
             *               departmentId:
             *                 type: integer
             *               professorId:
             *                 type: integer
             *     responses:
             *       201:
             *         description: Student created
             */
            case "POST": {
                const body = createSchema.parse(req.body);

                const newStudent = await prisma.student.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        age: body.age,
                        course: body.course,
                        status: "ACTIVE",
                        isEnroll: body.isEnroll,
                        department: { connect: { id: body.departmentId } },
                        professor: { connect: { id: body.professorId } },
                    },
                    include: {
                        department: true,
                        professor: true,
                    },
                });

                await invalidateStudentCacheWithScan();
                return res.status(201).json(newStudent);
            }

            /**
             * @swagger
             * /api/student:
             *   put:
             *     summary: Update a student
             *     tags: [STUDENT]
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *           schema:
             *             type: object
             *             required: [id]
             *             properties:
             *               id:
             *                 type: integer
             *               name:
             *                 type: string
             *               email:
             *                 type: string
             *               age:
             *                 type: integer
             *               course:
             *                 type: string
             *               status:
             *                 type: string
             *                 enum: [ACTIVE, GRADUATED, DROPPED]
             *               isEnroll:
             *                 type: boolean
             *               departmentId:
             *                 type: integer
             *               professorId:
             *                 type: integer
             *     responses:
             *       200:
             *         description: Student updated
             */
            case "PUT": {
                const body = updateSchema.parse(req.body);

                const updatedStudent = await prisma.student.update({
                    where: { id: body.id },
                    data: {
                        name: body.name,
                        email: body.email,
                        age: body.age,
                        course: body.course,
                        status: body.status,
                        isEnroll: body.isEnroll,
                        department: body.departmentId ? { connect: { id: body.departmentId } } : undefined,
                        professor: body.professorId ? { connect: { id: body.professorId } } : undefined,
                    },
                    include: {
                        department: true,
                        professor: true,
                    },
                });

                await invalidateStudentCacheWithScan();
                return res.status(200).json(updatedStudent);
            }

            /**
             * @swagger
             * /api/student:
             *   delete:
             *     summary: Delete a student
             *     tags: [STUDENT]
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *           schema:
             *             type: object
             *             required: [id]
             *             properties:
             *               id:
             *                 type: integer
             *     responses:
             *       204:
             *         description: Student deleted
             */
            case "DELETE": {
                const body = deleteSchema.parse(req.body);

                await prisma.student.delete({
                    where: { id: body.id },
                });

                await invalidateStudentCacheWithScan();
                return res.status(204).end();
            }

            default:
                res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        if (handleZodError(res, error)) return;
        return res.status(500).json({ error: "Server error" });
    }
}

async function invalidateStudentCacheWithScan() {
    let cursor = "0";
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "students:*", "COUNT", "100");
        cursor = nextCursor;

        if (keys.length) {
            await redis.del(...keys);
            console.log("Deleted cache keys:", keys);
        }
    } while (cursor !== "0");
}
