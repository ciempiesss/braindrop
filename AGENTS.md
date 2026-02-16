# AGENTS.md - Developer Guidelines for BrainDrop

This file provides guidelines for AI agents working on this codebase.

---

## 1. Build, Lint, and Test Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run dev -- --host   # Start with network access

# Build
npm run build           # TypeScript check + Vite build

# Linting
npm run lint            # Run ESLint
npm run lint --fix      # Auto-fix lint issues

# Preview production build
npm run preview
```

**Project Structure:**
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities
├── types/              # TypeScript types
├── data/               # Seed data
└── App.tsx             # Main app
```

---

## 2. Code Style Guidelines

### Imports
- Use **path aliases** (`@/`) for imports:
  ```typescript
  import { cn } from '@/lib/utils';
  import type { Drop } from '@/types';
  ```
- **Group imports** in this order: React → external libs → internal → types
- Use `type` keyword for type-only imports when possible

### TypeScript
- **Strict mode** is enabled - all types must be explicit
- Use **interface** for objects, **type** for unions/aliases
- Enable `strict: true` in tsconfig - no `any` allowed
- Use **discriminated unions** for variant types

### React Patterns
- **Hooks first**: Prefer hooks over class components
- **useMemo/useCallback**: Use for expensive computations only
- **Effects**: Only for synchronizing with external systems (see react-best-practices skill)
- **Context**: Use sparingly; prefer prop drilling for 1-2 levels

### Naming Conventions
- **Components**: PascalCase (`Feed.tsx`, `DropCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useBrainDrop.tsx`)
- **Types/Interfaces**: PascalCase (`Drop`, `Collection`)
- **Constants**: SCREAMING_SNAKE_CASE for config objects
- **Files**: kebab-case for non-component files (`utils.ts`, `seed.ts`)

### Error Handling
- Use **try/catch** with empty catch bodies forbidden:
  ```typescript
  // BAD
  } catch {}
  
  // GOOD
  } catch {
    // log error or handle
  }
  ```
- Never expose API keys in client code
- Validate user input before processing

### CSS/Tailwind
- Use Tailwind v4 with `@theme inline` pattern
- Custom colors via CSS variables in `index.css`
- Use `cn()` utility from `@/lib/utils` for class merging

---

## 3. Data Persistence

### LocalStorage
- Data is stored with automatic versioning via hash
- Keys use prefix `bd_` (e.g., `bd_drops`, `bd_collections`)
- **Do not** manually clear localStorage - versioning handles updates
- User-created drops are merged with seed data automatically

### Types
```typescript
// Main data types
interface Drop {
  id: string;
  title: string;
  content: string;
  type: DropType;
  tags: string[];
  collectionId?: string;
  visualData?: VisualData;  // Rich visual components
  // ... SM-2 algorithm fields
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  color?: string;
  dropCount: number;
  createdAt: string;
}
```

---

## 4. Visual Components

The app supports rich visual components in drops:

```typescript
// Available visual types
type VisualType = 'flow' | 'matrix' | 'code' | 'funnel' | 'pyramid' | 'comparison';

// Example visual data
visualData: {
  type: 'flow',
  nodes: [
    { label: 'Step 1', icon: '📋', color: '#7c3aed', desc: 'Description' }
  ]
}
```

---

## 5. Common Tasks

### Adding a new drop type
1. Add type to `DropType` in `src/types/index.ts`
2. Add config to `DROP_TYPE_CONFIG`
3. Add styles to `typeStyles` in `DropCard.tsx`

### Adding a new component
1. Create file in `src/components/`
2. Export as named export
3. Import in `App.tsx` or parent component
4. Use `cn()` for conditional classes

### Running specific tasks
- **Add dependency**: `npm install <package>`
- **Add dev dependency**: `npm install -D <package>`
- **TypeScript check**: `tsc -b`

---

## 6. Important Notes

- **No tests** currently configured - adding tests is a priority
- **API keys** should never be committed (use environment variables)
- **Build must pass** before merging (`npm run build`)
- **Lint should pass** with no errors (`npm run lint`)
- **Preview HTML** files are for prototyping only, not production

---

## 7. Skills Available

When working on specific areas, load these skills:
- `react-best-practices` - React patterns and anti-patterns
- `typescript-best-practices` - TypeScript patterns
- `tailwindcss-framework-integration` - Tailwind v4
- `frontend-design` - UI/UX improvements

---

Generated: 2026-02-13
