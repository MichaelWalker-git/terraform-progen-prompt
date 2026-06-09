# Units of Work — projen-terraform

This is a **single npm package** deliverable; units are logical modules sequenced for
build order (not independently deployable services). Build order: **U1 → U2 → U3 → U4**
(strictly sequential, per planning Q2=A).

## Code Organization Strategy (greenfield, planning Q4=A)

```
projen-terraform/                     # the project-type package repo
├── .projenrc.ts                      # the package builds ITSELF with projen (node project)
├── src/
│   ├── terraform-project.ts          # U1  C1 composition root
│   ├── options.ts                    # U1  C2 public API
│   ├── hcl/                          # U2  C3 pure renderers (versions.ts, backend.ts)
│   ├── config/                       # U2  C4 tflint/tfsec/checkov/terraform-docs
│   ├── scaffold/                     # U2  C5 SampleFile generators
│   ├── tasks/                        # U3  C6 task graph
│   ├── tests/                        # U3  C8 native + terratest scaffolds
│   └── workflows/                    # U4  C7 hand-rolled YAML
├── test/                             # Jest unit tests + PBT (property-based)
├── examples/                         # U-shared: runnable sample synthesized in CI (Q5=A)
└── ...
```

## U1 — Project Core & Options
- **Components**: C1 `TerraformProject`, C2 `TerraformProjectOptions`
- **Responsibilities**: define the public typed API + defaults; composition root that instantiates U2–U4 in order; own the projen task-graph registration point.
- **Extension obligations**: **Security SECURITY-10** (define + thread `toolVersions` pins; no `latest`); **Resiliency** (deterministic option normalization → idempotent synth).
- **Exit criteria**: `new TerraformProject({})` synthesizes with defaults; options validated; re-synth = zero diff.

## U2 — HCL & Config Generation
- **Components**: C3 HCL renderers (pure), C4 managed-config, C5 scaffold
- **Responsibilities**: emit `versions.tf`/`backend.tf` (managed, header), `.tflint.hcl`/tfsec/checkov/`.terraform-docs.yml` (managed), and create-once `main.tf`/`variables.tf`/`outputs.tf`/`README.md`/`.gitignore` (SampleFile); honor `layout`.
- **Extension obligations**: **PBT (partial)** — property tests on C3 renderers (idempotency, deterministic provider ordering, re-parse round-trip); **Security SECURITY-09** (`.gitignore` blocks state/secrets; backend template blocks public access).
- **Exit criteria**: all files emit with correct managed/scaffold semantics; renderers pass property tests.

## U3 — Tasks & Test Harness
- **Components**: C6 task wiring, C8 test-harness
- **Responsibilities**: register `fmt`/`lint`/`validate`/`security`/`docs`/`test` + composite `build`; scaffold native `terraform test` sample and optional Terratest module.
- **Extension obligations**: **Resiliency** (tasks fail with a clear message when a tool is absent on PATH, not silent pass); **Security** (`security` task runs tfsec+checkov as a blocking gate).
- **Exit criteria**: `npx projen build` runs the full chain in order; `test` wires native (+Terratest when enabled).

## U4 — GitHub Actions
- **Components**: C7 workflow generators
- **Responsibilities**: emit `build.yml` (self-mutation: docs+fmt only), `upgrade.yml` (nightly; bump tools+providers → PR), `pull-request-lint.yml`; tools installed via setup actions (Q4=A).
- **Extension obligations**: **Security SECURITY-06** (least-privilege `permissions`), **SECURITY-13** (`PROJEN_GITHUB_TOKEN` for self-mutation push, no plaintext), **SECURITY-10** (pinned action versions + tool versions, no `latest`).
- **Exit criteria**: three workflows match the CDK reference shapes; permissions minimal; self-mutation scoped per Q5.

## Coverage check
All components C1–C8 and all functional requirements FR-1…FR-6 are assigned (see unit-of-work-story-map.md). No component is unassigned.
