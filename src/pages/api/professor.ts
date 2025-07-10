/**
 * @swagger
 * /api/professor:
 *   get:
 *   sumamry: Get all professors
 *   tags: [Professor]
 *   responses:
 *       200:
 *         description: List of professors
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma'
import redis from "@/lib/redis";
import { querySchema, createSchema, updateSchema, deleteSchema } from "@/schemas/professor";
import { handleZodError } from "@/utils/handleZodError";

const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
        const rateLimitKey = `rl:professors:${ip}`;

        const requests = await redis.incr(rateLimitKey);
        if (requests === 1) {
            await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW);
        }

        if (requests > RATE_LIMIT_MAX) {
            return res.status(429).json({ error: "hinay hinay lang nigga!."});
        }

        switch (req.method) {
            case 'GET': {
                const query = querySchema.parse(req.query);
                const limit = query.limit ? parseInt(query.limit) : undefined;
                const departmentId = query.departmentId ? Number(query.departmentId) : undefined;

                const cacheKey = `professor:${departmentId ?? 'all'}:${limit ?? 'all'}`

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
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }

    } catch (error) {
        console.error(error);
        if (handleZodError(res, error)) return;
        return res.status(500).json({error: 'Serve error'});
    }
}