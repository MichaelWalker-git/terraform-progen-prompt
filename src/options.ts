import { ProjectOptions } from 'projen';

/** Which static security scanner(s) the generated repo enforces. */
export type SecurityScanner = 'tfsec' | 'checkov' | 'both';

/** Directory shape of the generated Terraform repository. */
export type RepoLayout = 'single' | 'modules';

/**
 * Pinned versions for the CLI tools the generated repo uses. All default to a
 * pinned value (never `latest`) to satisfy supply-chain hardening (SECURITY-10).
 */
export interface ToolVersions {
  /** Terraform version for `hashicorp/setup-terraform`. @default '1.9.8' */
  readonly terraform?: string;
  /** tflint version for `terraform-linters/setup-tflint`. @default 'v0.53.0' */
  readonly tflint?: string;
  /** tfsec version. @default 'v1.28.13' */
  readonly tfsec?: string;
  /** checkov version. @default '3.2.300' */
  readonly checkov?: string;
  /** terraform-docs version. @default 'v0.19.0' */
  readonly terraformDocs?: string;
}

/** Remote-state backend scaffold options. Config-only — never provisioned. */
export interface BackendOptions {
  /** Backend type. `none` omits backend.tf entirely. @default 's3' */
  readonly type?: 's3' | 'none';
  /** S3 bucket name placeholder. @default 'CHANGE_ME-tfstate' */
  readonly bucket?: string;
  /** DynamoDB lock table placeholder. @default 'CHANGE_ME-tflock' */
  readonly dynamodbTable?: string;
  /** AWS region placeholder. @default 'us-east-1' */
  readonly region?: string;
}

/**
 * Options for {@link TerraformProject}.
 *
 * Every field is optional with a documented default so that
 * `new TerraformProject({ outdir })` produces a complete, governed repo.
 */
export interface TerraformProjectOptions extends ProjectOptions {
  /** Required Terraform version constraint for `versions.tf`. @default '>= 1.6' */
  readonly terraformVersion?: string;

  /**
   * Provider version constraints, keyed by local provider name.
   * Values are either a version string (source inferred as `hashicorp/<name>`)
   * or `source@version`. @default { aws: '~> 5.0' }
   */
  readonly providers?: Record<string, string>;

  /** Which security scanner(s) to enforce in CI. @default 'both' */
  readonly securityScanner?: SecurityScanner;

  /** Scaffold a Go Terratest module in addition to native `terraform test`. @default false */
  readonly enableTerratest?: boolean;

  /** Remote-state backend scaffold (config only). @default { type: 's3' } */
  readonly backend?: BackendOptions;

  /** Generated repository layout. @default 'single' */
  readonly layout?: RepoLayout;

  /** Pinned tool versions for CI. @default see {@link ToolVersions} */
  readonly toolVersions?: ToolVersions;
}

/** Fully-resolved options (all defaults applied). Internal. */
export interface ResolvedOptions {
  readonly terraformVersion: string;
  readonly providers: Record<string, string>;
  readonly securityScanner: SecurityScanner;
  readonly enableTerratest: boolean;
  readonly backend: Required<BackendOptions>;
  readonly layout: RepoLayout;
  readonly toolVersions: Required<ToolVersions>;
}

/**
 * Apply defaults deterministically. Pure: same input → same output, so synth
 * is idempotent regardless of how options are constructed (Resiliency / NFR-2).
 */
export function resolveOptions(options: TerraformProjectOptions): ResolvedOptions {
  return {
    terraformVersion: options.terraformVersion ?? '>= 1.6',
    providers: options.providers ?? { aws: '~> 5.0' },
    securityScanner: options.securityScanner ?? 'both',
    enableTerratest: options.enableTerratest ?? false,
    backend: {
      type: options.backend?.type ?? 's3',
      bucket: options.backend?.bucket ?? 'CHANGE_ME-tfstate',
      dynamodbTable: options.backend?.dynamodbTable ?? 'CHANGE_ME-tflock',
      region: options.backend?.region ?? 'us-east-1',
    },
    layout: options.layout ?? 'single',
    toolVersions: {
      terraform: options.toolVersions?.terraform ?? '1.9.8',
      tflint: options.toolVersions?.tflint ?? 'v0.53.0',
      tfsec: options.toolVersions?.tfsec ?? 'v1.28.13',
      checkov: options.toolVersions?.checkov ?? '3.2.300',
      terraformDocs: options.toolVersions?.terraformDocs ?? 'v0.19.0',
    },
  };
}
