import { expect, test } from 'vitest';
import { ApiKeyPool } from '../api-key-pool.js';

test('it throws if initialized with less that 3 keys', () => {
  expect(() => new ApiKeyPool(['foo', 'baz'])).toThrow();
  expect(() => new ApiKeyPool(['foo'])).toThrow();
  expect(() => new ApiKeyPool([])).toThrow();
  expect(() => new ApiKeyPool(['foo', 'baz', 'ball'])).toBeDefined();
});

test('it never repeats api keys', () => {
  const pool = new ApiKeyPool(['foo', 'baz', 'ball']);
  const numIter = 50;
  let prevKey = null;
  for (let i = 0; i< numIter; i++ ) {
    const currkey = pool.getKey();
    expect(currkey).to.not.equal(prevKey);
    prevKey = currkey;
  }
});