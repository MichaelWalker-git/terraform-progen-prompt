import { Project } from 'projen';
import { addManagedConfig } from './config';
import { resolveOptions, TerraformProjectOptions } from './options';
import { addScaffold } from './scaffold';
import { addTerraformTasks } from './tasks';
import { addTestHarness } from './tests';
import { addWorkflows } from './workflows';

/**
 * A projen project type that scaffolds a governed raw-HCL Terraform repository.
 *
 * Ports the projen single-source-of-truth model from CDK-TypeScript to plain
 * Terraform: linting (tflint), security scanning (tfsec/checkov), docs
 * (terraform-docs), tests (native + optional Terratest), and the GitHub Actions
 * trio (build with self-mutation, nightly upgrade, semantic PR lint) are all
 * generated and kept in sync from a single `.projenrc.ts`.
 *
 * @example
 * import { TerraformProject } from 'projen-terraform';
 * const project = new TerraformProject({
 *   name: 'my-infra',
 *   providers: { aws: '~> 5.0' },
 *   securityScanner: 'both',
 * });
 * project.synth();
 */
export class TerraformProject extends Project {
  constructor(options: TerraformProjectOptions) {
    super(options);

    const resolved = resolveOptions(options);

    // Order: managed config → scaffold (HCL seeds) → tasks → workflows → tests.
    addManagedConfig(this, resolved);
    addScaffold(this, resolved);
    addTerraformTasks(this, resolved);
    addWorkflows(this, resolved);
    addTestHarness(this, resolved);
  }
}
