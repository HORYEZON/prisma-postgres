/*
  Warnings:

  - You are about to drop the column `userId` on the `Department` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_userId_fkey";

-- DropForeignKey
ALTER TABLE "Professor" DROP CONSTRAINT "Professor_userId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- AlterTable
ALTER TABLE "Department" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Professor" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "userId";
