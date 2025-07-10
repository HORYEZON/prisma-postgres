/*
  Warnings:

  - You are about to drop the column `departmentId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `professorId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_professorId_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "departmentId",
DROP COLUMN "professorId";
