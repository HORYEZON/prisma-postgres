import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method == 'GET') {
        try {
            const students = await prisma.student.findMany({
                include: {
                    department: true,
                    professor: true,
                },
            })
            return res.status(200).json(students)
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch students'})
        }
    }

    if (req.method === 'POST') {
        const { name, email, age, course, isEnroll, departmentId, professorId } = req.body

        if (!name || !email || age === undefined || !course || isEnroll === undefined || !departmentId || !professorId) {
            return res.status(400).json({ error: 'Missing required fields'})
        }

        try {
            const NewStudent = await prisma.student.create({
                data: {
                    name,
                    email,
                    age: Number(age),
                    course,
                    status: 'ACTIVE',
                    isEnroll,
                    department: { connect: { id: Number(departmentId)} },
                    professor: { connect: { id: Number(professorId)}},
                },
                include: {
                    department: true,
                    professor: true,
                },
            })

            return res.status(201).json(NewStudent)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to Create Student'})
        }
    }

    if (req.method === 'PUT') {
        // console.log("PUT BODY:", req.body);
        const { id, name, email, age, course, status, isEnroll, departmentId, professorId } = req.body

        if (!id) return res.status(400).json({error: 'Missing Student ID'})

        try {
            const updatedStudent = await prisma.student.update({
                where: { id: Number(id) },
                data: {
                    name,
                    email,
                    age: Number(age),
                    course,
                    status,
                    isEnroll,
                    department: { connect: { id: Number(departmentId) } },
                    professor: { connect: { id: Number(professorId) } },
                },
                include: {
                    department: true,
                    professor: true,
                },    
            })

            return res.status(200).json(updatedStudent)
        } catch (error) {
            console.error(error)
            return res.status(500).json({ error: 'Failed to update student'})
        }
    }

    if(req.method === 'DELETE') {
        const { id } = req.body

        if (!id) return res.status(400).json({ error: 'Missing Student ID' })

        try {
            await prisma.student.delete({
                where: { id: Number(id) },
            })
            return res.status(204).end()
        } catch (error) {
            console.error(error)
            return res.status(500).json({error: 'Failed to delete Student'})
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
}