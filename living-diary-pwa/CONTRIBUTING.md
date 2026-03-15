# Contributing to Living Diary PWA

Thank you for your interest in contributing to Living Diary PWA! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

### Our Pledge

We strive to:
- Be inclusive and welcoming
- Be respectful and considerate
- Focus on what's best for the community
- Show empathy towards other community members

### Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Personal attacks or insulting language
- Public or private harassment
- Publishing others' private information
- Any other unethical or unprofessional conduct

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn/pnpm
- **Git** for version control
- **GitHub** account for pull requests
- **Code editor** - VS Code recommended

### Initial Setup

```bash
# 1. Fork the repository
# Click "Fork" button on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/living-diary-pwa.git
cd living-diary-pwa

# 3. Install dependencies
npm install

# 4. Create .env file
cp .env.example .env

# 5. Add your API keys to .env
# VITE_PIXAZO_API_KEY=your-key-here

# 6. Start development server
npm run dev

# 7. Open browser to http://localhost:5173
```

### Recommended VS Code Extensions

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript Importer** - Auto-import types
- **Auto Rename Tag** - Rename paired HTML tags
- **Path Intellisense** - Path autocomplete

---

## Development Workflow

### 1. Choose an Issue

Find an issue to work on:
- Browse [open issues](https://github.com/slothitude/living-diary-pwa/issues)
- Look for `good first issue` label
- Comment on the issue to claim it

### 2. Create a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test updates
- `chore/` - Maintenance tasks

### 3. Make Your Changes

```bash
# Edit files
# ...

# Check types
npm run check

# Run tests (when available)
npm test

# Build to verify
npm run build
```

### 4. Commit Your Changes

See [Commit Conventions](#commit-conventions) below.

```bash
git add .
git commit -m "feat: add automatic battle mode"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to the repository on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Click "Create Pull Request"

---

## Coding Standards

### TypeScript Guidelines

#### Use Strict Mode

Always use TypeScript strict mode:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    // ...
  }
}
```

#### Type Safety

**✅ DO:**

```typescript
// Define interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

// Use generics
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

// Type annotations for function returns
function add(a: number, b: number): number {
  return a + b;
}
```

**❌ DON'T:**

```typescript
// Use 'any'
function processData(data: any) {
  return data.map(item => item.value);
}

// Skip return types
function add(a: number, b: number) {
  return a + b;
}
```

#### Type Imports

Use `import type` for type-only imports:

```typescript
// ✅ DO
import type { Creature, Task } from './types';
import { creatureService } from './services';

// ❌ DON'T
import { Creature, Task } from './types';
```

### React Guidelines

#### Functional Components with Hooks

**✅ DO:**

```typescript
import { useState, useEffect } from 'react';

interface Props {
  title: string;
  onSave: (data: string) => void;
}

export function MyComponent({ title, onSave }: Props) {
  const [data, setData] = useState('');

  useEffect(() => {
    // Effect logic
  }, []);

  return <div>{title}</div>;
}
```

**❌ DON'T:**

```typescript
// Class components (avoid)
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.title}</div>;
  }
}
```

#### Component Naming

- Use **PascalCase** for components
- Use **camelCase** for utilities
- Prefix components with filename if ambiguous

```typescript
// ✅ GOOD
export function BattleArena() { }
export function useDamageNumbers() { }
export const formatMessage = () => { };

// ❌ BAD
export function battleArena() { }
export function UseDamageNumbers() { }
```

### CSS/Styling Guidelines

#### Inline Styles

Use inline styles for dynamic values, CSS for static:

```typescript
// ✅ DO
<div style={{ opacity: isVisible ? 1 : 0 }} className="card">
  {/* ... */}
</div>

// CSS file
.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
}
```

#### TailwindCSS

Use utility classes when possible:

```typescript
// ✅ DO
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  {/* ... */}
</div>

// ❌ DON'T
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}}>
```

### File Organization

#### Imports Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 2. Third-party imports
import { useStore } from 'zustand';

// 3. Internal imports (absolute)
import { Button } from '@/components';

// 4. Internal imports (relative)
import { formatMessage } from '../utils';

// 5. Type imports
import type { Creature } from './types';

// 6. CSS imports
import './styles.css';
```

#### Exports

Use named exports:

```typescript
// ✅ DO
export function BattleArena() { }
export type { BattleResult };

// Export all from index
export * from './BattleArena';
export * from './BattleLog';

// ❌ DON'T
export default function BattleArena() { }
```

---

## Testing Guidelines

### Unit Testing

```typescript
// Example test
import { describe, it, expect } from 'vitest';
import { calculateDamage } from './battleService';

describe('Battle Service', () => {
  it('calculates damage correctly', () => {
    const attacker = { attack: 20, defense: 10, speed: 15 };
    const defender = { attack: 15, defense: 15, speed: 10 };
    const move = { power: 30, name: 'Tackle' };

    const damage = calculateDamage(attacker, defender, move);

    expect(damage).toBeGreaterThan(0);
    expect(damage).toBeLessThanOrEqual(100);
  });

  it('handles critical hits', () => {
    // Test with seeded random
    const result = calculateDamage(/* ... */);
    expect(result).toMatchObject({ /* ... */ });
  });
});
```

### Integration Testing

```typescript
// Example integration test
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from './App';

describe('Battle Flow', () => {
  it('completes a battle', async () => {
    render(<App />);

    // Navigate to battle
    fireEvent.click(screen.getByText('Battle'));

    // Wait for battle to complete
    await waitFor(() => {
      expect(screen.getByText('Victory!')).toBeInTheDocument();
    });
  });
});
```

### Testing Checklist

Before submitting PR, ensure:
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed
- [ ] No console errors/warnings

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) format.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(battle): add automatic battle mode"

# Bug fix
git commit -m "fix(chat): prevent duplicate messages"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(services): extract image cache logic"

# Breaking change
git commit -m "feat(api)!: remove deprecated endpoints

BREAKING CHANGE: The old API endpoints have been removed.
Please migrate to v2 endpoints."
```

### Subject Line

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- Don't capitalize first letter
- Don't end with period
- Limit to 72 characters

### Body

- Wrap at 72 characters
- Explain **what** and **why** (not **how**)
- Use bullet points for multiple items

```bash
git commit -m "feat(battle): add critical hit effects

- Add golden damage number for crits
- Add screen flash animation
- Add critical hit sound effect

This makes battles more exciting and gives better
visual feedback for lucky hits."
```

---

## Pull Request Process

### PR Title

Follow commit conventions:

```
feat(battle): add automatic battle mode
fix(chat): prevent duplicate messages
docs(readme): update installation guide
```

### PR Description

Use the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - TypeScript compilation checked
   - Code linting verified

2. **Code Review**
   - Maintainer reviews your code
   - Requests changes if needed
   - Approves when ready

3. **Merge**
   - Squash and merge to main
   - Delete branch after merge

### Addressing Feedback

```bash
# Make requested changes
git checkout feature/your-feature
# ... edit files ...

# Commit changes
git add .
git commit -m "fix: address review feedback"

# Push updates
git push origin feature/your-feature
```

---

## Questions?

- **Issues**: [GitHub Issues](https://github.com/slothitude/living-diary-pwa/issues)
- **Discussions**: [GitHub Discussions](https://github.com/slothitude/living-diary-pwa/discussions)
- **Email**: support@slothitudegames.com

---

**Happy Contributing!** 🎉

---

**Last Updated:** March 15, 2026
