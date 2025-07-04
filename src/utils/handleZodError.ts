import { ZodError } from "zod";
import type { NextApiResponse } from "next";

export function handleZodError(res: NextApiResponse, error: unknown) {
    if (error instanceof ZodError) {
        console.error("Validation error:", error.errors)
        return res.status(400).json({ error: error.errors })
    }
    return null;
}
