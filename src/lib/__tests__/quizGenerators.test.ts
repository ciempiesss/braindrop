import { describe, it, expect } from 'vitest';
import {
  generateMultipleChoice,
  generateTrueFalse,
  generateFillBlank,
  generateFlashcard,
  generateLocalQuestion,
} from '@/lib/quizGenerators';
import type { Drop, DropType, Difficulty } from '@/types';

function makeDrop(overrides: Partial<Drop> = {}): Drop {
  return {
    id: 'drop-1',
    title: 'React State Management',
    content: 'React state management refers to how components store and update data. It involves useState, useReducer, and context.',
    type: 'definition' as DropType,
    tags: ['react', 'state'],
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

function makeDrops(count: number): Drop[] {
  return Array.from({ length: count }, (_, i) =>
    makeDrop({ id: `drop-${i}`, title: `Drop ${i} Title`, type: 'definition' as DropType })
  );
}

describe('generateMultipleChoice', () => {
  it('should return 4 options', () => {
    const result = generateMultipleChoice(makeDrop(), makeDrops(10), 'medio');
    expect(result.options).toHaveLength(4);
  });

  it('should include the drop title as an option', () => {
    const drop = makeDrop({ title: 'React State Management' });
    const result = generateMultipleChoice(drop, makeDrops(10), 'medio');
    expect(result.options).toContain('React State Management');
    expect(result.options[result.correctIndex!]).toBe('React State Management');
  });

  it('should return a question string', () => {
    const result = generateMultipleChoice(makeDrop(), makeDrops(10), 'facil');
    expect(result.question).toBeTruthy();
    expect(typeof result.question).toBe('string');
  });

  it('should support all difficulty levels', () => {
    const difficulties: Difficulty[] = ['facil', 'medio', 'dificil'];
    for (const diff of difficulties) {
      const result = generateMultipleChoice(makeDrop(), makeDrops(10), diff);
      expect(result.options).toHaveLength(4);
      expect(result.correctIndex).toBeGreaterThanOrEqual(0);
      expect(result.correctIndex).toBeLessThan(4);
    }
  });

  it('should return correct type', () => {
    const result = generateMultipleChoice(makeDrop(), makeDrops(10), 'medio');
    expect(result.type).toBe('multiple-choice');
  });

  it('should include explanation', () => {
    const result = generateMultipleChoice(makeDrop(), makeDrops(10), 'medio');
    expect(result.explanation).toBeTruthy();
  });
});

describe('generateTrueFalse', () => {
  it('should return a question with isTrue property', () => {
    const result = generateTrueFalse(makeDrop(), 'medio');
    expect(result.question).toBeTruthy();
    expect(typeof result.isTrue).toBe('boolean');
  });

  it('should return correct type', () => {
    const result = generateTrueFalse(makeDrop(), 'facil');
    expect(result.type).toBe('true-false');
  });

  it('should detect refutation patterns in content', () => {
    const drop = makeDrop({
      content:
        'No es cierto que React sea lento. React uses a virtual DOM. La intuición dice que el DOM real es más rápido.',
    });
    const result = generateTrueFalse(drop, 'medio');
    expect(result.question).toBeTruthy();
    expect(typeof result.isTrue).toBe('boolean');
  });

  it('should handle facil difficulty', () => {
    const result = generateTrueFalse(makeDrop(), 'facil');
    expect(result.question).toContain('¿Verdadero o falso?');
  });

  it('should handle dificil difficulty', () => {
    const result = generateTrueFalse(makeDrop(), 'dificil');
    expect(result.question).toContain('¿Verdadero o falso?');
  });
});

describe('generateFillBlank', () => {
  it('should return a blank sentence', () => {
    const drop = makeDrop({ title: 'React', content: 'React is a library for building user interfaces.' });
    const result = generateFillBlank(drop, makeDrops(10), 'medio');
    expect(result.blankSentence).toBeTruthy();
    expect(result.blankWord).toBeTruthy();
  });

  it('should return blank options', () => {
    const drop = makeDrop({ title: 'React', content: 'React is a JavaScript library.' });
    const result = generateFillBlank(drop, makeDrops(10), 'facil');
    expect(result.blankOptions).toBeTruthy();
    expect(result.blankOptions!.length).toBeGreaterThan(0);
  });

  it('should return correct type', () => {
    const result = generateFillBlank(makeDrop(), makeDrops(10), 'medio');
    expect(result.type).toBe('fill-blank');
  });

  it('should contain the correct word in blankOptions', () => {
    const drop = makeDrop({ title: 'React', content: 'React is a library for building UIs.' });
    const result = generateFillBlank(drop, makeDrops(10), 'facil');
    if (result.blankOptions && result.correctIndex !== undefined) {
      expect(result.blankOptions[result.correctIndex]).toBeTruthy();
    }
  });
});

describe('generateFlashcard', () => {
  it('should return question and answer', () => {
    const result = generateFlashcard(makeDrop(), 'medio');
    expect(result.question).toBeTruthy();
    expect(result.answer).toBeTruthy();
  });

  it('should return correct type', () => {
    const result = generateFlashcard(makeDrop(), 'facil');
    expect(result.type).toBe('flashcard');
  });

  it('should include explanation', () => {
    const result = generateFlashcard(makeDrop(), 'medio');
    expect(result.explanation).toBeTruthy();
  });

  it('should handle facil difficulty with full content as answer', () => {
    const content = 'React uses a virtual DOM. The virtual DOM is a lightweight copy of the actual DOM.';
    const drop = makeDrop({ content });
    const result = generateFlashcard(drop, 'facil');
    expect(result.answer).toBe(content);
  });
});

describe('generateLocalQuestion', () => {
  it('should produce a valid question for each drop type', () => {
    const types: DropType[] = ['definition', 'ruptura', 'puente', 'operativo', 'code'];
    for (const type of types) {
      const drop = makeDrop({ type });
      const result = generateLocalQuestion(drop, makeDrops(10), 'medio');
      expect(result.question).toBeTruthy();
      expect(result.answer).toBeTruthy();
      expect(['multiple-choice', 'true-false', 'fill-blank', 'flashcard']).toContain(result.type);
    }
  });
});
