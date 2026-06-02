import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, generateRefreshToken } from '../utils/tokenManager.js';
import jwt from 'jsonwebtoken';

const SECRET = 'test_secret';
const REFRESH = 'test_refresh';

beforeEach(() => {
  process.env.SECRET_KEY = SECRET;
  process.env.REFRESH_KEY = REFRESH;
});

describe('generateToken', () => {
  it('returns a signed JWT and expiresIn value', () => {
    const { token, expiresIn } = generateToken('user-1', 'user', 'testuser');

    expect(token).toBeTruthy();
    expect(expiresIn).toBe(900); // 60 * 15

    const decoded = jwt.verify(token, SECRET);
    expect(decoded.id).toBe('user-1');
    expect(decoded.role).toBe('user');
    expect(decoded.username).toBe('testuser');
  });
});

describe('generateRefreshToken', () => {
  it('signs a refresh token and sets the cookie', () => {
    const cookieCalls = [];
    const res = { cookie: (...args) => cookieCalls.push(args) };

    const token = generateRefreshToken('user-1', 'user', 'testuser', res);

    expect(token).toBeTruthy();
    expect(cookieCalls).toHaveLength(1);
    expect(cookieCalls[0][0]).toBe('refreshToken');

    const decoded = jwt.verify(token, REFRESH);
    expect(decoded.id).toBe('user-1');
  });
});
