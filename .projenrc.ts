import { typescript } from 'projen';
import { NodePackageManager } from 'projen/lib/javascript';

/**
 * projen-terraform builds itself with projen — same single-source-of-truth model
 * we are porting to Terraform.
 */
const project = new typescript.TypeScriptProject({
  name: 'projen-terraform',
  description:
    'A projen project type that scaffolds governed raw-HCL Terraform repositories — ' +
    'porting linting, security scanning, docs, tests and the GitHub Actions trio from projen CDK-TypeScript.',
  defaultReleaseBranch: 'master',
  packageManager: NodePackageManager.NPM,
  projenrcTs: true,
  minNodeVersion: '20.0.0',

  deps: ['projen', 'constructs'],
  peerDeps: ['projen', 'constructs'],
  devDeps: ['projen', 'constructs'],

  // The package is a library consumed via `npx projen new --from projen-terraform`.
  releaseToNpm: false,

  // We manage our own LICENSE (MIT-0) + NOTICE; don't let projen overwrite it.
  licensed: false,

  tsconfig: {
    compilerOptions: {
      lib: ['ES2022'],
      target: 'ES2022',
      skipLibCheck: true,
    },
  },

  jestOptions: {
    jestConfig: {
      testPathIgnorePatterns: ['/node_modules/', '/examples/', '/lib/'],
    },
  },

  gitignore: [
    '*.tgz',
    '.DS_Store',
    // Upstream AI-DLC clone is reference-only — never commit it.
    '.aidlc-source/',
  ],
});

// Keep the AI-DLC workspace + vendored rules out of the npm tarball.
project.npmignore?.addPatterns(
  'aidlc-docs/',
  '.aidlc-rule-details/',
  '.aidlc-source/',
  'inputs/',
  'examples/',
);

project.synth();
