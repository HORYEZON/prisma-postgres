/**
 * @swagger
 * /api/department:
 *   get:
 *     summary: Get all departments
 *     tags: [DEPARTMENT]
 *     responses:
 *       200:
 *         description: List of departments
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { querySchema, createSchema, updateSchema, deleteSchema } from "@/schemas/department";
import { handleZodError } from "@/utils/handleZodError";

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX = 5;     // max requests per window

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
        const rateLimitKey = `rl:departments:${ip}`;

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

                const cacheKey = `departments:${limit ?? "all"}`;
                const cached = await redis.get(cacheKey);

                if (cached) {
                    console.log("Returning from Redis cache");
                    return res.status(200).json(JSON.parse(cached));
                }

                const departments = await prisma.department.findMany({
                    take: limit,
                    include: {
                        professors: true,
                        students: true,
                    },
                });

                await redis.set(cacheKey, JSON.stringify(departments), "EX", 60);
                console.log("Returning from DB & stored in cache");
                return res.status(200).json(departments);
            }

            /**
             * @swagger
             * /api/department:
             *   post:
             *     summary: Create a new department
             *     tags: [DEPARTMENT]
             *     requestBody:
             *       required: true
             *       content:
             *         application/json:
             *           schema:
             *             type: object
             *             required:
             *               - name
             *               - email
             *               - year
             *             properties:
             *               name:
             *                 type: string
             *               email:
             *                 type: string
             *               year:
             *                 type: integer
             *     responses:
             *       201:
             *         description: Department created
             */
            case "POST": {
                const body = createSchema.parse(req.body);

                const newDepartment = await prisma.department.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        year: body.year,
                    },
                    include: {
                        professors: true,
                        students: true,
                    },
                });

                await invalidateDepartmentCacheWithScan();
                return res.status(201).json(newDepartment);
            }

            /**
             * @swagger
             * /api/department:
             *   put:
             *     summary: Update a department
             *     tags: [DEPARTMENT]
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
             *               year:
             *                 type: integer
             *     responses:
             *       200:
             *         description: Department updated
             */
            case "PUT": {
                const body = updateSchema.parse(req.body);

                const updatedDepartment = await prisma.department.update({
                    where: { id: body.id },
                    data: {
                        name: body.name,
                        email: body.email,
                        year: body.year,
                    },
                    include: {
                        professors: true,
                        students: true,
                    },
                });

                await invalidateDepartmentCacheWithScan();
                return res.status(200).json(updatedDepartment);
            }

            /**
             * @swagger
             * /api/department:
             *   delete:
             *     summary: Delete a department
             *     tags: [DEPARTMENT]
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
             *         description: Department deleted
             */
            case "DELETE": {
                const body = deleteSchema.parse(req.body);

                await prisma.department.delete({
                    where: { id: body.id },
                });

                await invalidateDepartmentCacheWithScan();
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

async function invalidateDepartmentCacheWithScan() {
    let cursor = "0";
    do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "departments:*", "COUNT", "100");
        cursor = nextCursor;

        if (keys.length) {
            await redis.del(...keys);
            console.log("Deleted cache keys:", keys);
        }
    } while (cursor !== "0");
}
