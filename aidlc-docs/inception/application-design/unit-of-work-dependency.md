# Unit of Work Dependencies — projen-terraform

## Dependency Matrix

| Unit | Depends on | Reason | Blocks |
|---|---|---|---|
| U1 Core & Options | projen `Project` | composition root | U2, U3, U4 |
| U2 HCL & Config | U1 (options/types, project handle) | renderers/generators consume resolved options | U3 (task `docs`/`validate` target files), U4 |
| U3 Tasks & Tests | U1, U2 (files must exist to fmt/validate/docs) | tasks operate on emitted files | U4 (workflows invoke `npx projen build`/`test`) |
| U4 Workflows | U1, U3 (task names) | CI calls the tasks | — (terminal) |

Linear chain, no cycles: **U1 → U2 → U3 → U4**.

## Diagram

```mermaid
flowchart LR
    U1["U1 Core & Options"]
    U2["U2 HCL & Config"]
    U3["U3 Tasks & Tests"]
    U4["U4 GitHub Actions"]
    EX["examples/ (CI synth, end-to-end)"]

    U1 --> U2 --> U3 --> U4
    U1 -.-> EX
    U2 -.-> EX
    U3 -.-> EX
    U4 -.-> EX

    style U1 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U2 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U3 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style U4 fill:#4CAF50,stroke:#1B5E20,stroke-width:2px,color:#fff
    style EX fill:#FFF59D,stroke:#F57F17,stroke-width:2px,color:#000
    linkStyle default stroke:#333,stroke-width:2px
```

## Integration / Coordination
- **Shared contract**: `TerraformProjectOptions` (U1) is the single interface all later units read from — version it carefully.
- **Integration point**: the `examples/` project (planning Q5=A) synthesizes the whole package end-to-end in CI; it is the integration test that exercises U1–U4 together and validates idempotency (re-synth = zero diff).
- **Testing checkpoints**: U2 renderers property-tested in isolation; full-package Jest snapshot of `examples/` output after each unit lands.
