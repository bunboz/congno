import { expect, test } from 'vitest';
import { dmyHm } from './format';

test('dmyHm đổi UTC sang giờ Việt Nam (GMT+7)', () => {
  expect(dmyHm('2026-11-13T09:00:00Z')).toBe('13/11/2026 16:00');
  expect(dmyHm('2026-11-13T18:30:00Z')).toBe('14/11/2026 01:30');
});
