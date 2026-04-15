import {
  ACMClient
} from "@aws-sdk/client-acm";
import {
  CloudFrontClient,
  CreateDistributionTenantCommand,
  GetDistributionTenantCommand,
  DeleteDistributionTenantCommand,
} from "@aws-sdk/client-cloudfront";


const acm = new ACMClient({ region: "us-east-1" });
const cloudfront = new CloudFrontClient({ region: "us-east-1" });

const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID!;


// ─── Distribution Tenant Management ───────────────────────────────

/**
 * Creates a CloudFront Distribution Tenant for a custom domain.
 * CloudFront will auto-issue and auto-renew an ACM certificate
 * via ManagedCertificateRequest.
 */
export async function createDistributionTenant(
  domain: string,
  tenantName: string
): Promise<{ tenantId: string; tenantArn: string }> {
  const command = new CreateDistributionTenantCommand({
    DistributionId: DISTRIBUTION_ID,
    Name: tenantName,
    Domains: [{ Domain: domain }],
    Enabled: true,

    ManagedCertificateRequest: {
      PrimaryDomainName: domain,
      ValidationTokenHost: "cloudfront",
    },
  });

  const response = await cloudfront.send(command);
  const tenant = response.DistributionTenant;

  if (!tenant?.Id) {
    throw new Error("CloudFront did not return a tenant ID");
  }

  return {
    tenantId: tenant.Id,
    tenantArn: tenant.Arn ?? "",
  };
}


/**
 * Get the current status of a distribution tenant and its domain(s).
 * Used by the polling cron to check if a tenant's domain has become active.
 */
export async function getDistributionTenantStatus(tenantId: string) {
  const command = new GetDistributionTenantCommand({ Identifier: tenantId });
  const response = await cloudfront.send(command);
  const tenant = response.DistributionTenant;

  if (!tenant) throw new Error("Tenant not found");

  return {
    status: tenant.Status,
    enabled: tenant.Enabled,
    domains: tenant.Domains?.map((d) => ({
      domain: d.Domain,
      status: d.Status,
    })),
  };
}


/**
 * Delete a distribution tenant (when a user removes a custom domain).
 */
export async function deleteDistributionTenant(
  tenantId: string,
  ifMatch?: string
): Promise<void> {
  await cloudfront.send(
    new DeleteDistributionTenantCommand({
      Id: tenantId,
      IfMatch: ifMatch ?? "*",
    })
  );
}

