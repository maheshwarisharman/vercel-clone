/*
  Warnings:

  - A unique constraint covering the columns `[github_username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[github_user_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Deployment" ALTER COLUMN "is_build_success" DROP NOT NULL,
ALTER COLUMN "preview_url" DROP NOT NULL,
ALTER COLUMN "build_logs" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "github_user_id" TEXT,
ADD COLUMN     "github_username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_github_username_key" ON "User"("github_username");

-- CreateIndex
CREATE UNIQUE INDEX "User_github_user_id_key" ON "User"("github_user_id");
