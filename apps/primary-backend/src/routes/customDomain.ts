import { Router } from "express";
import { prisma } from "@repo/db";
import { requestCertificate } from "../handlers/awsCustomDomain.js";

const router: Router = Router();

router.post("/add-new-domain", async (req, res) => {
  try {
    const { domain, project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        message: "project_id is required",
      });
    }

    if (!isValidDomain(domain)) {
      return res.status(400).json({
        message: "Invalid domain Format",
      });
    }

    const sanitizedDomain = sanitizeDomain(domain);

    const certificateArn = await requestCertificate(sanitizedDomain);

    await prisma.customDomain.create({
      data: {
        domain: sanitizedDomain,
        project_id: Number(project_id),
        cert_arn: certificateArn,
        cert_status: "PENDING",
        status: "AWAITING_DNS",
      },
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Domain already exists",
      });
    }

    return res.status(500).json({
      message: "Some error occured",
      error: error,
    });
  }
});

router.get("/list/:project_id", async (req, res) => {
  const projectId = Number(req.params.project_id);

  if (Number.isNaN(projectId)) {
    return res.status(400).json({
      message: "Invalid project_id",
    });
  }

  try {
    const domains = await prisma.customDomain.findMany({
      where: {
        project_id: projectId,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        domain: true,
        project_id: true,
        cert_status: true,
        status: true,
        cert_cname_key: true,
        cert_cname_value: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: domains,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Some error occured",
      error,
    });
  }
});

function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

function sanitizeDomain(input: string): string {
  return input
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

export default router;
