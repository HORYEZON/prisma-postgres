import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const professor = await prisma.professor.findUnique({
                where: { id: Number(id) },
                include: {
                    department: true,
                    students: true,
                },
            });
            if (!professor) {
                return res.status(404).json({ error: "Professor not found" });
            }
            return res.status(200).json(professor);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch professor" });
        }
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
