import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Hero from './Hero';

describe('Hero CV download', () => {
  it('links to the bundled cv.pdf and saves it under the configured name', () => {
    render(<Hero />);

    const link = screen.getByRole('link', { name: 'Download CV' });
    expect(link).toHaveAttribute('download', 'Paris_Rafail_Tataridis_CV.pdf');
    expect(link.getAttribute('href')).toMatch(/cv.*\.pdf$/);
  });
});
