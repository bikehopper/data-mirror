import { createHash } from 'node:crypto';

export const calcChecksum = (buf: Buffer): string => {
  const hasher = createHash('sha256');
  hasher.update(buf);
  return hasher.digest('hex');
};