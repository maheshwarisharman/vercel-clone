import { prisma } from "@repo/db";
import { getCertificateDetails } from "./awsCustomDomain.js";

export function handleAcmCertCron(domain_id: string, cert_arn: string, cert_cname_key: string | null) {

    const cronJob = setInterval(async () => {
    
        const { status, cnameKey, cnameValue } = await getCertificateDetails(cert_arn);

        if (status === "ISSUED") {
        // advance to next state
            clearInterval(cronJob)
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
    }, 10000)
    
}