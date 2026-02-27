/*
  Warnings:

  - You are about to drop the column `github_access_token` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[github_installation_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "github_access_token",
ADD COLUMN     "github_installation_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_github_installation_id_key" ON "User"("github_installation_id");
