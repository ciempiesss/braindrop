import { describe, it, expect } from 'vitest';
import { normalizeDropDraft, normalizeTags, formatSubcategoryLabel } from '@/lib/dropContent';
import type { DropType } from '@/types';

describe('normalizeTags', () => {
  it('should convert tags to lowercase and deduplicate', () => {
    const result = normalizeTags({
      tags: ['React', 'JavaScript', 'React'],
      type: 'definition' as DropType,
      title: 'Test Title',
      content: 'Test content',
    });
    expect(result).toContain('react');
    expect(result).toContain('javascript');
    const reactCount = result.filter((t) => t === 'react').length;
    expect(reactCount).toBe(1);
  });

  it('should remove empty strings and limit to 10', () => {
    const result = normalizeTags({
      tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
      type: 'definition' as DropType,
      title: 'Test',
      content: 'Test',
    });
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should normalize diacritics', () => {
    const result = normalizeTags({
      tags: ['acción', 'expresión'],
      type: 'definition' as DropType,
      title: 'Test',
      content: 'Test',
    });
    expect(result).toContain('accion');
    expect(result).toContain('expresion');
  });

  it('should replace underscores and spaces with hyphens', () => {
    const result = normalizeTags({
      tags: ['hello world', 'test_example'],
      type: 'definition' as DropType,
      title: 'Test',
      content: 'Test',
    });
    expect(result).toContain('hello-world');
    expect(result).toContain('test-example');
  });

  it('should strip invalid characters', () => {
    const result = normalizeTags({
      tags: ['hello!', 'world@test'],
      type: 'definition' as DropType,
      title: 'Test',
      content: 'Test',
    });
    expect(result).toContain('hello');
    expect(result).toContain('worldtest');
  });
});

describe('normalizeDropDraft', () => {
  it('should clean whitespace from title and content', () => {
    const result = normalizeDropDraft({
      title: '  Hello  World  ',
      content: '  Some   content  ',
      type: 'definition' as DropType,
      tags: [],
    });
    expect(result.title).toBe('Hello World');
    expect(result.content).toBe('Some content');
  });

  it('should normalize tags', () => {
    const result = normalizeDropDraft({
      title: 'Test',
      content: 'Test content',
      type: 'definition' as DropType,
      tags: ['   TESTING', 'Testing'],
    });
    expect(result.tags).toContain('testing');
    expect(result.tags.filter((t) => t === 'testing').length).toBe(1);
  });

  it('should preserve collectionId in returned draft', () => {
    const result = normalizeDropDraft({
      title: 'Test',
      content: 'Test',
      type: 'definition' as DropType,
      tags: [],
      collectionId: 'my-collection',
    });
    expect(result.collectionId).toBe('my-collection');
  });

  it('should preserve the type field', () => {
    const result = normalizeDropDraft({
      title: 'Test',
      content: 'Test',
      type: 'code' as DropType,
      tags: [],
    });
    expect(result.type).toBe('code');
  });
});

describe('formatSubcategoryLabel', () => {
  it('should format hyphenated subcategory', () => {
    expect(formatSubcategoryLabel('unit-testing')).toBe('Unit Testing');
  });

  it('should format single word', () => {
    expect(formatSubcategoryLabel('frontend')).toBe('Frontend');
  });

  it('should handle undefined or falsy by returning "General"', () => {
    expect(formatSubcategoryLabel('')).toBe('General');
    expect(formatSubcategoryLabel()).toBe('General');
  });

  it('should handle multi-segment hyphenated tag', () => {
    expect(formatSubcategoryLabel('economia-politica')).toBe('Economia Politica');
  });
});
