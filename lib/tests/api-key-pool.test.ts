import { expect, test, afterEach, vi } from 'vitest';
import { ApiKeyPool } from '../api-key-pool.js';

afterEach(() => {
  vi.restoreAllMocks(); // Restores Math.random() to its original state
})

test('it throws if initialized with less than 6 keys', () => {
  expect(() => new ApiKeyPool(['foo', 'baz'])).toThrow();
  expect(() => new ApiKeyPool(['foo'])).toThrow();
  expect(() => new ApiKeyPool([])).toThrow();
  expect(() => new ApiKeyPool(['foo', 'baz', 'ball'])).toThrow();
  expect(() => new ApiKeyPool(['foo', 'baz', 'ball', 'stumps', 'bails', 'buzz'])).toBeDefined();
});

test('it never repeats api keys', () => {
  const pool = new ApiKeyPool(['foo', 'baz', 'ball', 'stumps', 'bails', 'buzz']);
  const numIter = 50;
  let prevKey = null;
  for (let i = 0; i< numIter; i++ ) {
    const currkey = pool.getKey();
    expect(currkey).to.not.equal(prevKey);
    prevKey = currkey;
  }
});

test('snapshot test', () => {
  const pool = new ApiKeyPool(['foo', 'baz', 'ball', 'stumps', 'bails', 'buzz']);
  vi.spyOn(Math, 'random')
    .mockReturnValueOnce(0.1)
    .mockReturnValueOnce(0.9)
    .mockReturnValueOnce(0.1)
    .mockReturnValueOnce(0.3)
    .mockReturnValueOnce(0.4)
    .mockReturnValueOnce(0.2)
    .mockReturnValueOnce(0.04)
    .mockReturnValueOnce(0.8)
    .mockReturnValueOnce(0.6);

  expect(pool.getKey()).toMatchInlineSnapshot(`"baz"`);
  expect(pool.getKey()).toMatchInlineSnapshot(`"buzz"`);
  expect(pool.getKey()).toMatchInlineSnapshot(`"ball"`);
  expect(pool.getKey()).toMatchInlineSnapshot(`"foo"`);
  expect(pool.getKey()).toMatchInlineSnapshot(`"bails"`);
});