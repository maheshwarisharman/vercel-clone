-- CreateEnum
CREATE TYPE "CustomDomainStatus" AS ENUM ('AWAITING_DNS', 'CERT_VALIDATING', 'CERT_ISSUED', 'CDN_UPDATING', 'ACTIVE', 'FAILED');

-- CreateEnum
CREATE TYPE "CertStatus" AS ENUM ('PENDING', 'ISSUED', 'FAILED');

-- CreateEnum
CREATE TYPE "CdnStatus" AS ENUM ('PENDING', 'UPDATING', 'ACTIVE', 'FAILED');

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "deployment_id" INTEGER NOT NULL,
    "cert_arn" TEXT,
    "cert_status" "CertStatus" NOT NULL DEFAULT 'PENDING',
    "cert_cname_key" TEXT,
    "cert_cname_value" TEXT,
    "cdn_status" "CdnStatus" NOT NULL DEFAULT 'PENDING',
    "status" "CustomDomainStatus" NOT NULL DEFAULT 'AWAITING_DNS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");
