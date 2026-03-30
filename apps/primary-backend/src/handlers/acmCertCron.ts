import { prisma } from "@repo/db";
import { attachDomainToCloudFront, getCertificateDetails } from "./awsCustomDomain.js";

export async function handleAcmCertCron(domain_id: string, cert_arn: string, cert_cname_key: string | null, domain: string) {
    
        const { status, cnameKey, cnameValue } = await getCertificateDetails(cert_arn);
        console.log({ status, cnameKey, cnameValue });

        if (status === "ISSUED") {
          try {
            await attachDomainToCloudFront(domain, cert_arn);
            await prisma.customDomain.update({
                where: {
                    id: domain_id
                },
                data: {
                    status: "ACTIVE"
                }
            })
          } catch (error) {
            console.error(error);
            throw error;
          }
        }

  
        if (cnameKey && !cert_cname_key) {
            try {
            await prisma.customDomain.update({
                where: {
                    id: domain_id
                },
                data: {
                    cert_cname_key: cnameKey,
                    cert_cname_value: cnameValue
                }
            })
            } catch (error) {
                console.error
                throw error
            }
        }
    
}

export function ACMCronJob() {
  setInterval(async () => {
      
    const pendingDomains = await prisma.customDomain.findMany({
            where: { status: { in: ['AWAITING_DNS', 'CERT_VALIDATING'] } }
    })
    await Promise.allSettled(pendingDomains.map(domain => handleAcmCertCron(domain.id, domain.cert_arn as string, domain.cert_cname_key, domain.domain)))
      
    }, 6000)
}