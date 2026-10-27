import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordTokenPurpose } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { formatToken, hashSecret } from '../shared/utils/opaque-token.util';
import { PasswordTokenService } from './password-token.service';

const SECRET = 'a-secret';
const record = (overrides = {}) => ({
  id: 'token-1',
  userId: 'user-1',
  purpose: PasswordTokenPurpose.RESET,
  tokenHash: hashSecret(SECRET),
  expiresAt: new Date(Date.now() + 60_000),
  usedAt: null,
  ...overrides,
});

describe('PasswordTokenService', () => {
  let tx: Record<string, Record<string, jest.Mock>>;
  let prisma: Record<string, any>;
  let service: PasswordTokenService;

  beforeEach(() => {
    tx = {
      passwordToken: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      user: { update: jest.fn() },
      refreshToken: { updateMany: jest.fn() },
    };
    prisma = {
      passwordToken: {
        findUnique: jest.fn().mockResolvedValue(record()),
        updateMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'new-token' }),
      },
      $transaction: jest.fn((work: (client: unknown) => unknown) => work(tx)),
    };
    const config = {
      get: (key: string) =>
        ({ PASSWORD_RESET_TTL_MINUTES: 60, INVITE_TTL_HOURS: 72 })[key],
    } as unknown as ConfigService;
    service = new PasswordTokenService(
      prisma as unknown as PrismaService,
      config as never,
    );
  });

  it('invalidates the previous link when issuing a new one', async () => {
    const token = await service.issue('user-1', PasswordTokenPurpose.INVITE);
    expect(prisma.passwordToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        purpose: PasswordTokenPurpose.INVITE,
        usedAt: null,
      },
      data: { usedAt: expect.any(Date) },
    });
    expect(token.startsWith('new-token.')).toBe(true);
    expect(service.ttlMinutes(PasswordTokenPurpose.INVITE)).toBe(72 * 60);
  });

  it('sets the password, burns the token and ends every session', async () => {
    await service.consume(formatToken('token-1', SECRET), 'new-password');
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { passwordHash: expect.any(String) },
    });
    expect(tx.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it.each([
    ['a malformed token', 'garbage', record()],
    ['a wrong secret', formatToken('token-1', 'wrong'), record()],
    [
      'a used token',
      formatToken('token-1', SECRET),
      record({ usedAt: new Date() }),
    ],
    [
      'an expired token',
      formatToken('token-1', SECRET),
      record({ expiresAt: new Date(Date.now() - 1000) }),
    ],
  ])('rejects %s', async (_label, token, stored) => {
    prisma.passwordToken.findUnique.mockResolvedValue(stored);
    await expect(service.consume(token, 'new-password')).rejects.toThrow(
      BadRequestException,
    );
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('lets only one of two concurrent submissions win', async () => {
    tx.passwordToken.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.consume(formatToken('token-1', SECRET), 'new-password'),
    ).rejects.toThrow(BadRequestException);
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
