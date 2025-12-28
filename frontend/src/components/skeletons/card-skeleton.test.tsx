import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardSkeleton } from './card-skeleton';

describe('CardSkeleton', () => {
  it('renders skeleton elements', () => {
    render(<CardSkeleton />);
    
    // Should have skeleton class
    const skeleton = screen.getByTestId('card-skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders multiple skeletons', () => {
    render(
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
    
    const skeletons = screen.getAllByTestId('card-skeleton');
    expect(skeletons).toHaveLength(3);
  });

  it('has proper styling classes', () => {
    render(<CardSkeleton />);
    
    const skeleton = screen.getByTestId('card-skeleton');
    expect(skeleton.className).toContain('bg-white');
    expect(skeleton.className).toContain('rounded-md');
  });
});

