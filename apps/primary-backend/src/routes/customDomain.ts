import { Router } from "express"
import {prisma} from "@repo/db"
import {requestCertificate} from '../handlers/awsCustomDomain.js'

const router: Router = Router()

router.post('/add-new-domain', async (req, res) => {
    try {
        const {domain, project_id} = req.body

        if(!isValidDomain(domain)){
            return res.status(400).json({
                message: "Invalid domain Format"
            })
        }

        const sanitizedDomain = sanitizeDomain(domain)

        const certificateArn = await requestCertificate(sanitizedDomain)

        await prisma.customDomain.create({
            data: {
                domain: sanitizedDomain,
                project_id,
                cert_arn: certificateArn,
                cert_status: 'PENDING',
                status: 'AWAITING_DNS'
            }
        })

        res.status(200).json({ success: true, certificateArn });

    } catch (error) {
        res.status(500).json({
            message: "Some error occured",
            error: error
        })
    }
})


function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

function sanitizeDomain(input: string): string {
  return input.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "").toLowerCase();
}

export default router