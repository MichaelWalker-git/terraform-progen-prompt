# Construction Design (Functional + NFR) — projen-terraform

Consolidated per-unit functional and NFR design. Depth is matched to a synthesis tool
(no runtime services, DB, or API). Infrastructure Design is SKIP (no cloud infra of its
own). This doc covers U1–U4 plus tests/examples.

## Functional Design

### U1 — Core & Options
- `TerraformProjectOptions` (in `src/options.ts`): typed interface, all fields optional with documented defaults. Default resolution lives in the constructor (a `resolveOptions()` helper) so synth is deterministic regardless of input ordering.
- `TerraformProject extends javascript.TypeScriptProject` — wait: the *generated* artifact is a Terraform repo, but projen needs a base. We extend the lower-level `Project` (not Node/TS) so we don't impose Node tooling on the generated repo beyond what projen itself needs. The constructor wires sub-components in order: HCL → config → scaffold → tasks → workflows → tests.
- **Idempotency rule**: provider map keys sorted; no timestamps or randomness in any rendered output.

### U2 — HCL & Config
- `renderVersionsTf({terraformVersion, providers})` (pure): managed header + `terraform { required_version, required_providers {…} }`. Providers sorted by key. `hashicorp/<name>` source inferred unless the value is an object with explicit `source`.
- `renderBackendTf(backend)` (pure): commented S3 backend template (bucket/key/region/dynamodb_table). Commented so `terraform init` doesn't fail before the team fills real values.
- Managed config (`TextFile`, marker=true so projen owns them): `.tflint.hcl`, `.tfsec.yml` placeholder, `.checkov.yaml`, `.terraform-docs.yml`.
- Scaffold (`SampleFile`/`SampleDir`, write-once): `main.tf`, `variables.tf`, `outputs.tf` (root for `layout:single`; under `environments/dev` + `modules/` for `layout:modules`), `README.md` with `<!-- BEGIN_TF_DOCS -->`/`<!-- END_TF_DOCS -->` markers, and `.gitignore`.

### U3 — Tasks & Tests
- Tasks added via `project.addTask`. `build` spawns: `fmt` (check) → `validate` → `lint` → `security` → `docs` → `test`.
- `security` runs tfsec and/or checkov per `securityScanner`.
- Test harness: `addNativeTests` writes `tests/example.tftest.hcl`; `addTerratest` (only if `enableTerratest`) writes a Go module + sample and adds `go test ./...` to `test`.

### U4 — Workflows
- Hand-rolled YAML via `TextFile` under `.github/workflows/`, each with projen header.
- `build.yml`: checkout → setup-terraform + tflint/tfsec/checkov/terraform-docs install → `npx projen build` → self-mutation (docs+fmt only) → patch artifact → second job applies & pushes via `PROJEN_GITHUB_TOKEN`.
- `upgrade.yml`: nightly cron + dispatch → upgrade tool/provider pins → PR via peter-evans.
- `pull-request-lint.yml`: semantic PR titles (feat/fix/chore).

## NFR Design (extension obligations, distributed per units Q3=A)

| Rule | Where | Implementation |
|---|---|---|
| SECURITY-10 supply chain | U1, U4 | `toolVersions` pins threaded into workflows; GH actions pinned to versions; package commits `package-lock.json`; no `latest` |
| SECURITY-06 least privilege | U4 | each workflow declares minimal `permissions:`; only self-mutation job gets `contents: write` |
| SECURITY-13 integrity | U4 | self-mutation push uses `PROJEN_GITHUB_TOKEN` secret |
| SECURITY-09 misconfig | U2 | `.gitignore` excludes state/tfvars; backend template documents `block_public_access` |
| PBT (partial) | U2 | property tests: `renderVersionsTf` idempotent + provider-order-independent + re-render stable |
| Resiliency | U1, U3 | deterministic synth; tasks use `terraform fmt -check` (no silent mutation in CI); clear failure when tool missing |

## Test Strategy
- **Jest unit tests**: each renderer/generator; snapshot of a fully-synthed project.
- **Property tests** (lightweight, hand-rolled generators — no new dep): provider maps in random key orders render identically; double-render equals single-render.
- **examples/**: a real `.projenrc.ts` consuming `TerraformProject`; CI synths it and asserts zero-diff on re-synth (idempotency gate).

## Project's own structure
```
.projenrc.ts          # builds this package (TypeScriptProject)
src/{index,options,terraform-project}.ts
src/hcl/{versions,backend}.ts
src/config/{tflint,tfsec,checkov,terraform-docs}.ts
src/scaffold/{module,readme,gitignore}.ts
src/tasks/index.ts
src/tests/{native,terratest}.ts
src/workflows/{build,upgrade,pull-request-lint}.ts
test/*.test.ts
examples/.projenrc.ts
```
