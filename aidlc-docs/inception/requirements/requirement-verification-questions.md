# Requirements Verification Questions — projen-terraform

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options fit, choose the last option (Other) and describe your preference.
Let me know when you're done and I'll analyze the answers and generate the requirements document.

These resolve the Open Questions from `inputs/vision.md` plus AI-DLC's standard
completeness and extension opt-in questions.

---

## Question 1
How much of the generated HCL should projen **own and regenerate** (header-marked,
overwritten on every `npx projen`) versus **scaffold once** and leave user-owned?

A) projen owns only **governance/config** files (`versions.tf`, `.tflint.hcl`, tfsec/checkov config, `.terraform-docs.yml`); `main.tf`/`variables.tf`/`outputs.tf` are scaffolded once then user-owned

B) projen owns governance/config **and** `versions.tf` provider pins, but all resource HCL (`main.tf` etc.) is user-owned

C) projen owns **everything** including a managed `main.tf` (maximal drift-catching, most constrained for authors)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 2
Which security scanner should the generated repo enforce as the cdk-nag analog?

A) **tfsec** only

B) **checkov** only

C) **Both** tfsec and checkov

D) **Trivy** (tfsec is being folded into Trivy upstream — use the successor)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 3
Which test framework should the `test` task and CI wire up for the **generated** Terraform repos?

A) **Native `terraform test`** only (HCL `.tftest.hcl`, requires TF >= 1.6)

B) **Terratest (Go)** only

C) **Native by default, Terratest as an opt-in flag** (offer both)

D) **No test harness in MVP** (defer to Phase 2)

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 4
How should `projen-terraform` itself be **distributed/consumed**?

A) **Published npm package** in MVP — consumed via `npx projen new --from projen-terraform`

B) **Internal/local external module** in MVP (a folder/private package); public npm publishing deferred to Phase 2

C) **JSII multi-language package** (npm + PyPI etc.) so non-TS teams can consume it

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 5
What should the nightly `upgrade.yml` workflow bump?

A) **Tool versions only** (terraform, tflint, tfsec/checkov, terraform-docs pins)

B) **Provider pins only** (`required_providers` in `versions.tf`)

C) **Both** tool versions and provider pins

X) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## Question 6
The default example provider to scaffold in `versions.tf` (teams override via options).

A) **AWS** (`hashicorp/aws ~> 5.0`)

B) **No default provider** — emit an empty `required_providers` block for the team to fill

C) **AWS + a placeholder comment** showing how to add others

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question 7
Should the generated repo scaffold a **remote state backend** config (S3 + DynamoDB lock)?

A) **Scaffold `backend.tf` config only** (commented/templated), no provisioning — as stated in the Vision

B) **No backend scaffold** in MVP (local state); defer entirely to Phase 2

C) **Scaffold + a separate bootstrap** that provisions the S3 bucket/lock table

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

Enabling it applies directional, design-time best practices from the AWS
Well-Architected Reliability Pillar. It does not certify production-readiness.

A) Yes — apply the resiliency baseline as directional best practices and design-time guidance

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: A

---
