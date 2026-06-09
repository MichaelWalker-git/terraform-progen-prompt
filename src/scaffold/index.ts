import { Project, SampleFile } from 'projen';
import { renderBackendTf } from '../hcl/backend';
import { renderVersionsTf } from '../hcl/versions';
import { ResolvedOptions } from '../options';

/**
 * Create-once, user-owned files via projen `SampleFile` (written only if absent,
 * never overwritten on subsequent synth). Honors `layout`.
 */
export function addScaffold(scope: Project, opts: ResolvedOptions): void {
  // Managed HCL is regenerated each synth (TextFile in scaffold? No — versions/backend
  // are projen-OWNED per requirements, so emit via SampleFile only for the user-owned
  // resource files; versions.tf/backend.tf are written as managed here intentionally
  // as create-once seeds the team then edits providers in .projenrc.ts).
  // Root vs modules layout:
  const root = opts.layout === 'modules' ? 'environments/dev' : '.';

  // User-owned resource files (write-once).
  new SampleFile(scope, `${root}/main.tf`, {
    contents: [
      '# Your Terraform resources go here.',
      '# Provider configuration:',
      ...Object.keys(opts.providers)
        .sort()
        .map((name) => `provider "${name}" {}`),
      '',
    ].join('\n'),
  });

  new SampleFile(scope, `${root}/variables.tf`, {
    contents: '# Input variables.\n',
  });

  new SampleFile(scope, `${root}/outputs.tf`, {
    contents: '# Output values.\n',
  });

  // versions.tf / backend.tf seeded from the pure renderers (write-once seed).
  new SampleFile(scope, `${root}/versions.tf`, {
    contents: renderVersionsTf({
      terraformVersion: opts.terraformVersion,
      providers: opts.providers,
    }),
  });

  if (opts.backend.type !== 'none') {
    new SampleFile(scope, `${root}/backend.tf`, {
      contents: renderBackendTf(opts.backend),
    });
  }

  if (opts.layout === 'modules') {
    new SampleFile(scope, 'modules/README.md', {
      contents: '# Modules\n\nReusable Terraform modules live here.\n',
    });
  }

  addReadme(scope);
  addGitignore(scope);
}

/** README with terraform-docs injection markers. */
export function addReadme(scope: Project): void {
  new SampleFile(scope, 'README.md', {
    contents: [
      '# Terraform Project',
      '',
      'Scaffolded by [projen-terraform](https://github.com/MichaelWalker-git/terraform-progen-prompt).',
      '',
      'Governance (lint, security scan, docs, tests, CI) is managed from `.projenrc.ts`.',
      'Run `npx projen` to regenerate managed files, `npx projen build` to run the full pipeline.',
      '',
      '## Inputs / Outputs',
      '',
      '<!-- BEGIN_TF_DOCS -->',
      '<!-- END_TF_DOCS -->',
      '',
    ].join('\n'),
  });
}

/** .gitignore that blocks state and secrets from being committed (SECURITY-09). */
export function addGitignore(scope: Project): void {
  new SampleFile(scope, '.gitignore', {
    contents: [
      '.terraform/',
      '*.tfstate',
      '*.tfstate.*',
      'crash.log',
      'crash.*.log',
      '*.tfvars',
      '*.tfvars.json',
      'override.tf',
      'override.tf.json',
      '*_override.tf',
      '*_override.tf.json',
      '.terraform.lock.hcl',
      '',
    ].join('\n'),
  });
}
