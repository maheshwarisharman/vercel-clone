/*
  Warnings:

  - The values [AWAITING_DNS,CERT_VALIDATING,CERT_ISSUED,CDN_UPDATING] on the enum `CustomDomainStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cdn_status` on the `CustomDomain` table. All the data in the column will be lost.
  - You are about to drop the column `cert_arn` on the `CustomDomain` table. All the data in the column will be lost.
  - You are about to drop the column `cert_cname_key` on the `CustomDomain` table. All the data in the column will be lost.
  - You are about to drop the column `cert_cname_value` on the `CustomDomain` table. All the data in the column will be lost.
  - You are about to drop the column `cert_status` on the `CustomDomain` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CustomDomainStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'FAILED');
ALTER TABLE "public"."CustomDomain" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CustomDomain" ALTER COLUMN "status" TYPE "CustomDomainStatus_new" USING ("status"::text::"CustomDomainStatus_new");
ALTER TYPE "CustomDomainStatus" RENAME TO "CustomDomainStatus_old";
ALTER TYPE "CustomDomainStatus_new" RENAME TO "CustomDomainStatus";
DROP TYPE "public"."CustomDomainStatus_old";
ALTER TABLE "CustomDomain" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "CustomDomain" DROP COLUMN "cdn_status",
DROP COLUMN "cert_arn",
DROP COLUMN "cert_cname_key",
DROP COLUMN "cert_cname_value",
DROP COLUMN "cert_status",
ADD COLUMN     "tenant_arn" TEXT,
ADD COLUMN     "tenant_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "CdnStatus";

-- DropEnum
DROP TYPE "CertStatus";
