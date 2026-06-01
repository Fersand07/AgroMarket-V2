import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, logout } from '../controllers/auth.controller.js';

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('../database/connectdb.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('../utils/tokenManager.js', () => ({
  generateToken: vi.fn(() => ({ token: 'mock-token', expiresIn: 900 })),
  generateRefreshToken: vi.fn(),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
    genSalt: vi.fn(() => 'salt'),
    hash: vi.fn(() => 'hashed-password'),
  },
}));

import { prisma } from '../database/connectdb.js';
import bcrypt from 'bcryptjs';

// ── Helpers ────────────────────────────────────────────────────────────────
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
}

// ── login ──────────────────────────────────────────────────────────────────
describe('login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const req = { body: { username: 'ghost', password: '123' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('returns 403 when password is incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', username: 'user', password: 'hash', role: 'user' });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { username: 'user', password: 'wrong' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password is incorrect' });
  });

  it('returns 200 with token when credentials are correct', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1', username: 'user', password: 'hash', role: 'user' });
    bcrypt.compare.mockResolvedValue(true);
    const req = { body: { username: 'user', password: 'correct' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'mock-token', message: 'ok' })
    );
  });

  it('returns 500 on unexpected error', async () => {
    prisma.user.findUnique.mockRejectedValue(new Error('DB error'));
    const req = { body: { username: 'user', password: '123' } };
    const res = mockRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── register ───────────────────────────────────────────────────────────────
describe('register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 403 when username is already in use', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);      // phone check
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1' }); // username check
    const req = { body: { username: 'taken', email: 'a@b.com', phone: '1234', password: 'pass', role: 'user' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Username already in use' });
  });

  it('returns 403 when email is already in use', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null); // phone
    prisma.user.findUnique.mockResolvedValueOnce(null); // username
    prisma.user.findUnique.mockResolvedValueOnce({ id: '1' }); // email
    const req = { body: { username: 'new', email: 'used@b.com', phone: '9999', password: 'pass', role: 'user' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
  });

  it('returns 201 when registration is successful', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: '99' });
    const req = { body: { username: 'newuser', email: 'new@b.com', phone: '5555', password: 'pass', role: 'user', lat: '13.7', lng: '-89.2' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Usuario creado' });
  });
});

// ── logout ─────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('clears cookie and returns 200', async () => {
    const req = {};
    const res = mockRes();

    await logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Logout' });
  });
});
