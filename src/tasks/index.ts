import { Project, Task } from 'projen';
import { ResolvedOptions } from '../options';

/**
 * Register the Terraform task graph and return the composite `build` task.
 *
 * Tasks call bare tool binaries assumed present on PATH (installed in CI via
 * setup actions). The `build` task spawns the steps fail-fast in order:
 * fmt(check) → validate → lint → security → docs → test.
 */
export function addTerraformTasks(project: Project, opts: ResolvedOptions): Task {
  // The base Project ships built-in `build`/`test` tasks; replace them so the
  // generated repo's pipeline is Terraform-native, not Node-oriented.
  // Remove `build` first — the built-in `build` depends on `test`.
  project.removeTask('build');
  project.removeTask('test');

  // `terraform validate` requires init; use `-backend=false` to stay offline/fast.
  const fmt = project.addTask('fmt', {
    description: 'Format Terraform files',
    exec: 'terraform fmt -recursive',
  });

  const fmtCheck = project.addTask('fmt:check', {
    description: 'Check Terraform formatting (CI)',
    exec: 'terraform fmt -check -recursive',
  });

  const validate = project.addTask('validate', {
    description: 'Validate Terraform configuration',
    steps: [
      { exec: 'terraform init -backend=false -input=false' },
      { exec: 'terraform validate' },
    ],
  });

  const lint = project.addTask('lint', {
    description: 'Lint Terraform with tflint',
    steps: [{ exec: 'tflint --init' }, { exec: 'tflint --recursive' }],
  });

  const security = project.addTask('security', {
    description: 'Run static security scanners',
  });
  if (opts.securityScanner === 'tfsec' || opts.securityScanner === 'both') {
    security.exec('tfsec .');
  }
  if (opts.securityScanner === 'checkov' || opts.securityScanner === 'both') {
    security.exec('checkov -d . --quiet');
  }

  const docs = project.addTask('docs', {
    description: 'Generate terraform-docs into README',
    exec: 'terraform-docs .',
  });

  const test = project.addTask('test', {
    description: 'Run Terraform tests',
    exec: 'terraform test',
  });
  if (opts.enableTerratest) {
    test.exec('go test ./test/...', { cwd: '.' });
  }

  // Composite build (mirrors `npx projen build` on the CDK repos).
  const build = project.addTask('build', {
    description: 'Full pipeline: fmt-check, validate, lint, security, docs, test',
  });
  build.spawn(fmtCheck);
  build.spawn(validate);
  build.spawn(lint);
  build.spawn(security);
  build.spawn(docs);
  build.spawn(test);

  // `fmt` is not part of build (build only checks), but expose it for local use.
  void fmt;

  return build;
}
