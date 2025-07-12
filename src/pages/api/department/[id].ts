import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const department = await prisma.department.findUnique({
                where: { id: Number(id) },
            })
            if (!department) {
                return res.status(404).json({ error: "department not found" });
            }
            return res.status(200).json(department);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch department"});
        }
    }

    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`)
}