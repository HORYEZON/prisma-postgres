import { NextApiRequest, NextApiResponse } from "next";
import { swaggerSpec } from "@/lib/swagger";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(swaggerSpec);
};