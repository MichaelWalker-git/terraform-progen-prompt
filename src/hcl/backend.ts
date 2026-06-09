import { MANAGED_HEADER } from './versions';
import { ResolvedOptions } from '../options';

/**
 * Render `backend.tf` as a COMMENTED S3 + DynamoDB lock template. Commented so
 * `terraform init` does not fail before the team fills in real values. No
 * provisioning is performed (SECURITY-09: documents public-access blocking).
 */
export function renderBackendTf(backend: ResolvedOptions['backend']): string {
  return [
    MANAGED_HEADER,
    '# Remote state backend (S3 + DynamoDB lock). Uncomment and set real values.',
    '# The bucket MUST have public access blocked and encryption enabled.',
    'terraform {',
    '  # backend "s3" {',
    `  #   bucket         = "${backend.bucket}"`,
    '  #   key            = "terraform.tfstate"',
    `  #   region         = "${backend.region}"`,
    `  #   dynamodb_table = "${backend.dynamodbTable}"`,
    '  #   encrypt        = true',
    '  # }',
    '}',
    '',
  ].join('\n');
}
