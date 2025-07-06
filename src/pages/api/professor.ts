/**
 * @swagger
 * /api/professor:
 *      get:
 *          sumamry: Get all professors
 *          tags: [Professor]
 *          responses:
 *              200:
 *                  description: List of professors
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'GET') {
        try {
            const professors = await prisma.professor.findMany({
                include: {
                    students: true,
                },
            })

            return res.status(200).json(professors)
        } catch (error) {
            console.error("GET /api/professor error:", error)
            return res.status(500).json({ error: 'Failed to fetch professors'})
        }
    }
    
}
