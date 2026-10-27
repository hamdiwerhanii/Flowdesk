import {
  formatToken,
  generateSecret,
  hashSecret,
  parseToken,
  secretMatches,
} from './opaque-token.util';

describe('opaque token utils', () => {
  it('round-trips id and secret', () => {
    const secret = generateSecret();
    const token = formatToken('record-id', secret);
    expect(parseToken(token)).toEqual({ id: 'record-id', secret });
  });

  it('rejects malformed tokens', () => {
    expect(parseToken(undefined)).toBeNull();
    expect(parseToken('no-separator')).toBeNull();
    expect(parseToken('.secret-only')).toBeNull();
    expect(parseToken('id-only.')).toBeNull();
  });

  it('matches only the secret that produced the hash', () => {
    const secret = generateSecret();
    const hash = hashSecret(secret);
    expect(secretMatches(secret, hash)).toBe(true);
    expect(secretMatches(generateSecret(), hash)).toBe(false);
  });
});
