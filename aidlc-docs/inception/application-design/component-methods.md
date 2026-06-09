# Component Methods — projen-terraform

Method/option signatures. Detailed business rules are deferred to Functional Design
(CONSTRUCTION phase). Types are TypeScript.

## C2. `TerraformProjectOptions`

```typescript
export type SecurityScanner = 'tfsec' | 'checkov' | 'both';
export type RepoLayout = 'single' | 'modules';

export interface ToolVersions {
  readonly terraform?: string;       // default '1.9.x' pin used by setup-terraform
  readonly tflint?: string;
  readonly tfsec?: string;
  readonly checkov?: string;
  readonly terraformDocs?: string;
}

export interface BackendOptions {
  readonly type?: 's3' | 'none';     // default 's3' (config-only, commented)
  readonly bucket?: string;
  readonly dynamodbTable?: string;
  readonly region?: string;
}

export interface TerraformProjectOptions extends ProjectOptions {
  readonly terraformVersion?: string;            // default '>= 1.6'
  readonly providers?: Record<string, string>;   // default { aws: '~> 5.0' }
  readonly securityScanner?: SecurityScanner;     // default 'both'
  readonly enableTerratest?: boolean;            // default false
  readonly backend?: BackendOptions;             // default { type: 's3' }
  readonly layout?: RepoLayout;                  // default 'single'
  readonly toolVersions?: ToolVersions;          // pinned tool versions (SECURITY-10)
}
```

## C3. HCL renderers (pure)

```typescript
// src/hcl/versions.ts
export function renderVersionsTf(opts: {
  terraformVersion: string;
  providers: Record<string, string>;
}): string;   // returns header + terraform{} block; providers sorted for idempotency

// src/hcl/backend.ts
export function renderBackendTf(opts: BackendOptions): string;  // commented S3+DynamoDB template
```

## C4. Managed-config components

```typescript
// each constructs a projen TextFile on the project, returns void
export function addTflintConfig(project: Project): void;
export function addTfsecConfig(project: Project): void;
export function addCheckovConfig(project: Project): void;
export function addTerraformDocsConfig(project: Project): void;
```

## C5. Scaffold components

```typescript
export function addRootModuleSample(project: Project, layout: RepoLayout): void;  // main/variables/outputs via SampleFile
export function addReadme(project: Project): void;        // includes <!-- BEGIN_TF_DOCS --> markers
export function addGitignore(project: Project): void;     // .terraform/, *.tfstate*, *.tfvars, crash.log
```

## C6. Task wiring

```typescript
export function addTerraformTasks(project: Project, opts: {
  securityScanner: SecurityScanner;
  enableTerratest: boolean;
}): { build: Task };
// fmt:   terraform fmt -recursive (build uses -check)
// lint:  tflint --recursive
// validate: terraform validate
// security: tfsec . ; checkov -d . (per scanner)
// docs:  terraform-docs markdown table --output-file README.md --output-mode inject .
// test:  terraform test  (+ go test ./... when enableTerratest)
// build: spawns fmt(check)->validate->lint->security->docs->test
```

## C7. GitHub Actions generators

```typescript
export function addBuildWorkflow(project: Project, opts: { toolVersions: ToolVersions }): void;
export function addUpgradeWorkflow(project: Project, opts: { toolVersions: ToolVersions; providers: Record<string,string> }): void;
export function addPullRequestLintWorkflow(project: Project): void;
```

Each emits a `TextFile` under `.github/workflows/` with the projen header and
least-privilege `permissions`. `addBuildWorkflow` encodes the self-mutation pattern
limited to terraform-docs + `terraform fmt` changes (Q5).

## C8. Test-harness component

```typescript
export function addNativeTests(project: Project): void;                 // tests/example.tftest.hcl
export function addTerratest(project: Project): void;                   // test/ go module + sample, only if enableTerratest
```

## C1. `TerraformProject` constructor (orchestration — see services.md)

```typescript
export class TerraformProject extends Project {
  constructor(options: TerraformProjectOptions);
}
```
