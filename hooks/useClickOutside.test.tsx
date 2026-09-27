import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useClickOutside } from './useClickOutside';

function ClickOutsideHarness({ onOutside }: { onOutside: () => void }) {
  const ref = useClickOutside<HTMLDivElement>(onOutside);
  return (
    <div>
      <div data-testid="inside" ref={ref}>
        Inside
      </div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe('useClickOutside', () => {
  it('calls the callback on a mousedown outside the referenced element', () => {
    const onOutside = vi.fn();
    render(<ClickOutsideHarness onOutside={onOutside} />);

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback on a mousedown inside the referenced element', () => {
    const onOutside = vi.fn();
    render(<ClickOutsideHarness onOutside={onOutside} />);

    fireEvent.mouseDown(screen.getByTestId('inside'));

    expect(onOutside).not.toHaveBeenCalled();
  });

  it('removes the document listener on unmount', () => {
    const onOutside = vi.fn();
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const { unmount } = render(<ClickOutsideHarness onOutside={onOutside} />);

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    removeSpy.mockRestore();
  });
});
