import { renderBackendTf } from '../src';

describe('renderBackendTf', () => {
  const backend = {
    type: 's3' as const,
    bucket: 'my-state',
    dynamodbTable: 'my-lock',
    region: 'us-west-2',
  };

  test('emits a commented S3 backend template', () => {
    const out = renderBackendTf(backend);
    expect(out).toContain('# backend "s3" {');
    expect(out).toContain('bucket         = "my-state"');
    expect(out).toContain('dynamodb_table = "my-lock"');
    expect(out).toContain('region         = "us-west-2"');
    expect(out).toContain('encrypt        = true');
  });

  test('the backend block is commented out (init-safe)', () => {
    const out = renderBackendTf(backend);
    // every backend line inside terraform{} is a comment
    const inner = out
      .split('\n')
      .filter((l) => l.includes('backend "s3"') || l.includes('bucket'));
    inner.forEach((l) => expect(l.trim().startsWith('#')).toBe(true));
  });
});
