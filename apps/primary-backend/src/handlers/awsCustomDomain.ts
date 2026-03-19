import { ACMClient, RequestCertificateCommand, DescribeCertificateCommand } from "@aws-sdk/client-acm";

const acm = new ACMClient({ region: "us-east-1" });

export async function requestCertificate(domain: string): Promise<string> {
  const command = new RequestCertificateCommand({
    DomainName: domain,
    ValidationMethod: "DNS",
    Tags: [{ Key: "platform", Value: "myplatform" }]
  });

  const response = await acm.send(command);

  if (!response.CertificateArn) {
    throw new Error("ACM did not return a CertificateArn");
  }

  return response.CertificateArn;
}


export async function getCertificateDetails(certArn: string) {
  const command = new DescribeCertificateCommand({ CertificateArn: certArn });
  const response = await acm.send(command);
  const cert = response.Certificate;

  if (!cert) throw new Error("Certificate not found");

  const validation = cert.DomainValidationOptions?.[0];
  const cnameKey   = validation?.ResourceRecord?.Name;
  const cnameValue = validation?.ResourceRecord?.Value;

  return {
    status: cert.Status,        // "PENDING_VALIDATION" | "ISSUED" | "FAILED"
    cnameKey,                   // _abc123.myapp.com
    cnameValue,                 // _xyz.acm.aws
  };
}