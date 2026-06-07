import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../components/Input.jsx';

describe('Input component', () => {
  it('renders with the given placeholder', () => {
    render(<Input placeHolder="Ingresa tu usuario" />);
    expect(screen.getByPlaceholderText('Ingresa tu usuario')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input error="Campo obligatorio" />);
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument();
  });

  it('does not show error paragraph when no error', () => {
    render(<Input />);
    expect(screen.queryByText(/obligatorio/i)).not.toBeInTheDocument();
  });

  it('renders as password type when type="password"', () => {
    render(<Input name="pass" type="password" />);
    expect(document.getElementById('pass')).toHaveAttribute('type', 'password');
  });

  it('calls onChange when user types', () => {
    const handleChange = vi.fn();
    render(<Input name="user" value="" onChange={handleChange} />);
    fireEvent.change(document.getElementById('user'), { target: { value: 'tiopalote' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
