# Components — projen-terraform

Design decisions in effect (from application-design-plan.md):
- **Q1=B** Grouped by concern (`src/hcl/`, `src/config/`, `src/workflows/`, `src/tasks/`, `src/tests/`)
- **Q2=B** Hand-roll the three workflows as YAML; reuse projen `Task`/`TextFile`/`SampleFile`
- **Q3=A** `SampleFile`/`SampleDir` for create-once user-owned files
- **Q4=A** Tools obtained on PATH via GitHub setup actions; tasks call bare binaries
- **Q5=A** Self-mutation auto-commits terraform-docs output + `terraform fmt` fixes only
- **Q6=C** Generated repo layout configurable (`single` | `modules`), default `single`

## C1. `TerraformProject` (extends `projen.Project`)
- **Purpose**: Top-level project type. The single entry consumers instantiate (directly or via `npx projen new --from projen-terraform`).
- **Responsibilities**:
  - Accept and normalize `TerraformProjectOptions` (apply defaults).
  - Instantiate every sub-component in dependency order.
  - Own the projen task graph (`fmt`/`lint`/`validate`/`security`/`docs`/`test`/`build`).
  - Expose the resolved config to sub-components.
- **Interface**: `new TerraformProject(options: TerraformProjectOptions)`; `synth()` inherited.
- **Location**: `src/terraform-project.ts`

## C2. `TerraformProjectOptions` (interface)
- **Purpose**: The public, typed API surface — the project's "contract".
- **Responsibilities**: Declare all consumer-facing knobs with defaults documented.
- **Fields** (detailed in component-methods.md): `name`, `terraformVersion`, `providers`, `securityScanner`, `enableTerratest`, `backend`, `layout`, `toolVersions`.
- **Location**: `src/options.ts`

## C3. HCL renderers (`src/hcl/`)
- **Purpose**: Pure, deterministic functions mapping options → HCL strings. The unit under property test (NFR-4).
- **Members**:
  - `renderVersionsTf(opts)` → `versions.tf` content (required_version + required_providers).
  - `renderBackendTf(opts)` → `backend.tf` content (commented S3+DynamoDB template).
- **Responsibilities**: No I/O, no projen objects — string in/out only; emit the projen "do not edit" header; stable ordering (sorted provider keys) for idempotency.
- **Location**: `src/hcl/versions.ts`, `src/hcl/backend.ts`

## C4. Managed-config components (`src/config/`)
- **Purpose**: Generate projen-owned (regenerated, header-marked) tooling config via `TextFile`.
- **Members**: `.tflint.hcl`, tfsec config (`.tfsec/config.yml` or `tfsec.yml`), checkov config (`.checkov.yaml`), `.terraform-docs.yml`.
- **Responsibilities**: Write deterministic config; overwrite on every `synth`; carry the managed header.
- **Location**: `src/config/tflint.ts`, `src/config/tfsec.ts`, `src/config/checkov.ts`, `src/config/terraform-docs.ts`

## C5. Scaffold components (`src/scaffold/`)
- **Purpose**: Create-once, user-owned files via `SampleFile`/`SampleDir` (never overwritten).
- **Members**: `main.tf`, `variables.tf`, `outputs.tf` (root or per-layout), `README.md` (with terraform-docs markers), `.gitignore`.
- **Responsibilities**: Honor `layout` (single root vs `environments/`+`modules/`); write only if absent.
- **Location**: `src/scaffold/`

## C6. Task wiring (`src/tasks/`)
- **Purpose**: Define the projen `Task`s and the composite `build` graph.
- **Members**: `fmt`, `lint`, `validate`, `security`, `docs`, `test`, `build`.
- **Responsibilities**: Each task calls bare tool binaries (Q4); `build` spawns them in order: `fmt`(check)→`validate`→`lint`→`security`→`docs`→`test`. `security` runs tfsec and/or checkov per `securityScanner`.
- **Location**: `src/tasks/index.ts`

## C7. GitHub Actions generators (`src/workflows/`)
- **Purpose**: Hand-rolled YAML (Q2) for the three workflows, mirroring the CDK reference shapes.
- **Members**:
  - `buildWorkflow` — checkout, setup tools (setup-terraform/setup-tflint/etc.), `npx projen build`, self-mutation (docs+fmt only, Q5) → `repo.patch` → apply/push via `PROJEN_GITHUB_TOKEN`.
  - `upgradeWorkflow` — nightly cron + dispatch; bumps tool versions **and** provider pins; PR via `peter-evans/create-pull-request@v7`.
  - `pullRequestLintWorkflow` — `amannn/action-semantic-pull-request@v6`, types `feat`/`fix`/`chore`.
- **Responsibilities**: Emit YAML through `TextFile` with the projen header; least-privilege `permissions` (SECURITY-06).
- **Location**: `src/workflows/build.ts`, `src/workflows/upgrade.ts`, `src/workflows/pull-request-lint.ts`

## C8. Test-harness component (`src/tests/`)
- **Purpose**: Wire the generated repo's test strategy.
- **Members**: native `terraform test` sample (`tests/*.tftest.hcl`); optional Terratest scaffold (Go module) when `enableTerratest`.
- **Responsibilities**: Register the `test` task target(s); scaffold sample tests via `SampleFile`.
- **Location**: `src/tests/native.ts`, `src/tests/terratest.ts`

## Components NOT built (explicit)
- No Infrastructure Design component — the tool provisions nothing (backend is config-only). Marked SKIP in the execution plan.
