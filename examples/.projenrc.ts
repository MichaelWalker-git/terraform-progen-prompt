/**
 * Example consumer of projen-terraform. In a real repo this would be the only
 * file you edit; `npx projen` regenerates everything else.
 *
 * Synthesize from this directory with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' .projenrc.ts
 */
import { TerraformProject } from '../src';

const project = new TerraformProject({
  name: 'example-infra',
  outdir: '.',
  providers: {
    aws: '~> 5.0',
    random: '~> 3.0',
  },
  securityScanner: 'both',
  layout: 'single',
  enableTerratest: false,
});

project.synth();
