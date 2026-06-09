# Unit of Work Plan — projen-terraform (Part 1: Planning)

This decomposes the system (components C1–C8 from Application Design) into units of
work for the CONSTRUCTION phase. Since this is a **single npm package** (not
microservices), units are **logical modules within one deliverable**, sequenced for
build order. Please answer the `[Answer]:` tags and let me know when done.

## Proposed Decomposition (draft — subject to answers)

| Unit | Modules (components) | Why grouped |
|---|---|---|
| **U1 — Project Core & Options** | C1 `TerraformProject`, C2 `TerraformProjectOptions` | The composition root + public API; everything else plugs into it. Must exist first. |
| **U2 — HCL & Config Generation** | C3 HCL renderers, C4 managed-config, C5 scaffold | All file-emitting generators (versions/backend HCL, tflint/tfsec/checkov/docs config, sample files). Cohesive: "produce the repo's files." Includes the property-tested pure renderers. |
| **U3 — Tasks & Test Harness** | C6 task wiring, C8 test-harness | The projen task graph + native/Terratest scaffolds. Depends on knowing which files exist (U2). |
| **U4 — GitHub Actions** | C7 workflow generators | The build/upgrade/pull-request-lint trio. Depends on task names (U3) and is the highest-fidelity-to-CDK piece. |

Build order: U1 → U2 → U3 → U4 (each depends on the prior).

## Planning Checkboxes
- [x] Generate `unit-of-work.md` (unit definitions + responsibilities + greenfield code-org strategy)
- [x] Generate `unit-of-work-dependency.md` (dependency matrix)
- [x] Generate `unit-of-work-story-map.md` (map requirements/FRs to units)
- [x] Validate unit boundaries and dependencies
- [x] Ensure all components/FRs assigned to a unit

---

## Decomposition Questions

## Question 1 — Unit granularity
Does the proposed 4-unit split match how you'd want to build and review this?

A) **Yes — 4 units** (Core/Options, HCL+Config, Tasks+Tests, Workflows) as drafted

B) **Coarser — 2 units** (Core+Generators, then CI+Tests) for a smaller package

C) **Finer — split U2** into separate HCL, managed-config, and scaffold units (more granular reviews)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2 — Build/review sequencing
How should the units be sequenced for the CONSTRUCTION phase?

A) **Strictly sequential** U1→U2→U3→U4 (each fully designed+built before the next; matches AI-DLC per-unit loop)

B) **Core first, then U2–U4 in parallel** where dependencies allow

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3 — Where do the extension obligations live?
Security Baseline (blocking), PBT (partial), Resiliency (directional) cut across units. How to assign them?

A) **Distribute to the owning unit** — PBT→U2 (pure renderers), Security/least-privilege→U4 (workflows) + U1 (pinning), Resiliency→U1/U3 (determinism, fail-clear)

B) **One cross-cutting "NFR/quality" unit** that owns all extension compliance centrally

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4 — Repository structure for the project-type package itself (greenfield code org)
Confirm the package's own source layout (this is the tool's repo, not the generated repo).

A) **`src/` grouped by concern** (hcl/, config/, scaffold/, tasks/, workflows/, tests/) + `test/` for Jest/PBT — matches Application Design Q1=B

B) **`src/` flat** with one file per component

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 5 — Example/fixture consumer project
Should the package include a runnable example that synthesizes a sample Terraform repo (for tests + docs)?

A) **Yes** — an `examples/` project synthesized in CI to prove end-to-end output (recommended; also serves PBT/idempotency checks)

B) **No** — rely on Jest snapshot/property tests of synthesized output only

X) Other (please describe after [Answer]: tag below)

[Answer]: A
