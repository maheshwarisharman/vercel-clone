-- AlterTable
ALTER TABLE "CustomDomain" ADD COLUMN     "deployment_id" INTEGER,
ALTER COLUMN "project_id" DROP NOT NULL;
