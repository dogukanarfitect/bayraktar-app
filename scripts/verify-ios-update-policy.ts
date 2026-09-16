import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareAppVersions,
  evaluateIosUpdate,
  isValidStoreUrl,
  parseAppVersion,
  parseIosUpdatePolicy,
  resolvePolicyFromSources,
  type IosUpdatePolicy,
} from '../src/update/iosUpdatePolicy.ts';

function policy(overrides: Partial<IosUpdatePolicy> = {}): IosUpdatePolicy {
  return {
    enabled: true,
    latestVersion: '1.2.0',
    minimumSupportedVersion: '1.1.0',
    forceUpdateEnabled: true,
    optionalUpdateEnabled: true,
    storeUrl: 'https://testflight.apple.com/join/example',
    title: 'Yeni sürüm hazır',
    message: 'Uygulamayı güncelle.',
    ...overrides,
  };
}

for (const [current, expected] of [
  ['1.0.0', 'force'], ['1.1.0', 'optional'], ['1.1.9', 'optional'],
  ['1.2.0', 'none'], ['1.10.0', 'none'], ['2.0.0', 'none'],
] as const) {
  test(`installed version ${current} yields ${expected}`, () => {
    assert.equal(evaluateIosUpdate(policy(), current, true).kind, expected);
  });
}

for (const [left, right, expected] of [
  ['1.9.0', '1.10.0', -1], ['1.10.0', '1.9.0', 1],
  ['1.0.9', '1.0.10', -1], ['2.0.0', '1.99.99', 1],
  ['1.2.0', '1.2.0', 0], [' 1.2.0 ', '1.2.0', 0],
] as const) {
  test(`compares ${left} to ${right} numerically`, () => {
    assert.equal(compareAppVersions(left, right), expected);
  });
}

test('release versions require three safe numeric components', () => {
  for (const invalid of [null, undefined, 1.2, '', '1', '1.2', '1.2.3.4', '-1.0.0',
    'v1.0.0', '1.0.0-beta', '1.0.0+2', '01.2.0', '1.x.0', '9007199254740992.0.0']) {
    assert.equal(parseAppVersion(invalid), null, String(invalid));
    for (const field of ['latestVersion', 'minimumSupportedVersion']) {
      assert.equal(parseIosUpdatePolicy(JSON.stringify({ ...policy(), [field]: invalid })).ok, false);
    }
  }
  assert.equal(parseAppVersion(' 1.2.3 '), '1.2.3');
  assert.equal(parseAppVersion('0.0.0'), '0.0.0');
  assert.equal(compareAppVersions('invalid', '1.0.0'), null);
  assert.equal(evaluateIosUpdate(policy(), 'invalid', true).reason, 'unreadable_native_version');
});

test('minimum version cannot exceed latest, using numeric comparison', () => {
  assert.deepEqual(parseIosUpdatePolicy(JSON.stringify(policy({
    latestVersion: '1.9.0', minimumSupportedVersion: '1.10.0',
  }))), { ok: false, reason: 'min_gt_latest' });
  assert.equal(parseIosUpdatePolicy(JSON.stringify(policy({
    latestVersion: '1.10.0', minimumSupportedVersion: '1.9.0',
  }))).ok, true);
});

test('disabled policy overrides force and optional flags', () => {
  assert.equal(evaluateIosUpdate(policy({ enabled: false }), '1.0.0', true).kind, 'none');
});

test('minimal kill switch replaces and persists over a previous force rule', () => {
  const resolved = resolvePolicyFromSources({
    activatedRaw: '{"enabled":false}', activatedSource: 'remote',
    lastValid: policy(), fetchFailed: false,
  });
  assert.equal(resolved.policy?.enabled, false);
  assert.deepEqual(resolved.persistPolicy, resolved.policy);
  assert.equal(evaluateIosUpdate(resolved.policy!, '1.0.0', true).kind, 'none');
});

test('optional and force flags work independently, with force taking priority', () => {
  assert.equal(evaluateIosUpdate(policy({ forceUpdateEnabled: false }), '1.0.0', true).kind, 'optional');
  assert.equal(evaluateIosUpdate(policy({ optionalUpdateEnabled: false }), '1.0.0', true).kind, 'force');
  assert.equal(evaluateIosUpdate(policy({ optionalUpdateEnabled: false }), '1.1.0', true).kind, 'none');
  assert.equal(evaluateIosUpdate(policy({ forceUpdateEnabled: false, optionalUpdateEnabled: false }), '1.0.0', true).kind, 'none');
});

test('build fields have no effect when versions are equal', () => {
  const parsed = parseIosUpdatePolicy(JSON.stringify({
    ...policy(), latestBuild: 9999, minimumSupportedBuild: 9999,
  }));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error(parsed.reason);
  assert.equal('latestBuild' in parsed.policy, false);
  assert.equal('minimumSupportedBuild' in parsed.policy, false);
  assert.equal(evaluateIosUpdate(parsed.policy, '1.2.0', true).kind, 'none');
});

test('legacy build-only rules are not interpreted as version rules', () => {
  const { minimumSupportedVersion, ...rest } = policy();
  const raw = JSON.stringify({ ...rest, latestBuild: 2, minimumSupportedBuild: 2 });
  assert.deepEqual(parseIosUpdatePolicy(raw), { ok: false, reason: 'invalid_version' });
  const resolved = resolvePolicyFromSources({ activatedRaw: raw, activatedSource: 'remote', lastValid: null, fetchFailed: false });
  assert.equal(resolved.policy, null);
  assert.equal(resolved.persistPolicy, null);
});

test('presentation text is optional and version strings are normalized', () => {
  const { title, message, ...minimal } = policy();
  const parsed = parseIosUpdatePolicy(JSON.stringify({ ...minimal, latestVersion: ' 1.2.0 ' }));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw new Error(parsed.reason);
  assert.equal(parsed.policy.title, '');
  assert.equal(parsed.policy.message, '');
  assert.equal(parsed.policy.latestVersion, '1.2.0');
});

test('malformed JSON and fields are rejected', () => {
  for (const raw of ['', '{broken', 'null', '[]', '{"enabled":"false"}', '{"enabled":true}']) {
    assert.equal(parseIosUpdatePolicy(raw).ok, false);
  }
  for (const field of ['enabled', 'forceUpdateEnabled', 'optionalUpdateEnabled', 'storeUrl', 'title', 'message']) {
    assert.equal(parseIosUpdatePolicy(JSON.stringify({ ...policy(), [field]: 42 })).ok, false);
  }
});

test('empty and invalid store URLs never lock or prompt', () => {
  for (const url of ['', 'javascript:alert(1)', 'http://example.com']) {
    for (const current of ['1.0.0', '1.1.0']) {
      assert.equal(evaluateIosUpdate(policy({ storeUrl: url }), current, isValidStoreUrl(url)).kind, 'none');
    }
  }
  assert.equal(isValidStoreUrl('https://testflight.apple.com/join/example'), true);
  assert.equal(isValidStoreUrl('https://apps.apple.com/app/id123'), true);
});

test('offline start retains force rule but an installed newer version clears it', () => {
  const lastValid = policy();
  const resolved = resolvePolicyFromSources({ activatedRaw: null, lastValid, fetchFailed: true });
  assert.deepEqual(resolved.policy, lastValid);
  assert.equal(resolved.persistPolicy, null);
  assert.equal(evaluateIosUpdate(resolved.policy!, '1.0.0', true).kind, 'force');
  assert.equal(evaluateIosUpdate(resolved.policy!, '1.2.0', true).kind, 'none');
});

test('fetch failure without cached policy does not lock', () => {
  const resolved = resolvePolicyFromSources({ activatedRaw: null, lastValid: null, fetchFailed: true });
  assert.equal(resolved.policy, null);
  assert.equal(resolved.persistPolicy, null);
});

test('invalid published versions preserve the last valid cached policy', () => {
  const lastValid = policy();
  const resolved = resolvePolicyFromSources({
    activatedRaw: JSON.stringify(policy({ latestVersion: 'broken' })),
    activatedSource: 'remote', lastValid, fetchFailed: false,
  });
  assert.deepEqual(resolved.policy, lastValid);
  assert.equal(resolved.persistPolicy, null);
});

test('only valid remote policies are persisted', () => {
  for (const source of ['remote', 'default', 'static'] as const) {
    const resolved = resolvePolicyFromSources({
      activatedRaw: JSON.stringify(policy()), activatedSource: source, lastValid: null, fetchFailed: false,
    });
    assert.deepEqual(resolved.policy, policy());
    assert.deepEqual(resolved.persistPolicy, source === 'remote' ? policy() : null);
  }
});
