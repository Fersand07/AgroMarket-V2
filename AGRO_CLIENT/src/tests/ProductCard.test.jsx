import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../components/ProductCard.jsx';

const fakeProduct = {
  _id: 'p1',
  name: 'Tomate Cherry',
  price: 2.5,
  stock: 15,
  image: 'https://example.com/tomate.jpg',
  category: { name: 'Vegetales' },
  measureUnit: { name: 'Lb' },
  description: 'Tomate fresco de temporada',
};

const outOfStockProduct = { ...fakeProduct, stock: 0 };

beforeEach(() => localStorage.clear());

describe('ProductCard component — buyer view', () => {
  it('renders the product name', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Tomate Cherry')).toBeInTheDocument();
  });

  it('renders the product price', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/\$2\.5/)).toBeInTheDocument();
  });

  it('renders the category badge', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Vegetales/i)).toBeInTheDocument();
  });

  it('shows "Agregar al Carrito" button when in stock', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
  });

  it('calls onViewDetails when the button is clicked', () => {
    const handleView = vi.fn();
    render(<ProductCard product={fakeProduct} onViewDetails={handleView} />);
    fireEvent.click(screen.getByRole('button', { name: /agregar al carrito/i }));
    expect(handleView).toHaveBeenCalledWith(fakeProduct);
  });

  it('shows "Sin Stock" and disables button when out of stock', () => {
    render(<ProductCard product={outOfStockProduct} onViewDetails={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /sin stock/i });
    expect(btn).toBeDisabled();
  });
});

describe('ProductCard component — seller view', () => {
  beforeEach(() => localStorage.setItem('role', 'seller'));

  it('shows stock information for sellers', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/Stock: 15 Lb/i)).toBeInTheDocument();
  });

  it('shows "Editar Producto" button for sellers', () => {
    render(<ProductCard product={fakeProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByRole('button', { name: /editar producto/i })).toBeInTheDocument();
  });

  it('shows out-of-stock warning for sellers', () => {
    render(<ProductCard product={outOfStockProduct} onViewDetails={vi.fn()} />);
    expect(screen.getByText(/no tiene stock disponible/i)).toBeInTheDocument();
  });
});
