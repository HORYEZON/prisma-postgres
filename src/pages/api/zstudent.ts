import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma';
import { querySchema, createSchema, updateSchema, deleteSchema } from "@/schemas/zstudent"
import { handleZodError } from "@/utils/handleZodError";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const query = querySchema.parse(req.query);
                const limit = query.limit ? parseInt(query.limit) : undefined;

                const students = await prisma.student.findMany({
                    take: limit,
                    where: {
                        departmentId: query.departmentId ? Number(query.departmentId) : undefined
                    },
                    include: {
                        department: true,
                        professor: true,
                    },
                });

                return res.status(200).json(students);
            }

            case 'POST': {
                const body = createSchema.parse(req.body);

                const newStudent = await prisma.student.create({
                    data: {
                        name: body.name,
                        email: body.email,
                        age: body.age,
                        course: body.course,
                        status: 'ACTIVE',
                        isEnroll: body.isEnroll,
                        department: { connect: { id: body.departmentId } },
                        professor: { connect: { id: body.professorId } },
                    },
                    include: {
                        department: true,
                        professor: true,
                    },
                });

                return res.status(201).json(newStudent);
            }

            case 'PUT': {
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

                return res.status(200).json(updatedStudent);
            }

            case 'DELETE': {
                const body = deleteSchema.parse(req.body);

                await prisma.student.delete({
                    where: { id: body.id },
                });

                return res.status(204).end();
            }

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        if (handleZodError(res, error)) return;
        return res.status(500).json({ error: 'Server error' });
    }
}
