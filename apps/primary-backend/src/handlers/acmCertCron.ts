import { prisma } from "@repo/db";
import { getDistributionTenantStatus } from "./awsCustomDomain.js";

/**
 * Polls CloudFront to check if PENDING distribution tenants have become active.
 * 
**/
async function pollPendingTenants() {
  const pendingDomains = await prisma.customDomain.findMany({
    where: { status: "PENDING", tenant_id: { not: null } },
  });

  if (pendingDomains.length === 0) return;

  await Promise.allSettled(
    pendingDomains.map(async (domainRecord) => {
      try {
        const tenantStatus = await getDistributionTenantStatus(domainRecord.tenant_id!);
        console.log(tenantStatus)

        const allDomainsActive = tenantStatus.domains?.every(
          (d) => d.status === "active"
        );

        if (allDomainsActive && tenantStatus.status === "Deployed") {
          await prisma.customDomain.update({
            where: { id: domainRecord.id },
            data: { status: "ACTIVE" },
          });
        }
      } catch (error) {
        console.error(`Error polling tenant for ${domainRecord.domain}:`, error);
      }
    })
  );
}

export function TenantStatusCronJob() {  
  setInterval(async () => {
    try {
      await pollPendingTenants();
    } catch (error) {
      console.error("TenantStatusCronJob error:", error);
    }
  }, 180_000); //180 seconds
}