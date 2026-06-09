# Services / Orchestration — projen-terraform

There is no runtime "service layer" — this is a synthesis-time tool. The orchestration
is (a) the `TerraformProject` constructor wiring and (b) the projen task graph executed
by `npx projen <task>`.

## Orchestration 1: `TerraformProject` constructor flow

```
new TerraformProject(options)
  │
  ├─ 1. normalize options → resolved config (apply defaults: tf '>= 1.6',
  │      providers {aws '~> 5.0'}, scanner 'both', layout 'single', tool pins)
  │
  ├─ 2. managed HCL (TextFile, overwrite):
  │        versions.tf  ← renderVersionsTf(config)
  │        backend.tf   ← renderBackendTf(config.backend)   [if backend.type !== 'none']
  │
  ├─ 3. managed config (TextFile, overwrite):
  │        addTflintConfig / addTfsecConfig / addCheckovConfig / addTerraformDocsConfig
  │        (tfsec/checkov added per config.securityScanner)
  │
  ├─ 4. scaffold (SampleFile, write-once):
  │        addRootModuleSample(layout) / addReadme / addGitignore
  │
  ├─ 5. tasks: addTerraformTasks(config) → build task graph
  │
  ├─ 6. workflows (TextFile under .github/workflows):
  │        addBuildWorkflow / addUpgradeWorkflow / addPullRequestLintWorkflow
  │
  └─ 7. tests: addNativeTests (+ addTerratest if enableTerratest)
```

Order matters only where step 5 references task names used by step 6 (workflows call
`npx projen build`). Steps 2–4 and 7 are independent.

## Orchestration 2: the `build` task graph (runtime of `npx projen build`)

```
build
 ├─ fmt (check mode)      terraform fmt -check -recursive
 ├─ validate             terraform validate
 ├─ lint                 tflint --recursive
 ├─ security             tfsec .   AND/OR   checkov -d .     (per scanner; blocking)
 ├─ docs                 terraform-docs ... --output-mode inject README.md
 └─ test                 terraform test     (+ go test ./...  if Terratest)
```

- **Fail-fast ordering**: format/validate (cheap, catch malformed HCL) before security/test.
- **`docs` in build**: regenerates README block; in CI any resulting diff is caught by self-mutation (Q5) and auto-committed.

## Orchestration 3: CI self-mutation (build.yml) — mirrors CDK reference

```
job build:
  checkout → setup-terraform/tflint/tfsec/checkov/terraform-docs (PATH, Q4)
          → npx projen build
          → git diff --staged --patch --exit-code > repo.patch  (docs+fmt only, Q5)
          → upload repo.patch if changed → fail with message
job self-mutation (needs build, same-repo only):
  download patch → git apply → commit "chore: self mutation" → push via PROJEN_GITHUB_TOKEN
```

## Distribution flow (consumer side)

```
npx projen new --from projen-terraform [--option ...]
  → projen resolves the published package
  → instantiates TerraformProject with CLI-provided options
  → synth writes all files into the consumer's cwd
```
