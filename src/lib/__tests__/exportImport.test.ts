import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportData, importData } from '@/lib/exportImport';
import type { Drop, Collection } from '@/types';

function makeDrop(overrides: Partial<Drop> = {}): Drop {
  return {
    id: 'test-id',
    title: 'Test',
    content: 'Content',
    type: 'definition',
    tags: ['test'],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    interval: 1,
    repetitionCount: 0,
    easeFactor: 2.5,
    nextReviewDate: '2025-01-01T00:00:00.000Z',
    status: 'new',
    ...overrides,
  };
}

function makeCollection(overrides: Partial<Collection> = {}): Collection {
  return {
    id: 'col-1',
    name: 'Test Collection',
    createdAt: '2025-01-01T00:00:00.000Z',
    dropCount: 0,
    ...overrides,
  };
}

describe('exportData', () => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  it('should create a downloadable JSON file', () => {
    const drops = [makeDrop()];
    const collections = [makeCollection()];

    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);

    exportData(drops, collections);

    expect(mockAnchor.download).toMatch(/braindrop-backup-.*\.json/);
    expect(mockAnchor.click).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should handle empty arrays', () => {
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn(),
      setAttribute: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);

    exportData([], []);

    expect(mockAnchor.download).toMatch(/braindrop-backup-.*\.json/);
    expect(mockAnchor.click).toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});

describe('importData', () => {
  it('should parse valid JSON file', async () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      drops: [makeDrop()],
      collections: [makeCollection()],
    };

    const file = new File([JSON.stringify(data)], 'backup.json', { type: 'application/json' });
    const result = await importData(file);

    expect(result.drops).toHaveLength(1);
    expect(result.collections).toHaveLength(1);
  });

  it('should reject invalid JSON', async () => {
    const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });
    await expect(importData(file)).rejects.toThrow('JSON inválido');
  });

  it('should reject file with missing drops', async () => {
    const file = new File(
      [JSON.stringify({ version: 1, collections: [] })],
      'incomplete.json',
      { type: 'application/json' }
    );
    await expect(importData(file)).rejects.toThrow('Formato inválido');
  });

  it('should reject file with missing collections', async () => {
    const file = new File(
      [JSON.stringify({ version: 1, drops: [] })],
      'incomplete.json',
      { type: 'application/json' }
    );
    await expect(importData(file)).rejects.toThrow('Formato inválido');
  });
});
