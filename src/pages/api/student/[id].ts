import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const student = await prisma.student.findUnique({
                where: { id: Number(id) },
                include: {
                    department: true,
                    professor: true,
                },
            })
            if (!student) {
                return res.status(404).json({ error: "Student not found" });
            }
            return res.status(200).json(student);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch student"});
        }
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`)
}