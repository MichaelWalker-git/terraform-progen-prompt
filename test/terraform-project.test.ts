import { Testing } from 'projen';
import { TerraformProject, TerraformProjectOptions } from '../src';

function synth(options: Partial<TerraformProjectOptions> = {}) {
  const project = new TerraformProject({ name: 'test-infra', ...options });
  return Testing.synth(project);
}

describe('TerraformProject', () => {
  test('synthesizes governance, scaffold, workflows, and tests with defaults', () => {
    const out = synth();
    const files = Object.keys(out);

    // managed config
    expect(files).toContain('.tflint.hcl');
    expect(files).toContain('.terraform-docs.yml');
    // default scanner is 'both'
    expect(files).toContain('.tfsec/config.yml');
    expect(files).toContain('.checkov.yaml');

    // scaffold (single layout → root)
    expect(files).toContain('main.tf');
    expect(files).toContain('variables.tf');
    expect(files).toContain('outputs.tf');
    expect(files).toContain('versions.tf');
    expect(files).toContain('backend.tf');
    expect(files).toContain('README.md');
    expect(files).toContain('.gitignore');

    // workflows
    expect(files).toContain('.github/workflows/build.yml');
    expect(files).toContain('.github/workflows/upgrade.yml');
    expect(files).toContain('.github/workflows/pull-request-lint.yml');

    // tests
    expect(files).toContain('tests/example.tftest.hcl');
  });

  test('versions.tf carries the default AWS provider', () => {
    const out = synth();
    expect(out['versions.tf']).toContain('hashicorp/aws');
    expect(out['versions.tf']).toContain('~> 5.0');
  });

  test('scanner=tfsec omits checkov config and vice versa', () => {
    const tfsecOnly = synth({ securityScanner: 'tfsec' });
    expect(Object.keys(tfsecOnly)).toContain('.tfsec/config.yml');
    expect(Object.keys(tfsecOnly)).not.toContain('.checkov.yaml');

    const checkovOnly = synth({ securityScanner: 'checkov' });
    expect(Object.keys(checkovOnly)).toContain('.checkov.yaml');
    expect(Object.keys(checkovOnly)).not.toContain('.tfsec/config.yml');
  });

  test('layout=modules nests resource files under environments/dev', () => {
    const out = synth({ layout: 'modules' });
    const files = Object.keys(out);
    expect(files).toContain('environments/dev/main.tf');
    expect(files).toContain('environments/dev/versions.tf');
    expect(files).toContain('modules/README.md');
    expect(files).not.toContain('main.tf');
  });

  test('backend=none omits backend.tf', () => {
    const out = synth({ backend: { type: 'none' } });
    expect(Object.keys(out)).not.toContain('backend.tf');
  });

  test('enableTerratest scaffolds the Go test module', () => {
    const out = synth({ enableTerratest: true });
    const files = Object.keys(out);
    expect(files).toContain('test/go.mod');
    expect(files).toContain('test/terraform_test.go');
  });

  test('build.yml uses least-privilege permissions and PROJEN_GITHUB_TOKEN', () => {
    const out = synth();
    const build = out['.github/workflows/build.yml'];
    expect(build).toContain('permissions:');
    expect(build).toContain('contents: read');
    expect(build).toContain('secrets.PROJEN_GITHUB_TOKEN');
  });

  test('synthesis is deterministic (idempotent)', () => {
    expect(synth()).toEqual(synth());
  });
});
