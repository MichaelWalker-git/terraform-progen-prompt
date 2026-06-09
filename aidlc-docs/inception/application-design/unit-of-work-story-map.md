# Unit of Work ↔ Requirements Map — projen-terraform

User Stories were skipped (single persona). This maps **functional requirements**
(requirements.md FR-1…FR-6) and **components** (C1–C8) to units, ensuring full coverage.

| Requirement | Description | Unit | Components |
|---|---|---|---|
| FR-1.1–1.4 | `TerraformProject` class, typed options, `--from` consumable, idempotent synth | **U1** | C1, C2 |
| FR-2.1 | `versions.tf` managed | **U2** | C3 |
| FR-2.5 | `backend.tf` managed (commented) | **U2** | C3 |
| FR-2.2–2.4, 2.6 | `.tflint.hcl`, tfsec, checkov, `.terraform-docs.yml` managed + headers | **U2** | C4 |
| FR-3.1–3.3 | scaffold `main/variables/outputs.tf`, README markers, `.gitignore` | **U2** | C5 |
| FR-4.1–4.7 | tasks `fmt`/`lint`/`validate`/`security`/`docs`/`test`/`build` | **U3** | C6 |
| FR-6.1–6.2 | native `terraform test` sample, Terratest opt-in | **U3** | C8 |
| FR-5.1 | `build.yml` self-mutation | **U4** | C7 |
| FR-5.2 | `upgrade.yml` nightly, tools+providers | **U4** | C7 |
| FR-5.3–5.4 | `pull-request-lint.yml`, projen headers | **U4** | C7 |
| FR-6.3 | Jest unit tests of synthesis logic | **all** | test/ + examples/ |

## Non-functional / extension coverage

| NFR / Extension | Unit(s) |
|---|---|
| NFR-1 consistency with CDK repos | U4 (workflow fidelity), U3 (task names) |
| NFR-2 idempotent synthesis | U1 (normalization), U2 (deterministic renderers), examples/ (verify) |
| NFR-3 Security Baseline (blocking) | U1 (SECURITY-10 pins), U2 (SECURITY-09 gitignore/backend), U4 (SECURITY-06/-13 perms+token) |
| NFR-4 PBT (partial) | U2 (C3 pure renderers) |
| NFR-5 Resiliency (directional) | U1 (determinism), U3 (fail-clear on missing tools) |
| NFR-6 usability (<5 min to green CI) | U1 defaults + examples/ |

**Coverage result**: every FR (FR-1…FR-6), component (C1–C8), and NFR/extension is assigned to at least one unit. No gaps.
