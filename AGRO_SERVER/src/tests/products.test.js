import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllProducts as getProducts, getProductById } from '../controllers/products.controller.js';

vi.mock('../database/connectdb.js', () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn(() => ({ id: 'user-1' })) },
}));

import { prisma } from '../database/connectdb.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

const fakeProduct = {
  id: 'p1', name: 'Tomate', description: 'Fresco', price: 1.5,
  quantity: 1, image: 'img.jpg', stock: 20,
  category: { id: 'c1', name: 'Vegetales', image: '' },
  measureUnit: { id: 'm1', name: 'Lb' },
  userId: 'user-1',
};

describe('getProducts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with product list', async () => {
    prisma.product.findMany.mockResolvedValue([fakeProduct]);
    const req = { query: {} };
    const res = mockRes();

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products[0].name).toBe('Tomate');
  });

  it('returns 500 on DB error', async () => {
    prisma.product.findMany.mockRejectedValue(new Error('DB fail'));
    const req = { query: {} };
    const res = mockRes();

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getProductById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 with the product when found', async () => {
    prisma.product.findUnique.mockResolvedValue(fakeProduct);
    const req = { params: { id: 'p1' } };
    const res = mockRes();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.product.name).toBe('Tomate');
  });

  it('returns 404 when product is not found', async () => {
    prisma.product.findUnique.mockResolvedValue(null);
    const req = { params: { id: 'nonexistent' } };
    const res = mockRes();

    await getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
