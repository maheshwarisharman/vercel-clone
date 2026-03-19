/*
  Warnings:

  - You are about to drop the column `deployment_id` on the `CustomDomain` table. All the data in the column will be lost.
  - Added the required column `project_id` to the `CustomDomain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomDomain" DROP COLUMN "deployment_id",
ADD COLUMN     "project_id" INTEGER NOT NULL;
