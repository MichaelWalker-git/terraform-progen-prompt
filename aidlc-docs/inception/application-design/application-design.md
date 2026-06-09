# Application Design — projen-terraform (Consolidated)

Consolidates `components.md`, `component-methods.md`, `services.md`, and
`component-dependency.md`. This is the architecture for the `projen-terraform`
project type. Detailed business logic is deferred to Functional Design (CONSTRUCTION).

## 1. Overview

`projen-terraform` is a TypeScript npm package exposing a `TerraformProject` projen
project type. Consumers run `npx projen new --from projen-terraform` to scaffold a
governed raw-HCL Terraform repository whose linting, security scanning, docs, tests,
and GitHub Actions are generated and kept in sync from a single `.projenrc.ts`.

## 2. Design Decisions (locked)

| Ref | Decision |
|---|---|
| Q1=B | Code grouped by concern: `src/hcl/`, `src/config/`, `src/scaffold/`, `src/tasks/`, `src/workflows/`, `src/tests/` |
| Q2=B | Hand-roll the three workflow YAMLs (CDK-reference fidelity); reuse projen `Task`/`TextFile`/`SampleFile` |
| Q3=A | `SampleFile`/`SampleDir` for create-once user-owned HCL |
| Q4=A | CLI tools obtained on PATH via GitHub setup actions; tasks call bare binaries |
| Q5=A | Self-mutation auto-commits terraform-docs output + `terraform fmt` fixes only |
| Q6=C | Generated-repo layout configurable (`single` \| `modules`), default `single` |
| Req | Config-only ownership; scanner=both; native+Terratest opt-in; npm-published; upgrade bumps tools+providers; AWS default provider; backend.tf config-only |

## 3. Components (summary)

| ID | Component | Kind | Location |
|---|---|---|---|
| C1 | `TerraformProject` | composition root (extends `projen.Project`) | `src/terraform-project.ts` |
| C2 | `TerraformProjectOptions` | public typed API | `src/options.ts` |
| C3 | HCL renderers | pure functions (property-tested) | `src/hcl/` |
| C4 | Managed-config | projen-owned `TextFile` generators | `src/config/` |
| C5 | Scaffold | create-once `SampleFile`/`SampleDir` | `src/scaffold/` |
| C6 | Task wiring | projen `Task` graph | `src/tasks/` |
| C7 | Workflow generators | hand-rolled YAML | `src/workflows/` |
| C8 | Test-harness | native `terraform test` + optional Terratest | `src/tests/` |

Full responsibilities → `components.md`. Signatures → `component-methods.md`.

## 4. Orchestration

- **Synth-time**: `TerraformProject` constructor instantiates C2→C8 in dependency order (see `services.md` Orchestration 1).
- **Task graph**: `build` = fmt(check)→validate→lint→security→docs→test (`services.md` Orchestration 2).
- **CI**: `build.yml` runs `npx projen build` then self-mutates (docs+fmt only) and pushes via `PROJEN_GITHUB_TOKEN` (`services.md` Orchestration 3).

## 5. Dependencies

C1 is the only composition root; C3 is pure (no projen dependency) → cleanly property-testable. No cycles. Matrix + diagram in `component-dependency.md`.

## 6. Extension alignment (carried into Construction)

- **Security Baseline (blocking)**: SECURITY-10 → all tool/provider versions pinned via `toolVersions` (no `latest`), lockfile committed; SECURITY-06 → least-privilege workflow `permissions`; SECURITY-13 → `PROJEN_GITHUB_TOKEN` for self-mutation push; SECURITY-09 → generated `.gitignore` blocks state/secrets, backend template blocks public access.
- **PBT (partial)**: C3 HCL renderers get property tests — round-trip/idempotency (rendered HCL is stable across re-renders; provider ordering deterministic).
- **Resiliency (directional)**: deterministic synth (idempotent re-run = zero diff); CI surfaces drift via self-mutation; tasks fail with a clear message when a tool is absent on PATH.

## 7. Open items into Construction
- Exact tfsec maintenance/Trivy-successor tracking (revisit in `upgrade`).
- `modules` layout concrete directory shape (Functional Design for C5).
- Whether `docs` task uses terraform-docs `inject` vs full-file output (lean `inject` to preserve human README prose).
