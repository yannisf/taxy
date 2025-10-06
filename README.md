# Class Management Application

A comprehensive React-based class management system for educational institutions to manage students, guardians, and class information with multilingual support.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development Commands](#development-commands)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Building & Deployment](#building--deployment)
- [Cleaning & Maintenance](#cleaning--maintenance)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

This is a modern web application built with React 19, TypeScript, and Vite for managing classroom information, student records, and guardian details. The application features a responsive Bootstrap-based UI with internationalization support for English and Greek languages.

### Key Technologies

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7.1.7
- **UI Framework**: Bootstrap 5.3.8 + React Bootstrap 2.10.10
- **Database**: Dexie 4.2.0 (IndexedDB wrapper)
- **Routing**: React Router DOM 7.9.3
- **Forms**: React Hook Form 7.64.0
- **Testing**: Vitest 3.2.4 + React Testing Library
- **Internationalization**: i18next 25.5.3
- **Icons**: React Bootstrap Icons
- **PDF Generation**: PDFMake 0.2.20

## ✨ Features

- **Student Management**: Add, edit, view, and manage student records
- **Guardian Management**: Track guardian information and relationships
- **Class Organization**: Create and manage classes with student assignments
- **Address Management**: Comprehensive address tracking for students and guardians
- **Telephone Management**: Multiple phone number support with drag-and-drop sorting
- **Data Import/Export**: JSON-based data import and export functionality
- **PDF Generation**: Generate PDF reports and documents
- **Multilingual Support**: English and Greek language support
- **Responsive Design**: Mobile-friendly Bootstrap-based interface
- **Local Data Storage**: Client-side data persistence using IndexedDB

## 📋 Prerequisites

Before installing and running this application, ensure you have the following installed on your system:

### Required Software

- **Node.js**: Version 18.0.0 or higher
  ```bash
  node --version  # Should be 18.0.0+
  ```

- **npm**: Version 8.0.0 or higher (comes with Node.js)
  ```bash
  npm --version   # Should be 8.0.0+
  ```

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended for development)
- **Disk Space**: At least 1GB free space for dependencies
- **Browser**: Modern browser supporting ES2022 (Chrome 91+, Firefox 90+, Safari 14+, Edge 91+)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd classapp
```

### 2. Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Production dependencies (React, TypeScript, Bootstrap, etc.)
- Development dependencies (Vite, ESLint, testing tools, etc.)

### 3. Verify Installation

Verify that the installation was successful:

```bash
npm list --depth=0
```

You should see all major dependencies listed without any errors.

## 🛠️ Development Commands

### Start Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

- **URL**: http://localhost:5173/
- **Features**: Hot reload, fast refresh, development tools
- **Environment**: Development mode with source maps

### Development Server Options

```bash
# Start with custom port
npm run dev -- --port 3000

# Start with host exposure (for network access)
npm run dev -- --host

# Start with HTTPS
npm run dev -- --https
```

### Stop Development Server

Press `Ctrl+C` (or `Cmd+C` on macOS) in the terminal to stop the server.

## 🧪 Testing

The application uses Vitest as the testing framework with React Testing Library for component testing.

### Run Tests

```bash
# Run tests in watch mode (interactive)
npm run test

# Run tests once and exit
npm run test:run

# Run tests with UI interface
npm run test:ui
```

### Test Coverage

```bash
# Run tests with coverage report
npm run test:run -- --coverage
```

### Test File Patterns

Tests are located in:
- `src/test/` - Unit and integration tests
- Files ending with `.test.ts` or `.test.tsx`

### Writing Tests

Example test structure:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🔍 Code Quality

### Linting

Run ESLint to check code quality and style:

```bash
# Run linter
npm run lint

# Run linter with auto-fix
npm run lint -- --fix
```

### ESLint Configuration

The project uses:
- `@eslint/js` - Core ESLint rules
- `typescript-eslint` - TypeScript-specific rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-react-refresh` - React Fast Refresh rules
- `eslint-config-prettier` - Prettier compatibility

### Code Formatting

Format code using Prettier:

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

### TypeScript Type Checking

Run TypeScript compiler for type checking:

```bash
# Type check without emitting files
npx tsc --noEmit

# Type check with build info
npx tsc -b
```

## 🏗️ Building & Deployment

### Production Build

Create an optimized production build:

```bash
npm run build
```

This command:
1. Runs TypeScript compilation (`tsc -b`)
2. Creates optimized Vite build
3. Outputs files to `dist/` directory

### Build Output

After building, you'll find:
- `dist/index.html` - Main HTML file
- `dist/assets/` - Optimized CSS, JS, and other assets
- Static assets with hashed filenames for caching

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

- **URL**: http://localhost:4173/
- **Purpose**: Test production build before deployment

### Deployment Options

#### Static Hosting (Recommended)
Deploy the `dist/` folder to any static hosting service:
- Netlify, Vercel, GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

#### Server Deployment
For server deployment, serve the `dist/` folder with any web server:
```bash
# Using serve (install globally: npm install -g serve)
serve -s dist

# Using nginx, apache, etc.
```

## 🧹 Cleaning & Maintenance

### Clean Build Artifacts

Remove build outputs and temporary files:

```bash
# Remove build directory
rm -rf dist

# Remove TypeScript build info
rm -rf tsconfig.tsbuildinfo
rm -rf src/**/*.tsbuildinfo
```

### Clean Dependencies

Remove and reinstall all dependencies:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### Clean Application Data

Clear browser-stored application data:

```bash
# Open browser developer tools
# Go to Application tab > Storage
# Clear IndexedDB data for localhost:5173
```

### Clean Everything

Complete project cleanup:

```bash
# Remove all generated files
rm -rf node_modules package-lock.json dist .vite

# Reinstall and rebuild
npm install
npm run build
```

### Cache Management

Clear various caches:

```bash
# Clear npm cache
npm cache clean --force

# Clear Vite cache
rm -rf node_modules/.vite

# Clear TypeScript cache
rm -rf node_modules/.tmp
```

## 📁 Project Structure

```
classapp/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Application assets
│   ├── components/        # React components
│   │   ├── classes/       # Class-related components
│   │   ├── common/        # Reusable components
│   │   ├── guardians/     # Guardian management components
│   │   ├── kids/          # Student management components
│   │   └── layout/        # Layout components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── i18n/             # Internationalization
│   │   └── locales/       # Translation files (en/el)
│   ├── schemas/           # JSON schemas
│   ├── services/          # Business logic services
│   ├── test/              # Test files
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── dist/                  # Production build output
├── node_modules/          # Dependencies
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node.js TypeScript config
├── vite.config.ts         # Vite configuration
└── vitest.config.ts       # Vitest test configuration
```

### Key Files Description

- **`src/main.tsx`**: Application entry point, renders React app
- **`src/App.tsx`**: Main app component with routing
- **`src/services/database.ts`**: Dexie database configuration
- **`src/types/models.ts`**: TypeScript interfaces and types
- **`src/contexts/`**: React context providers for state management
- **`vite.config.ts`**: Vite build tool configuration
- **`vitest.config.ts`**: Test framework configuration

## ⚙️ Configuration

### Vite Configuration

Key Vite settings in `vite.config.ts`:
- React plugin with fast refresh
- Build target: ES2022
- Output directory: `dist/`

### TypeScript Configuration

Three TypeScript configs:
- `tsconfig.json`: Base configuration with project references
- `tsconfig.app.json`: Application-specific settings
- `tsconfig.node.json`: Node.js/build tool settings

### ESLint Configuration

Located in `eslint.config.js`:
- TypeScript rules
- React-specific rules
- Import/export rules
- Code style enforcement

### Testing Configuration

Vitest settings in `vitest.config.ts`:
- jsdom environment for DOM testing
- Global test utilities
- Test setup file: `src/test/setup.ts`

### Environment Variables

Create `.env.local` for local environment variables:
```bash
# Development settings
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
Error: Port 5173 is already in use
```
**Solution**: Use a different port
```bash
npm run dev -- --port 3000
```

#### Out of Memory During Build
```bash
Error: JavaScript heap out of memory
```
**Solution**: Increase Node.js memory limit
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### TypeScript Compilation Errors
```bash
Error: Type 'X' is not assignable to type 'Y'
```
**Solutions**:
1. Check type definitions in `src/types/`
2. Update TypeScript: `npm update typescript`
3. Clear TypeScript cache: `rm -rf node_modules/.tmp`

#### Test Failures
```bash
Test failed: Component not found
```
**Solutions**:
1. Check test setup in `src/test/setup.ts`
2. Verify component imports
3. Run tests individually: `npm run test -- ComponentName`

#### Dependency Issues
```bash
Error: Cannot resolve dependency 'X'
```
**Solutions**:
1. Clear node_modules: `rm -rf node_modules package-lock.json`
2. Fresh install: `npm install`
3. Check for peer dependency warnings

#### Build Failures
```bash
Error: Build failed with X errors
```
**Solutions**:
1. Run type check: `npx tsc --noEmit`
2. Fix linting errors: `npm run lint -- --fix`
3. Clear build cache: `rm -rf dist node_modules/.vite`

### Performance Issues

#### Slow Development Server
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`
- Check for large files in `src/`

#### Large Bundle Size
- Analyze bundle: `npm run build -- --analyze`
- Consider code splitting
- Check for duplicate dependencies

### Browser Compatibility

#### Older Browser Support
- Update browserslist in `package.json`
- Add polyfills if needed
- Test in target browsers

## 🤝 Contributing

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone <your-fork-url>
   cd classapp
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Run Tests**
   ```bash
   npm run test:run
   ```

6. **Lint Code**
   ```bash
   npm run lint -- --fix
   ```

7. **Build and Test**
   ```bash
   npm run build
   npm run preview
   ```

8. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

### Code Standards

- Follow TypeScript strict mode
- Use functional components with hooks
- Follow React best practices
- Write tests for new features
- Maintain internationalization support
- Use semantic commit messages

### Adding New Features

1. Create components in appropriate `src/components/` subdirectory
2. Add TypeScript types in `src/types/`
3. Create corresponding tests in `src/test/`
4. Add translations in `src/i18n/locales/`
5. Update database schema if needed in `src/services/database.ts`

---

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For support and questions, please contact the development team or create an issue in the project repository.

---

**Happy coding! 🚀**
