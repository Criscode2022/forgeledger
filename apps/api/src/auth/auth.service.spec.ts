import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const users = {
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(async (x) => ({ id: 'u1', ...x })),
  };
  const jwt = { sign: jest.fn(() => 'token') };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('registers a new user', async () => {
    users.findOne.mockResolvedValue(null);
    const res = await service.register({
      email: 'a@b.com',
      password: 'password1',
      name: 'Ada',
    });
    expect(res.accessToken).toBe('token');
    expect(res.user.email).toBe('a@b.com');
  });

  it('rejects duplicate email', async () => {
    users.findOne.mockResolvedValue({ id: 'x' });
    let err: unknown;
    try {
      await service.register({ email: 'a@b.com', password: 'password1', name: 'Ada' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ConflictException);
  });

  it('logs in with valid password', async () => {
    const passwordHash = await bcrypt.hash('password1', 4);
    users.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      name: 'Ada',
      businessName: 'Ada Co',
      currency: 'USD',
    });
    const res = await service.login({ email: 'a@b.com', password: 'password1' });
    expect(res.accessToken).toBe('token');
  });

  it('rejects bad password', async () => {
    const passwordHash = await bcrypt.hash('password1', 4);
    users.findOne.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      passwordHash,
      name: 'Ada',
      businessName: 'Ada Co',
      currency: 'USD',
    });
    let err: unknown;
    try {
      await service.login({ email: 'a@b.com', password: 'wrongpass' });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(UnauthorizedException);
  });
});
