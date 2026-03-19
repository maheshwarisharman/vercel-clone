import { prisma } from "@repo/db";
import { getCertificateDetails } from "./awsCustomDomain.js";

export async function handleAcmCertCron(domain_id: string, cert_arn: string, cert_cname_key: string | null) {
    
        const { status, cnameKey, cnameValue } = await getCertificateDetails(cert_arn);

        if (status === "ISSUED") {
        // advance to next state
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
    await Promise.allSettled(pendingDomains.map(domain => handleAcmCertCron(domain.id, domain.cert_arn as string, domain.cert_cname_key)))
    }, 60000)
}