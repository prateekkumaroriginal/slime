# Slime - Chrome Extension Project Rules

## Project Overview
Slime is a Chrome Extension (Manifest V3) for auto-filling forms with custom rules and dynamic values. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Tech Stack
- **Framework**: React 19 with React Compiler (babel-plugin-react-compiler)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **Icons**: lucide-react
- **Drag & Drop**: @dnd-kit
- **Validation**: Zod v4

## Project Structure
```
src/
├── background/        # Service worker (Chrome extension background script)
├── content/          # Content scripts injected into web pages
├── popup/            # Extension popup UI
├── options/          # Options/settings page UI
│   └── components/   # Options-specific components
├── components/       # Shared components
│   └── ui/          # Reusable UI primitives (Button, Card, Input, etc.)
├── lib/             # Utility functions
├── shared/          # Shared types and config
└── storage/         # Chrome storage abstraction layer
```

## Coding Conventions

### TypeScript
- Use explicit type imports: `import type { FillRule } from '@/shared/types'`
- Define types/interfaces in `src/shared/types.ts`
- Use discriminated unions for message types (e.g., `ExtensionMessage`, `FABMessage`)
- Prefer `interface` for object shapes, `type` for unions and primitives

### React Components
- Use function declarations for components: `export default function ComponentName()`
- Props interfaces should be named `{ComponentName}Props`
- Use `@/` path alias for imports
- Colocate component-specific files in their feature folder
- Use `cn()` from `@/lib/cn` for conditional class merging

### UI Components
- UI primitives live in `src/components/ui/`
- **Always use existing UI primitives instead of raw HTML elements:**
  - Use `<Button>` instead of `<button>`
  - Use `<Input>` instead of `<input>`
  - Use `<Card>` instead of `<div>` for card layouts
  - Use `<Select>` instead of `<select>`
  - Use `<Checkbox>` instead of `<input type="checkbox">`
  - Use `<Switch>` instead of custom toggle implementations
- Check `src/components/index.ts` for available primitives before creating new elements
- Follow the existing pattern: variants + sizes via Record types
- Export from `src/components/index.ts` barrel file
- Use Tailwind CSS classes directly, no CSS modules
- Dark theme by default (zinc-950 background, emerald accents)

### State Management
- Use React hooks (useState, useEffect, useRef)
- Async operations use async/await pattern
- Chrome storage operations go through `src/storage/rules.ts`

### Chrome Extension Patterns
- Message types are defined in `src/shared/types.ts`
- Use discriminated unions with `type` field for messages
- Service worker handles cross-context communication
- Content scripts communicate via `chrome.runtime.sendMessage`

### Naming Conventions
- **Files**: kebab-case for utilities, PascalCase for React components
- **Functions**: camelCase, prefixed with `handle` for event handlers
- **Types**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE for true constants, camelCase for config objects

### Styling
- Colors: zinc (grays), emerald (primary/success), red (danger)
- Dark theme: bg-zinc-950 (background), text-zinc-100 (text)
- Rounded corners: rounded-lg (default)
- Transitions: transition-colors (default)
- Spacing: Use Tailwind spacing scale consistently

## Import Order
1. React imports
2. Third-party libraries
3. Type imports (with `type` keyword)
4. Internal absolute imports (@/...)
5. Relative imports

## Don't
- Don't use raw HTML elements when a UI primitive exists (use `<Button>` not `<button>`, etc.)
- Don't use CSS modules or styled-components
- Don't create new utility functions without checking `src/lib/`
- Don't add new dependencies without justification
- Don't use inline styles (use Tailwind classes)
- Don't create global state management libraries (keep it simple with hooks)
- Don't modify Chrome APIs directly in components (use storage abstraction)

## Build & Development
```bash
pnpm dev      # Start dev server
pnpm build    # Build for production (outputs to dist/)
pnpm lint     # Run ESLint
```

After changes, run `pnpm build` and reload the extension in Chrome.
