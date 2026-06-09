# Application Design Plan — projen-terraform

This plan drives the Application Design stage. It lists the components I intend to
define, then asks the design questions whose answers change the architecture. Please
fill in the `[Answer]:` tags and let me know when done.

## Proposed Component Breakdown (draft — subject to your answers below)

| Component | Responsibility |
|---|---|
| `TerraformProject` (extends `projen.Project`) | Top-level project type; accepts options, instantiates all sub-components, wires tasks |
| `TerraformOptions` (interface) | Public typed API: `terraformVersion`, `providers`, `securityScanner`, `enableTerratest`, `backend`, etc. |
| HCL renderers (pure functions) | `renderVersionsTf`, `renderBackendTf` — produce deterministic HCL strings from options |
| Managed-config components | Generate `.tflint.hcl`, tfsec config, checkov config, `.terraform-docs.yml` (projen-owned, header-marked) |
| Scaffold components | Create-once `main.tf`/`variables.tf`/`outputs.tf`, `README.md` (with docs markers), `.gitignore` |
| Task wiring | `fmt`/`lint`/`validate`/`security`/`docs`/`test` + composite `build` |
| GitHub Actions generators | `buildWorkflow` (self-mutation), `upgradeWorkflow` (nightly→PR), `pullRequestLintWorkflow` |
| Test-harness component | Native `terraform test` sample + optional Terratest scaffold |

## Design Plan Checkboxes

- [x] Define `components.md` — component definitions + responsibilities
- [x] Define `component-methods.md` — method/option signatures
- [x] Define `services.md` — orchestration (the `TerraformProject` constructor flow + task graph)
- [x] Define `component-dependency.md` — dependency matrix + data flow
- [x] Consolidate into `application-design.md`
- [x] Validate completeness/consistency

---

## Design Questions

## Question 1 — Component organization
How should the generators be organized in the codebase?

A) **Flat** — one file per component under `src/` (e.g. `src/versions-tf.ts`, `src/workflows.ts`)

B) **Grouped by concern** — `src/hcl/`, `src/config/`, `src/workflows/`, `src/tasks/`, `src/tests/`

C) **Single monolithic** `TerraformProject` file with private methods (smallest surface, hardest to test in isolation)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 2 — Reusing projen's built-in components
projen ships `GithubWorkflow`, `Task`, `SampleFile`, `TextFile`, `JsonFile`, `YamlFile`, and an `UpgradeDependencies`/self-mutation mechanism for its own node projects. How much should we build on those vs. hand-roll?

A) **Maximize reuse** — use projen's `GithubWorkflow`, `Task`, `TextFile`, `SampleFile`, and adapt its self-mutation component; only hand-roll what's Terraform-specific

B) **Hand-roll the workflows** — emit our own YAML so the three workflows match the CDK reference byte-for-byte, but reuse `Task`/`TextFile`/`SampleFile`

C) **Minimal reuse** — generate all files via `TextFile`/raw strings for full control

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3 — Managed vs. scaffold file mechanism
For the "create once, then user-owned" files (`main.tf` etc.), which projen primitive?

A) **`SampleFile`/`SampleDir`** — projen's built-in "write only if absent" primitive (idiomatic; never overwrites)

B) **Custom component** with an explicit existence check before writing

C) Treat them as **managed `TextFile`** too (contradicts Q1=A decision; only if you've changed your mind on ownership)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — How tools (terraform/tflint/tfsec/checkov) are invoked in tasks & CI
These are not npm packages. How should the generated repo obtain them?

A) **Assume present on PATH** in CI via setup actions (`hashicorp/setup-terraform`, `terraform-linters/setup-tflint`, etc.); tasks call the bare binary

B) **Pin + install in a bootstrap task** the repo runs (e.g. via `tenv`/`tfenv` for terraform, downloaded binaries for the rest)

C) **Containerized** — run tools via pinned Docker images in tasks and CI

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — Scope of the self-mutation in `build.yml`
The CDK repo's self-mutation commits any file change made during `build` (regenerated docs, fmt fixes). For Terraform, which changes should self-mutation auto-commit?

A) **terraform-docs output + `terraform fmt` fixes only** (safe, mechanical regenerations)

B) **Any projen-managed file drift** (broadest — matches CDK behavior most closely)

C) **Nothing** — `build` is check-only in CI (`fmt -check`, fail on diff) and never pushes back

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 6 — Multi-environment / multi-module layout of the GENERATED repo
What directory shape should a freshly-scaffolded Terraform repo have?

A) **Single root module** — `main.tf` etc. at repo root (simplest; matches the "config-only ownership" MVP)

B) **`environments/` + `modules/`** convention — opinionated multi-env layout from day one

C) **Configurable** via an option (`layout: 'single' | 'modules'`), default single

X) Other (please describe after [Answer]: tag below)

[Answer]: C
