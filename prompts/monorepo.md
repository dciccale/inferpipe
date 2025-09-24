# inferpipe Monorepo Guide

## Overview

The inferpipe project uses a **Turborepo** monorepo structure to manage multiple applications and shared packages efficiently. This setup allows for:

- **Shared code** between applications
- **Coordinated builds** and deployments  
- **Consistent tooling** across the entire codebase
- **Parallel development** of different parts of the system

## Project Structure

```
inferpipe/
├── apps/                    # Applications (Next.js, mobile, etc.)
│   └── app/                # Main Next.js dashboard app
├── packages/               # Shared packages and libraries
│   └── backend/           # Convex backend package
├── prompts/               # Documentation and project specs
├── package.json          # Root workspace configuration
└── turbo.json            # Turborepo task configuration
```

## Creating New Applications

### Adding a New App

To add a new application (e.g., mobile app, admin dashboard, marketing site):

1. **Create the directory:**
   ```bash
   mkdir apps/admin-dashboard
   cd apps/admin-dashboard
   ```

2. **Initialize the app:**
   ```bash
   # For Next.js app
   npx create-next-app@latest . --typescript --tailwind --app

   # For React Native app  
   npx create-expo-app@latest . --template

   # For vanilla React app
   npx create-react-app . --template typescript
   ```

3. **Update package.json name:**
   ```json
   {
     "name": "admin-dashboard",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "eslint"
     }
   }
   ```

4. **The app is automatically included** due to the `"workspaces": ["apps/*"]` in root package.json.

### Available Apps

- **`apps/app`**: Main inferpipe dashboard (Next.js + React)
- Future apps might include:
  - `apps/marketing`: Marketing website  
  - `apps/admin`: Admin dashboard
  - `apps/mobile`: React Native mobile app

## Creating Shared Packages

### Adding a New Package

Shared packages contain reusable code, utilities, components, or services used across multiple apps.

1. **Create the directory:**
   ```bash
   mkdir packages/ui-components
   cd packages/ui-components
   ```

2. **Create package.json:**
   ```json
   {
     "name": "@packages/ui-components",
     "version": "1.0.0",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch",
       "lint": "eslint src/",
       "clean": "rm -rf dist"
     },
     "dependencies": {
       "react": "^19.1.0"
     },
     "devDependencies": {
       "typescript": "^5",
       "@types/react": "^19"
     },
     "peerDependencies": {
       "react": ">=18.0.0"
     }
   }
   ```

3. **Create src/index.ts:**
   ```typescript
   export { Button } from './Button';
   export { Input } from './Input';
   export type { ButtonProps, InputProps } from './types';
   ```

4. **Create tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext", 
       "moduleResolution": "node",
       "declaration": true,
       "outDir": "dist",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "jsx": "react-jsx"
     },
     "include": ["src/**/*"],
     "exclude": ["dist", "node_modules"]
   }
   ```

### Current Packages

- **`@packages/backend`**: Convex backend with API functions and database schema

### Common Package Types

Create packages for these common use cases:

- **`@packages/ui-components`**: Shared React components
- **`@packages/types`**: TypeScript type definitions
- **`@packages/utils`**: Utility functions and helpers
- **`@packages/config`**: Shared configuration (ESLint, Tailwind, etc.)
- **`@packages/api-client`**: API client for frontend apps
- **`@packages/workflow-engine`**: Core workflow logic

## Importing from Packages

### In Applications

Import shared packages using the package name:

```typescript
// In apps/app/src/components/Dashboard.tsx
import { Button, Input } from '@packages/ui-components';
import { WorkflowStep } from '@packages/types';
import { formatDate } from '@packages/utils';

export function Dashboard() {
  return (
    <div>
      <Button>Create Workflow</Button>
      <Input placeholder="Search workflows..." />
    </div>
  );
}
```

### Install Package Dependencies

Add the package as a dependency in the consuming app:

```json
// In apps/app/package.json
{
  "dependencies": {
    "@packages/ui-components": "*",
    "@packages/types": "*",
    "@packages/utils": "*",
    "react": "19.1.0",
    "next": "15.5.4"
  }
}
```

Then run:
```bash
npm install
```

### Cross-Package Dependencies

Packages can depend on other packages:

```json
// In packages/ui-components/package.json
{
  "dependencies": {
    "@packages/types": "*",
    "@packages/utils": "*"
  }
}
```

## Turborepo Tasks

### Available Commands

Run from the root directory:

```bash
# Development
npm run dev          # Start all apps in dev mode
npm run dev --filter=app  # Start only the main app

# Building
npm run build        # Build all apps and packages
npm run build --filter=@packages/*  # Build only packages

# Linting
npm run lint         # Lint all code
npm run lint --filter=app  # Lint only the main app

# Cleaning
npm run clean        # Clean all build artifacts
```

### Task Configuration

Tasks are defined in `turbo.json`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true  
    },
    "lint": {},
    "clean": {
      "cache": false"
    }
  }
}
```

### Task Dependencies

- **`^build`** means "build all dependencies first"
- **`outputs`** defines what files/folders are generated
- **`cache: false`** disables caching for dev/clean tasks

## Development Workflow

### Starting Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start all apps:**
   ```bash
   npm run dev
   ```

3. **Or start specific apps:**
   ```bash
   npm run dev --filter=app
   npm run dev --filter=@packages/backend
   ```

### Building for Production

1. **Build everything:**
   ```bash
   npm run build
   ```

2. **Build packages first, then apps:**
   ```bash
   npm run build --filter=@packages/*
   npm run build --filter=app
   ```

### Making Changes

1. **Packages**: Changes automatically rebuild and hot-reload in dependent apps
2. **Apps**: Use the app's own hot-reload mechanism (Next.js, Vite, etc.)
3. **Types**: TypeScript will catch cross-package type errors

## Best Practices

### Package Naming

- Use `@packages/` prefix for internal packages
- Use descriptive names: `@packages/ui-components`, not `@packages/ui`
- Keep names lowercase with hyphens

### Dependencies

- **`dependencies`**: Runtime dependencies
- **`devDependencies`**: Build-time dependencies  
- **`peerDependencies`**: Let consuming apps provide the dependency

### Build Order

Packages should build before apps that depend on them:

```json
// In package.json scripts
{
  "build:packages": "turbo run build --filter=@packages/*",
  "build:apps": "turbo run build --filter=apps/*",
  "build": "npm run build:packages && npm run build:apps"
}
```

### TypeScript Configuration

Share TypeScript config using a base config:

```json
// packages/config/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

```json
// apps/app/tsconfig.json
{
  "extends": "@packages/config/tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

## Common Issues & Solutions

### Module Resolution

If imports aren't working:

1. **Check package.json names** match import statements
2. **Install dependencies** in consuming apps
3. **Build packages** before running apps
4. **Check TypeScript paths** in tsconfig.json

### Build Failures

If builds fail:

1. **Clean everything**: `npm run clean`
2. **Reinstall**: `rm -rf node_modules && npm install`
3. **Build packages first**: `npm run build --filter=@packages/*`

### Dependency Conflicts

If you get version conflicts:

1. **Use peerDependencies** for shared dependencies (React, etc.)
2. **Pin versions** in root package.json
3. **Use npm overrides** if needed

---

This monorepo structure supports inferpipe's architecture with the main Next.js app, Convex backend, and future shared packages for UI components, types, and utilities. The setup enables rapid development while maintaining code quality and consistency across the entire platform.
