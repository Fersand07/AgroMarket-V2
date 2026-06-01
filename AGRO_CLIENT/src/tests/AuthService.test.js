import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loginService, registerService } from '../services/AuthService.js';

// ── Mock import.meta.env ───────────────────────────────────────────────────
vi.stubGlobal('import', {
  meta: { env: { VITE_API_BASE_URL: 'http://localhost:3000/api/v1' } },
});

// ── Mock fetch ─────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
beforeEach(() => { global.fetch = mockFetch; });
afterEach(() => vi.clearAllMocks());

describe('loginService', () => {
  it('returns data on successful login', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'jwt-token', expiresIn: 900, message: 'ok' }),
    });

    const data = await loginService('tiopalote', 'Tiopalote123@');
    expect(data.token).toBe('jwt-token');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws an error when login fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'User not found' }),
    });

    await expect(loginService('ghost', 'wrong')).rejects.toThrow('User not found');
  });
});

describe('registerService', () => {
  it('returns success message on valid registration', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Usuario creado' }),
    });

    const data = await registerService('newuser', 'new@mail.com', 'San Salvador', '7000-0000', 'Pass123@', 13.7, -89.2, 'user');
    expect(data.message).toBe('Usuario creado');
  });

  it('throws when username is already in use', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Username already in use' }),
    });

    await expect(
      registerService('taken', 'a@b.com', '', '', 'pass', 0, 0, 'user')
    ).rejects.toThrow('Username already in use');
  });
});
