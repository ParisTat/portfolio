import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCV } from './useCV';
import { getAllCVFiles, getMostRecentCV } from '../utils/cvDetector';

vi.mock('../utils/cvDetector', () => ({
  getAllCVFiles: vi.fn(),
  getMostRecentCV: vi.fn(),
}));

const cvFile = {
  name: 'CV_2026.pdf',
  path: '/portfolio/assets/documents/CV_2026.pdf',
  lastModified: new Date('2026-01-01'),
};

describe('useCV', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('uses the most recent CV when one is detected', async () => {
    vi.mocked(getAllCVFiles).mockResolvedValue([cvFile]);
    vi.mocked(getMostRecentCV).mockResolvedValue(cvFile);

    const { result } = renderHook(() => useCV());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cvUrl).toBe(cvFile.path);
    expect(result.current.detectedFileName).toBe('CV_2026.pdf');
    expect(result.current.error).toBeNull();
  });

  it('falls back to the first available CV when detection fails', async () => {
    vi.mocked(getAllCVFiles).mockResolvedValue([cvFile]);
    vi.mocked(getMostRecentCV).mockResolvedValue(null);

    const { result } = renderHook(() => useCV());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.cvUrl).toBe(cvFile.path);
    expect(result.current.detectedFileName).toBe('CV_2026.pdf');
  });

  it('reports an error and no URL when no CV exists', async () => {
    vi.mocked(getAllCVFiles).mockResolvedValue([]);
    vi.mocked(getMostRecentCV).mockResolvedValue(null);

    const { result } = renderHook(() => useCV());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(result.current.cvUrl).toBe('');
  });
});
