# projen-terraform

A reusable **projen project type** that scaffolds governed raw-HCL Terraform
repositories — porting the linting, security scanning, docs, tests, and GitHub Actions
trio we already get from projen on CDK-TypeScript repos to plain Terraform, all from a
single `.projenrc.ts`.

## What you get

Instantiate `TerraformProject` and `npx projen` generates:

- **Managed config** (regenerated on every synth): `versions.tf`, `backend.tf` (commented S3+lock template), `.tflint.hcl`, `.tfsec/config.yml`, `.checkov.yaml`, `.terraform-docs.yml`
- **Scaffold** (written once, then yours): `main.tf` / `variables.tf` / `outputs.tf`, `README.md` with terraform-docs markers, `.gitignore` that blocks state + secrets
- **Tasks**: `fmt`, `lint`, `validate`, `security`, `docs`, `test`, composite `build`
- **GitHub Actions trio**: `build.yml` (self-mutation for docs+fmt), `upgrade.yml` (nightly → PR, bumps tools + providers), `pull-request-lint.yml` (semantic titles)
- **Tests**: native `terraform test` sample, optional Terratest (Go) scaffold

## Usage

```typescript
// .projenrc.ts
import { TerraformProject } from 'projen-terraform';

const project = new TerraformProject({
  name: 'my-infra',
  providers: { aws: '~> 5.0', random: '~> 3.0' },
  securityScanner: 'both',   // 'tfsec' | 'checkov' | 'both'
  layout: 'single',          // 'single' | 'modules'
  enableTerratest: false,
});

project.synth();
```

See [`examples/.projenrc.ts`](examples/.projenrc.ts) for a runnable example.

## Options

| Option | Default | Description |
|---|---|---|
| `terraformVersion` | `>= 1.6` | `required_version` in versions.tf |
| `providers` | `{ aws: '~> 5.0' }` | provider pins (`name: version` or `name: 'source@version'`) |
| `securityScanner` | `both` | tfsec, checkov, or both |
| `enableTerratest` | `false` | scaffold a Go Terratest module |
| `backend` | `{ type: 's3' }` | remote-state backend scaffold (config only) |
| `layout` | `single` | `single` root module or `environments/`+`modules/` |
| `toolVersions` | pinned | CLI tool version pins (no `latest`) |

## Develop

```bash
npm install
npx projen build      # compile + eslint + jest + package
npx projen test       # jest only
```

## Design provenance

This project was designed with [AI-DLC](https://github.com/awslabs/aidlc-workflows).
The full design record lives in `aidlc-docs/` (requirements, execution plan, application
design, units of work, construction design). See [`CLAUDE.md`](CLAUDE.md) for the
workflow contract and [`NOTICE.md`](NOTICE.md) for third-party attribution.

## Reference

- projen — https://github.com/projen/projen
- AI-DLC — https://github.com/awslabs/aidlc-workflows
