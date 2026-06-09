# Build and Test Summary — projen-terraform

## Build Status
- **Build Tool**: projen + tsc + jest + eslint (Node 20 local; package targets minNode 20, generated repos use Node 22 in CI)
- **Build Command**: `npx projen build`
- **Build Status**: ✅ Success
- **Build Artifacts**: `lib/**` (compiled JS + d.ts), `projen-terraform-0.0.0.tgz` (npm tarball, 25 files)

## Test Execution Summary

### Unit Tests (Jest)
- **Total**: 15
- **Passed**: 15
- **Failed**: 0
- **Coverage**: 100% statements / 100% lines / 100% functions; ~93% branches
- **Suites**: `test/versions.test.ts`, `test/backend.test.ts`, `test/terraform-project.test.ts`

### Property-Based Tests (NFR-4, partial)
Included in `versions.test.ts`:
- provider key-order independence (sorted output)
- render idempotency (double render === single render)
- sorted-order invariant

### Integration / End-to-End
- **`examples/` synthesis**: `TerraformProject` synthesizes a complete governed repo
  (versions.tf, backend.tf, main/variables/outputs.tf, .tflint.hcl, .tfsec/config.yml,
  .checkov.yaml, .terraform-docs.yml, README with docs markers, .gitignore, the three
  workflows, tests/example.tftest.hcl).
- **Idempotency gate**: re-running synth produces zero diff (verified on versions.tf and full tree).

## Extension Compliance (final)
| Rule | Status | Evidence |
|---|---|---|
| SECURITY-06 least privilege | ✅ | build.yml job `contents: read`; only self-mutation job `contents: write` |
| SECURITY-09 misconfiguration | ✅ | generated `.gitignore` blocks `*.tfstate*`/`*.tfvars`; backend template documents encryption + public-access block |
| SECURITY-10 supply chain | ✅ | tool versions pinned (no `latest`); GH actions pinned; `package-lock.json` committed |
| SECURITY-13 integrity | ✅ | self-mutation pushes via `PROJEN_GITHUB_TOKEN` secret |
| PBT (partial) | ✅ | property tests on pure HCL renderers |
| Resiliency (directional) | ✅ | deterministic synth; CI uses `fmt -check`; build fails (not silently mutates) on drift |

## Generated-repo CI behavior (parity with CDK reference)
- **build.yml**: setup tools on PATH → fmt/validate/lint/security/docs → self-mutation (docs+fmt) → patch → apply/push.
- **upgrade.yml**: nightly cron + dispatch → `npx projen upgrade` (tools + providers) → PR.
- **pull-request-lint.yml**: semantic titles feat/fix/chore.

## How to build/test locally
```bash
npm install
npx projen build          # compile + eslint + jest + package
npx projen test           # jest only
# synthesize the example Terraform repo:
cd examples && npx ts-node --compiler-options '{"module":"commonjs"}' .projenrc.ts
```

## Overall Status
- **Build**: ✅ Success
- **All Tests**: ✅ Pass (15/15)
- **Ready for Operations**: Yes (Operations phase is a placeholder; deployment = publish to npm)
