/**
 * @swagger
 * /api/professor:
 *   get:
 *     summary: Get all professors
 *     tags: [PROFESSOR]
 *     responses:
 *       200:
 *         description: List of professors
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { querySchema, createSchema, updateSchema, deleteSchema } from "@/schemas/professor";
import { handleZodError } from "@/utils/handleZodError";

const RATE_LIMIT_WINDOW = 60;   // seconds
const RATE_LIMIT_MAX = 5;       // max requests per window

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
        const rateLimitKey = `rl:professors:${ip}`;

        const requests = await redis.incr(rateLimitKey);
        if (requests === 1) {
            await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
        }

        if (requests > RATE_LIMIT_MAX) {
            return res.status(429).json({ error: "Hinay hinay lang!" });
        }

        switch (req.method) {
            case "GET": {
                const query = querySchema.parse(req.query);
                const limit = query.limit ? parseInt(query.limit) : undefined;
                const departmentId = query.departmentId ? Number(query.departmentId) : undefined;

                const cacheKey = `professor:${departmentId ?? "all"}:${limit ?? "all"}`;
                const cached = await redis.get(cacheKey);

                if (cached) {
                    console.log("Returning from Redis cache");
                    return res.status(200).json(JSON.parse(cached));
                }

                const professors = await prisma.professor.findMany({
                    take: limit,
                    where: { departmentId },
                    include: { department: true },
                });

                await redis.set(cacheKey, JSON.stringify(professors), "EX", 60);
                console.log("Returning from DB & stored in cache");
                return res.status(200).json(professors);
            }

            /**
             * @swagger
             * /api/professor:
             *   post:
             *     summary: Create a new professor
             *     tags: [PROFESSOR]
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *           schema:
             *             type: object
             *             required:
             *               - name
             *               - email
             *               - degree
             *               - departmentId
             *             properties:
             *               name:
             *                 type: string
             *               email:
             *                 type: string
             *               degree:
             *                 type: string
             *               departmentId:
             *                 type: integer
             *     responses:
             *       201:
             *         description: Professor created
             */
            case "POST": {
                const body = createSchema.parse(req.body);

                const newProfessor = await prisma.professor.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        degree: body.degree,
                        department: { connect: { id: body.departmentId } },
                    },
                    include: { department: true },
                });

                await invalidateProfessorCacheWithScan();
                return res.status(201).json(newProfessor);
            }

            /**
             * @swagger
             * /api/professor:
             *   put:
             *     summary: Update a professor
             *     tags: [PROFESSOR]
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
             *               degree:
             *                 type: string
             *                 enum: [Bachelor, Masteral, Doctoral]
             *               departmentId:
             *                 type: integer
             *     responses:
             *       200:
             *         description: Professor updated
             */
            case "PUT": {
                const body = updateSchema.parse(req.body);

                const updatedProfessor = await prisma.professor.update({
                    where: { id: body.id },
                    data: {
                        name: body.name,
                        email: body.email,
                        degree: body.degree,
                        department: body.departmentId ? { connect: { id: body.departmentId } } : undefined,
                    },
                    include: { department: true },
                });

                await invalidateProfessorCacheWithScan();
                return res.status(200).json(updatedProfessor);
            }

            /**
             * @swagger
             * /api/professor:
             *   delete:
             *     summary: Delete a professor
             *     tags: [PROFESSOR]
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
             *         description: Professor deleted
             */
            case "DELETE": {
                const body = deleteSchema.parse(req.body);

                await prisma.professor.delete({
                    where: { id: body.id },
                });

                await invalidateProfessorCacheWithScan();
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

async function invalidateProfessorCacheWithScan() {
    let cursor = "0";
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "professor:*", "COUNT", "100");
        cursor = nextCursor;

        if (keys.length) {
            await redis.del(...keys);
            console.log("Deleted cache keys:", keys);
        }
    } while (cursor !== "0");
}
