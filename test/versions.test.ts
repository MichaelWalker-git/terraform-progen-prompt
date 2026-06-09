import { renderVersionsTf, MANAGED_HEADER } from '../src';

describe('renderVersionsTf', () => {
  test('renders required_version and providers', () => {
    const out = renderVersionsTf({
      terraformVersion: '>= 1.6',
      providers: { aws: '~> 5.0' },
    });
    expect(out).toContain(MANAGED_HEADER);
    expect(out).toContain('required_version = ">= 1.6"');
    expect(out).toContain('source  = "hashicorp/aws"');
    expect(out).toContain('version = "~> 5.0"');
  });

  test('supports explicit source via source@version', () => {
    const out = renderVersionsTf({
      terraformVersion: '>= 1.6',
      providers: { random: 'hashicorp/random@~> 3.0' },
    });
    expect(out).toContain('source  = "hashicorp/random"');
    expect(out).toContain('version = "~> 3.0"');
  });

  // PBT (partial, NFR-4): determinism + provider-order independence + idempotency.
  test('property: output is independent of provider key insertion order', () => {
    const a = renderVersionsTf({
      terraformVersion: '>= 1.6',
      providers: { aws: '~> 5.0', random: '~> 3.0', null: '~> 3.2' },
    });
    const b = renderVersionsTf({
      terraformVersion: '>= 1.6',
      providers: { null: '~> 3.2', aws: '~> 5.0', random: '~> 3.0' },
    });
    expect(a).toEqual(b);
  });

  test('property: rendering is idempotent (double render === single)', () => {
    const opts = { terraformVersion: '>= 1.6', providers: { aws: '~> 5.0' } };
    expect(renderVersionsTf(opts)).toEqual(renderVersionsTf(opts));
  });

  test('property: providers always emitted in sorted order', () => {
    const out = renderVersionsTf({
      terraformVersion: '>= 1.6',
      providers: { zzz: '1.0', aaa: '2.0', mmm: '3.0' },
    });
    const idxA = out.indexOf('aaa =');
    const idxM = out.indexOf('mmm =');
    const idxZ = out.indexOf('zzz =');
    expect(idxA).toBeLessThan(idxM);
    expect(idxM).toBeLessThan(idxZ);
  });
});
