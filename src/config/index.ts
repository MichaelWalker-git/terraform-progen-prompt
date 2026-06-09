import { IConstruct } from 'constructs';
import { TextFile } from 'projen';
import { MANAGED_HEADER } from '../hcl/versions';
import { ResolvedOptions } from '../options';

/** Helper: a projen-managed text file (our own header, not projen's marker). */
function managed(scope: IConstruct, filePath: string, lines: string[]): void {
  new TextFile(scope, filePath, {
    marker: false,
    readonly: false,
    lines,
  });
}

/** `.tflint.hcl` — tflint config with the terraform ruleset enabled. */
export function addTflintConfig(scope: IConstruct): void {
  managed(scope, '.tflint.hcl', [
    MANAGED_HEADER,
    'config {',
    '  call_module_type = "local"',
    '  force            = false',
    '}',
    '',
    'plugin "terraform" {',
    '  enabled = true',
    '  preset  = "recommended"',
    '}',
    '',
  ]);
}

/** tfsec config (minimal; teams extend). */
export function addTfsecConfig(scope: IConstruct): void {
  managed(scope, '.tfsec/config.yml', [
    MANAGED_HEADER,
    '# tfsec configuration. Add exclusions here with justification.',
    'minimum_severity: MEDIUM',
    '',
  ]);
}

/** checkov config (minimal; teams extend). */
export function addCheckovConfig(scope: IConstruct): void {
  managed(scope, '.checkov.yaml', [
    MANAGED_HEADER,
    'directory:',
    '  - .',
    'quiet: true',
    'compact: true',
    '',
  ]);
}

/** `.terraform-docs.yml` — injects a generated table between README markers. */
export function addTerraformDocsConfig(scope: IConstruct): void {
  managed(scope, '.terraform-docs.yml', [
    MANAGED_HEADER,
    'formatter: markdown table',
    'output:',
    '  file: README.md',
    '  mode: inject',
    '  template: |-',
    '    <!-- BEGIN_TF_DOCS -->',
    '    {{ .Content }}',
    '    <!-- END_TF_DOCS -->',
    'sort:',
    '  enabled: true',
    '  by: name',
    '',
  ]);
}

/** Add all managed config files; tfsec/checkov added per chosen scanner. */
export function addManagedConfig(scope: IConstruct, opts: ResolvedOptions): void {
  addTflintConfig(scope);
  addTerraformDocsConfig(scope);
  if (opts.securityScanner === 'tfsec' || opts.securityScanner === 'both') {
    addTfsecConfig(scope);
  }
  if (opts.securityScanner === 'checkov' || opts.securityScanner === 'both') {
    addCheckovConfig(scope);
  }
}
