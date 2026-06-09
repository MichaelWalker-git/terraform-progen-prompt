import { Project, SampleFile } from 'projen';
import { ResolvedOptions } from '../options';

/** Native `terraform test` sample (`.tftest.hcl`). */
export function addNativeTests(scope: Project): void {
  new SampleFile(scope, 'tests/example.tftest.hcl', {
    contents: [
      '# Native Terraform test (requires Terraform >= 1.6).',
      '# Run with: terraform test',
      '',
      'run "validate_plan" {',
      '  command = plan',
      '}',
      '',
    ].join('\n'),
  });
}

/** Optional Go Terratest scaffold. */
export function addTerratest(scope: Project): void {
  new SampleFile(scope, 'test/go.mod', {
    contents: [
      'module terraform-tests',
      '',
      'go 1.22',
      '',
      'require github.com/gruntwork-io/terratest v0.47.0',
      '',
    ].join('\n'),
  });

  new SampleFile(scope, 'test/terraform_test.go', {
    contents: [
      'package test',
      '',
      'import (',
      '\t"testing"',
      '',
      '\t"github.com/gruntwork-io/terratest/modules/terraform"',
      ')',
      '',
      'func TestTerraformPlan(t *testing.T) {',
      '\topts := &terraform.Options{TerraformDir: "../"}',
      '\tterraform.Init(t, opts)',
      '\tterraform.Plan(t, opts)',
      '}',
      '',
    ].join('\n'),
  });
}

/** Wire up the test harness for the generated repo. */
export function addTestHarness(scope: Project, opts: ResolvedOptions): void {
  addNativeTests(scope);
  if (opts.enableTerratest) {
    addTerratest(scope);
  }
}
