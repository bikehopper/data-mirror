import { expect, test } from 'vitest';
import ControlablePromise from '../controlable-promise.js';

test('it resolves', async () => {
  const p = new ControlablePromise<void>();
  setTimeout(() => p.resolve(), 100);
  expect(p.inFlight).toBe(true);
  await p.nativePromise();
  expect(p.inFlight).toBe(false);
});

test('it rejects', async () => {
  const p = new ControlablePromise<void>();
  setTimeout(() => p.reject(), 100);
  expect(p.inFlight).toBe(true);
  await expect(p.nativePromise()).rejects.toThrow();
  expect(p.inFlight).toBe(false);
});