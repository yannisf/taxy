# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entaxy is a React-based class management system for educational institutions. It manages students (referred to as "kids"), guardians, and class information with multilingual support (English/Greek). The application runs entirely client-side using IndexedDB for local data persistence.

**Key Stack:**
- React + TypeScript
- Vite (build tool)
- Dexie (IndexedDB wrapper)
- Bootstrap + React Bootstrap + react-bootstrap-icons
- React Router DOM
- i18next for internationalization
- Vitest + React Testing Library
- uuid for ID generation
- date-fns for date formatting
- react-datepicker for date input controls
- pdfmake for PDF generation
- react-error-boundary for error handling

## Development Commands

```bash
# Development
npm run dev              # Start dev server at http://localhost:5173

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once and exit

# Code Quality
npm run lint            # Run ESLint
npm run lint -- --fix   # Auto-fix linting issues
npx tsc -b               # Type check without emitting files (root tsconfig.json only has project references, so plain `tsc --noEmit` silently checks nothing — always use `-b`)

# Build & Preview
npm run build           # Build for production (outputs to dist/)
npm run preview         # Preview production build at http://localhost:4173
```

## Architecture & Data Model

### Database Layer (IndexedDB via Dexie)

The application uses `ClassManagementDatabase` defined in `src/services/database.ts`. The database schema has evolved through migrations:

- **v1**: Original kids table
- **v2**: Added timestamps (created_at, updated_at)
- **v3**: Added classes table (kid_ids array on Class)
- **v4**: Added `class_id` to Kid; relationship is now a kid→class foreign key instead of the class's kid_ids array

**Tables:**
- `kids`: Student records with guardians, addresses, telephones
- `classes`: Class definitions with kid_ids arrays (many-to-many relationship)

**Key Database Methods:**
- Kid CRUD: `addKid()`, `getKids()`, `getKidById()`, `updateKid()`, `deleteKid()`
- Class CRUD: `addClass()`, `getClasses()`, `getClassById()`, `updateClass()`, `deleteClass()`
- Class-Kid operations: `addKidToClass()`, `removeKidFromClass()`, `getKidsByClassId()`
- Import/Export: `exportClassData()`, `mergeKidsToClass()`, `mergeKids()`

### Data Models (src/types/models.ts)

**Core Types:**
- `Kid`: Student record with personal info, guardians, addresses, notes
- `Guardian`: Guardian information including relation, contact details
- `Class`: Class definition (school_name, class_name, school_year, kid_ids)
- `Address`: Address information (street, city, postal code, etc.)
- `Telephone`: Phone numbers with type (mobile/home/work/other)

**Important Constraints:**
- All primary entities use unique IDs generated via the uuid library
- Timestamps (created_at, updated_at) are automatically managed
- Kids can have multiple guardians and phone numbers
- Each Kid references its Class via `class_id` (not embedded kids); `kid_ids` arrays only remain on `ClassRecord`/`ClassExport` for import/export

### Context Architecture

The app uses React Context for state management with three main providers:

1. **ThemeProvider** (`src/contexts/ThemeContext.tsx`): Manages light/dark theme
2. **ClassProvider** (`src/contexts/ClassContext.tsx`):
   - Manages class list and selected class state
   - Selected class persists in localStorage
   - Provides class CRUD operations
3. **KidsProvider** (`src/contexts/KidsContext.tsx`):
   - Provides global kids list
   - Handles refreshing kids data

**Provider Nesting** (in App.tsx):
```
ErrorBoundary > ThemeProvider > ClassProvider > KidsProvider > Router
```

**Error Handling:**
- Global error boundary via `react-error-boundary` library
- Catches React component errors and displays user-friendly fallback
- Error fallback component: `src/components/common/ErrorFallback.tsx`

### Component Organization

```
src/components/
├── classes/       # Class management (ClassModal)
├── common/        # Reusable components (AddressForm, TelephoneForm, etc.)
├── guardians/     # Guardian display components
├── kids/          # Student management views (Add, Edit, Details, List)
└── layout/        # App layout (TopBar, LeftPanel, Statistics)
```

### Routing Structure

- `/` → Redirects to `/kids`
- `/kids` → Student list view
- `/kids/add` → Add new student
- `/kids/:kidId` → Student details
- `/kids/:kidId/edit` → Edit student

## Internationalization (i18n)

Translation files are in `src/i18n/locales/` (en.json, el.json). The app uses i18next with:
- Language detection via localStorage and browser settings
- Fallback language: English
- Debug mode enabled

**Usage in components:**
```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

## Import/Export Functionality

**Import Logic** (`src/utils/importUtils.ts`):
- Validates JSON files containing Kid arrays
- Uses JSON schema validation (via ajv)
- Handles ID conflicts: When importing to a class, if a kid_id exists in another class, generates a new UUID
- Statistics: Tracks newKids, updatedKids, unchangedKids, conflictingKids

**Export Logic** (`src/utils/exportUtils.ts`):
- Can export entire class with all kids
- Exports as ClassRecord JSON format with filename: `{school-name}-{class-name}-export-{date}.json`

## Reporting Capabilities

Two reporting features, accessible via the Reports menu (`src/components/layout/TopBarReportsMenu.tsx`), both requiring a selected class with at least one student:

- **Class Catalog PDF** — `generateClassCatalogPDF()` in `src/utils/pdf/catalogGenerator.ts`. Landscape A4 roster (student name + guardian contact info per row) via pdfmake, filename `{school_name}_{class_name}_{school_year}_catalog.pdf`.
- **Guardian Emails Export** — `exportGuardianEmails()` in `src/utils/exportUtils.ts`. Deduplicated CSV (`first_name,last_name,email`) of guardian emails, filename `{school-name}-{class-name}-guardian-emails-{date}.csv`. Throws if no guardian has an email.

The menu disables both actions when no class/students are selected and shows loading states plus success/error toasts during generation.

## Common Patterns

### Timestamp Management
All database updates automatically set `updated_at`. When creating records, both `created_at` and `updated_at` are set. The database layer handles this automatically.

### ID Generation
Use the `createKid()` and `createClass()` utility functions from `src/types/models.ts` to ensure proper ID and timestamp initialization. IDs are generated using `uuid`'s `v4()`.

### Form Handling
Forms use React Hook Form for validation and state management. See `src/components/kids/KidForm.tsx` for the main student form pattern.

### Logging
Use the centralized `logger` utility (`src/utils/logger.ts`) instead of `console` methods:

```typescript
import { logger } from '../utils/logger';

logger.debug('Debug information');  // Only in development
logger.info('Information');         // Only in development
logger.warn('Warning');            // Always shown
logger.error('Error');             // Always shown
```

The logger automatically suppresses debug and info messages in production builds.

### Error Handling Pattern
Use the `useAsyncAction` hook (`src/hooks/useAsyncAction.ts`) for consistent async error handling with toast notifications:

```typescript
import { useAsyncAction } from '../hooks/useAsyncAction';

const executeAction = useAsyncAction();

await executeAction(
  () => deleteClass(classId),
  {
    successMessage: t('classDeleted'),
    errorMessage: t('failedToDeleteClass'),
    onSuccess: () => navigate('/kids')
  }
);
```

This eliminates repetitive try/catch blocks and standardizes error/success feedback.

## Autocomplete Features

Form fields (first name in `BasicInfoSection.tsx`; street name, neighborhood, postal code, city, country in `AddressForm.tsx`) autocomplete from existing kid/guardian data via the shared `AutocompleteInput` component (`src/components/common/AutocompleteInput.tsx`) and extraction/filter utilities in `src/utils/nameUtils.ts` (`extractUniqueFirstNames`, `extractUniqueStreetNames`, `extractUniqueNeighborhoods`, `extractUniquePostalCodes`, `extractUniqueCities`, `extractUniqueCountries`, `filterNamesByQuery`, `normalizeString`).

- Triggers after 2+ characters typed; case- and accent-insensitive (NFD normalization, e.g. Γιώργος matches "γιωργος")
- Keyboard navigation (Arrow Up/Down, Enter, Escape) plus click/tap selection
- Operates entirely in-memory over kids loaded by KidsProvider — no database changes
- Address extraction skips guardian addresses where `same_address_as_kid` is true

**Tests:** `src/test/nameUtils.test.ts`

## PDF Generation

The application uses pdfmake for PDF generation with utilities split into focused modules.

### PDF Module Structure (`src/utils/pdf/`)

- `formatters.ts` - Phone number and text formatting utilities
- `pdfSetup.ts` - PDF initialization and font configuration
- `catalogGenerator.ts` - Class catalog PDF generation (landscape, IEP Sans font)
- `gridGenerator.ts` - Student grid PDF generation (2-column, IEP Sans font)
- `listGenerator.ts` - Student list PDF generation (single-column, IEP Sans font)
- `iepFonts.ts` - IEP Sans font registration for pdfmake (base64 data in `iepFontsData.ts`)
- `index.ts` - Public API exports

### Date Formatting

The application uses `date-fns` library for consistent date formatting:

```typescript
import { format } from 'date-fns';
import { el, enGB } from 'date-fns/locale';

const locale = currentLanguage === 'el' ? el : enGB;
const formattedDate = format(new Date(), 'dd/MM/yyyy', { locale });
```

This provides:
- Consistent formatting across the application
- Tree-shakeable imports (only import what you need)
- Better internationalization support
- Smaller bundle size compared to manual date manipulation

## Testing

Tests are in `src/test/` with setup in `src/test/setup.ts`. The test environment uses:
- jsdom for DOM simulation
- @testing-library/react for component testing
- Global test utilities enabled

## Important Notes

- **Database Constraints**: Cannot delete a class that contains kids. Must remove all kids first.
- **Class Context**: The selected class is persisted in localStorage and restored on app load.
- **Guardian Same Address**: Guardians can share the kid's address (same_address_as_kid flag).
- **Telephone Order**: Telephones are displayed in array order; there is no reordering UI (they can only be added and removed).
- **PDF Generation**: Uses pdfmake library (see `src/utils/pdf/`).

## File Locations

Paths not already called out above:
- Entry point: `src/main.tsx`
- Validation service: `src/services/validation.ts` (uses ajv with JSON schemas from `src/schemas/`)
- Hooks: `src/hooks/` (multiple hooks; see directory for the full list)
- i18n locales: `src/i18n/locales/` (en.json, el.json)
- Test setup: `src/test/setup.ts`
