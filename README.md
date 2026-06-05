# projen-terraform

Designing a reusable **projen project type** that scaffolds governed raw-HCL Terraform
repositories — porting the linting, security scanning, docs, tests, and GitHub Actions
trio we already get from projen on our CDK TypeScript repos.

This repo uses [AI-DLC](https://github.com/awslabs/aidlc-workflows) to produce the
design document.

## Inputs

- [`inputs/vision.md`](inputs/vision.md) — what we're building and why
- [`inputs/technical-environment.md`](inputs/technical-environment.md) — tools, constraints, patterns

## Run the design workflow

Open this repo in Claude Code (or any AI-DLC-compatible agent) and say:

> Using AI-DLC, produce the design doc for projen-terraform from the documents in `inputs/`.

The agent follows `.aidlc-rule-details/core-workflow.md` and writes artifacts to
`aidlc-docs/`. See [`CLAUDE.md`](CLAUDE.md) for the full workflow contract.

## Reference

- projen — https://github.com/projen/projen
- AI-DLC — https://github.com/awslabs/aidlc-workflows
