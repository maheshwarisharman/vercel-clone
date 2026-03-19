import { ACMClient, RequestCertificateCommand } from "@aws-sdk/client-acm";

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
