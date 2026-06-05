# CLAUDE.md — projen-terraform (AI-DLC workspace)

## What this repo is

A workspace for designing **`projen-terraform`**: a reusable projen project type that
scaffolds governed raw-HCL Terraform repositories — porting the linting, security
scanning, docs, tests, and GitHub Actions trio we already get from projen on our CDK
TypeScript repos. See `inputs/vision.md` and `inputs/technical-environment.md`.

We are using **AI-DLC** (AI-Driven Development Life Cycle) to produce the design doc.

## MANDATORY workflow

When asked to design, plan, or build in this repo, you MUST follow the AI-DLC
workflow FIRST — it overrides default behavior:

1. Load `.aidlc-rule-details/core-workflow.md` and follow it.
2. Load the common rules it references (`common/process-overview.md`,
   `common/session-continuity.md`, `common/content-validation.md`,
   `common/question-format-guide.md`, `common/welcome-message.md`).
3. Treat `inputs/vision.md` as the Vision document and
   `inputs/technical-environment.md` as the Technical Environment document.
4. This is a **greenfield** workspace (no existing application code) — skip Reverse
   Engineering; go Workspace Detection → Requirements Analysis → (User Stories) →
   Workflow Planning → Application Design → Units Generation.
5. Write all generated artifacts under `aidlc-docs/` ONLY. Never put design docs
   elsewhere; never put application code in `aidlc-docs/`.
6. Maintain `aidlc-docs/aidlc-state.md` and append (never overwrite) `aidlc-docs/audit.md`.
7. Wait for explicit user approval at every stage gate.

## Directory map

```
inputs/                  # Vision + Technical Environment (the AI-DLC inputs)
.aidlc-rule-details/     # AI-DLC rules (core-workflow.md + common/inception/...)
.aidlc-source/           # Full upstream clone of awslabs/aidlc-workflows (reference)
aidlc-docs/              # ← AI-DLC writes the design doc here
```

## Reference repos

- projen: https://github.com/projen/projen (mirror `AwsCdkTypeScriptApp` patterns)
- AI-DLC: https://github.com/awslabs/aidlc-workflows
