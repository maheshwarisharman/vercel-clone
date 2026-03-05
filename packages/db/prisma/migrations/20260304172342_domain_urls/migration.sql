-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "domain_url" TEXT NOT NULL,
    "deployment_id" INTEGER,
    "last_updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Domain_domain_url_key" ON "Domain"("domain_url");

-- CreateIndex
CREATE INDEX "Domain_domain_url_idx" ON "Domain"("domain_url");
