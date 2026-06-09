# Component Dependencies — projen-terraform

## Dependency Matrix

| Component | Depends on | Consumed by |
|---|---|---|
| C2 `TerraformProjectOptions` | (none) | C1, C3, C4, C6, C7, C8 |
| C3 HCL renderers | C2 (types) | C1 |
| C4 Managed-config | projen `TextFile`, C2 | C1 |
| C5 Scaffold | projen `SampleFile`/`SampleDir`, C2 | C1 |
| C6 Task wiring | projen `Task`, C2 | C1, C7 (workflows call tasks) |
| C7 Workflows | projen `TextFile`, C2, C6 (task names) | C1 |
| C8 Test-harness | projen `SampleFile`, C2, C6 (`test` task) | C1 |
| C1 `TerraformProject` | projen `Project`, C2–C8 | end consumer |

No cycles. C1 is the only composition root; C3 is pure (no projen dependency), which is
what makes it cleanly property-testable (NFR-4).

## Dependency Diagram

```mermaid
flowchart TD
    OPT["C2 TerraformProjectOptions"]
    HCL["C3 HCL renderers (pure)"]
    CFG["C4 Managed-config"]
    SCF["C5 Scaffold (SampleFile)"]
    TSK["C6 Task wiring"]
    WF["C7 Workflows (hand-rolled YAML)"]
    TST["C8 Test-harness"]
    ROOT["C1 TerraformProject"]
    PROJEN["projen (Project, TextFile, SampleFile, Task)"]
    CONSUMER(["Consumer: npx projen new --from"])

    OPT --> HCL
    OPT --> CFG
    OPT --> SCF
    OPT --> TSK
    OPT --> WF
    OPT --> TST
    TSK --> WF
    TSK --> TST
    HCL --> ROOT
    CFG --> ROOT
    SCF --> ROOT
    TSK --> ROOT
    WF --> ROOT
    TST --> ROOT
    PROJEN --> ROOT
    PROJEN --> CFG
    PROJEN --> SCF
    PROJEN --> TSK
    PROJEN --> WF
    CONSUMER --> ROOT

    style ROOT fill:#4CAF50,stroke:#1B5E20,stroke-width:3px,color:#fff
    style HCL fill:#FFA726,stroke:#E65100,stroke-width:2px,color:#000
    style PROJEN fill:#BBDEFB,stroke:#0D47A1,stroke-width:2px,color:#000
    style CONSUMER fill:#CE93D8,stroke:#6A1B9A,stroke-width:3px,color:#000
    linkStyle default stroke:#333,stroke-width:2px
```

## Communication Patterns
- **In-process, synchronous**: all wiring is constructor calls at synth time. No network, no IPC.
- **Data flow**: `options` (plain object) flows down; components return `void` (they mutate the projen file tree) except C3 renderers which return strings.
- **Tool invocation** (runtime, not synth): tasks (C6) shell out to bare binaries on PATH (Q4); workflows (C7) install those binaries via setup actions before running tasks.

## Build / packaging dependencies
- The project type itself is a TypeScript npm package (Node 22, npm), unit-tested with Jest; C3 additionally property-tested. Published to npm for `--from` consumption (Q4 distribution).
