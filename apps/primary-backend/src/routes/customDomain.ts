import { Router } from "express";
import { prisma } from "@repo/db";
import { createDistributionTenant, deleteDistributionTenant } from "../handlers/awsCustomDomain.js";

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
    const tenantName = sanitizedDomain.replace(/[^a-zA-Z0-9.-]/g, "-");

    // Create a CloudFront Distribution Tenant with managed certificate
    // CloudFront will auto-issue and auto-renew the SSL cert
    const { tenantId, tenantArn } = await createDistributionTenant(
      sanitizedDomain,
      tenantName
    );

    await prisma.customDomain.create({
      data: {
        domain: sanitizedDomain,
        project_id: Number(project_id),
        tenant_id: tenantId,
        tenant_arn: tenantArn,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: `Distribution tenant created for ${sanitizedDomain}`,
      dns_instruction: `Point ${sanitizedDomain} as a CNAME to your CloudFront distribution domain. CloudFront will automatically validate and issue the SSL certificate.`,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({
        message: "Domain already exists",
      });
    }

    console.error("Error adding custom domain:", error);
    return res.status(500).json({
      message: "Some error occurred",
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
        status: true,
        tenant_id: true,
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
      message: "Some error occurred",
      error,
    });
  }
});

router.delete("/remove/:domain_id", async (req, res) => {
  try {
    const { domain_id } = req.params;

    const customDomain = await prisma.customDomain.findUnique({
      where: { id: domain_id },
    });

    if (!customDomain) {
      return res.status(404).json({ message: "Domain not found" });
    }

    if (customDomain.tenant_id) {
      try {
        await deleteDistributionTenant(customDomain.tenant_id);
      } catch (error: any) {
        console.warn(`Could not delete tenant ${customDomain.tenant_id}:`, error.message);
      }
    }

    await prisma.customDomain.delete({
      where: { id: domain_id },
    });

    return res.status(200).json({
      success: true,
      message: "Domain removed successfully",
    });
  } catch (error) {
    console.error("Error removing custom domain:", error);
    return res.status(500).json({
      message: "Some error occurred",
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
