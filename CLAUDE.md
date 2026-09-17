# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Entaxy is a React-based class management system for educational institutions. It manages students (referred to as "kids"), guardians, and class information with multilingual support (English/Greek). The application runs entirely client-side using IndexedDB for local data persistence.

**Key Stack:**
- React 19 + TypeScript
- Vite 7.1.7 (build tool)
- Dexie 4.2.0 (IndexedDB wrapper)
- Bootstrap 5.3.8 + React Bootstrap 2.10.10
- React Router DOM 7.9.3
- i18next for internationalization
- Vitest + React Testing Library
- nanoid for ID generation
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
npm run test:ui         # Run tests with UI interface

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
- **v3**: Added classes table

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
- All primary entities use unique IDs generated via nanoid library
- Timestamps (created_at, updated_at) are automatically managed
- Kids can have multiple guardians and phone numbers
- Classes contain arrays of kid_ids (not embedded kids)

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

The application provides two main reporting features, accessible via the Reports menu in the top bar:

### 1. Class Catalog PDF Report

**Function**: `generateClassCatalogPDF()` in `src/utils/pdf/catalogGenerator.ts`

**Features:**
- Generates landscape A4 PDF using pdfmake library
- Contains student roster with guardian contact information
- Filename format: `{school_name}_{class_name}_{school_year}_catalog.pdf`

**PDF Structure:**
- **Header**: School name, class name, school year, and generation date
- **Table Columns**:
  1. Number (sequential, 1-indexed)
  2. Student Name (uses preferred_name if available, otherwise first_name)
  3. Guardian Information (formatted per guardian):
     - Guardian full name
     - Relation badge (uppercase, xx-small bold font)
     - Phone numbers (up to 3, formatted as XXX XXX XXXX)

**Key Implementation Details:**
- Phone formatting: Strips country code, formats as XXX XXX XXXX
- Relations are translated via i18n keys: `pdfRelationFather`, `pdfRelationMother`, etc.
- Each guardian displayed on separate line within the cell
- Alternating row colors (#ffffff and #f8f9fa) for readability
- Dynamic import of pdfmake to ensure proper font initialization

**Requires:**
- A selected class with at least one student
- Guardians with telephone numbers (optional, but recommended)

### 2. Guardian Emails Export

**Function**: `exportGuardianEmails()` in `src/utils/exportUtils.ts`

**Features:**
- Exports unique guardian email addresses to CSV format
- Deduplicates emails (same guardian for multiple kids counted once)
- Filename format: `{school-name}-{class-name}-guardian-emails-{date}.csv`

**CSV Structure:**
```
first_name,last_name,email
John,Doe,john.doe@example.com
Jane,Smith,jane.smith@example.com
```

**Key Implementation Details:**
- Filters out guardians without email addresses
- CSV field escaping for commas, quotes, and newlines
- Returns count of unique emails exported
- Throws error if no guardians with emails found

**Requires:**
- A selected class with at least one student
- At least one guardian with an email address

### Reports Menu Component

**Location**: `src/components/layout/TopBarReportsMenu.tsx`

**UI/UX:**
- Both reports disabled if no class selected or class has no students
- Loading states prevent duplicate generation
- Success/error toasts provide user feedback
- Translation keys used: `selectClassToExport`, `catalogGenerated`, `failedToGenerateCatalog`, `guardianEmailsExported`, `noGuardianEmailsFound`, `failedToExportGuardianEmails`

## Common Patterns

### Timestamp Management
All database updates automatically set `updated_at`. When creating records, both `created_at` and `updated_at` are set. The database layer handles this automatically.

### ID Generation
Use the `createKid()` and `createClass()` utility functions from `src/types/models.ts` to ensure proper ID and timestamp initialization. IDs are generated using `nanoid()` for smaller bundle size and better performance compared to UUIDs.

### Form Handling
Forms use React Hook Form for validation and state management. See `src/components/kids/KidForm.tsx` for the main student form pattern.

### Drag & Drop
Telephone ordering uses @dnd-kit library. See `src/components/common/SortableTelephoneForm.tsx`.

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

The application provides autocomplete functionality for form fields to improve data entry consistency and speed.

### First Name Autocomplete

Provides autocomplete for the first name field when adding or editing students.

**Features:**
- Appears after typing 2 or more characters
- Sources names from existing students' first_name and preferred_name fields
- Case-insensitive and accent-insensitive matching
- Supports keyboard navigation (Arrow Up/Down, Enter, Escape)
- Click or tap to select suggestions

**Integration:** `src/components/kids/sections/BasicInfoSection.tsx`

### Address Field Autocomplete

Provides autocomplete for all address fields (street name, neighborhood, postal code, city, country) when entering kid or guardian addresses.

**Features:**
- Appears after typing 2 or more characters
- Sources data from both kid addresses and guardian addresses
- Skips guardian addresses when `same_address_as_kid` is true
- Each field suggests values from the same field type only
- Case-insensitive and accent-insensitive matching
- Supports keyboard navigation (Arrow Up/Down, Enter, Escape)
- Click or tap to select suggestions
- Respects disabled state (no autocomplete when field is disabled)

**Supported Fields:**
- Street Name: `extractUniqueStreetNames()`
- Neighborhood: `extractUniqueNeighborhoods()`
- Postal Code: `extractUniquePostalCodes()`
- City: `extractUniqueCities()`
- Country: `extractUniqueCountries()`

**Integration:** `src/components/common/AddressForm.tsx`

### Technical Implementation

**Reusable Component:** `src/components/common/AutocompleteInput.tsx`
- Generic autocomplete input that receives suggestions as props
- Handles keyboard navigation and mouse interaction
- Manages dropdown visibility and focus states

**Utility Functions:** `src/utils/nameUtils.ts`
- `normalizeString()`: Removes accents and converts to lowercase for matching
- `extractUniqueFirstNames()`: Extracts unique first/preferred names from kids
- `extractUniqueStreetNames()`: Extracts unique street names from all addresses
- `extractUniqueNeighborhoods()`: Extracts unique neighborhoods from all addresses
- `extractUniquePostalCodes()`: Extracts unique postal codes from all addresses
- `extractUniqueCities()`: Extracts unique cities from all addresses
- `extractUniqueCountries()`: Extracts unique countries from all addresses
- `filterNamesByQuery()`: Filters any list based on user input (min 2 chars)

**How It Works:**
1. KidsProvider loads all kids from IndexedDB on app mount
2. Components extract unique values using appropriate extraction functions
3. Values are cached using `useMemo` for performance
4. `filterNamesByQuery()` filters the list in real-time as user types
5. AutocompleteInput component displays filtered suggestions

**Technical Details:**
- Uses Unicode normalization (NFD) to remove diacritical marks for accent-insensitive matching
- Supports Greek characters with accents (Γιώργος matches "γιωργος")
- No database changes - operates entirely in-memory
- Lists update automatically when kids data changes in KidsContext
- Address extraction skips guardians with `same_address_as_kid: true`

**Tests:** `src/test/nameUtils.test.ts` (22 tests covering all extraction and filtering functions)

## PDF Generation

The application uses pdfmake for PDF generation with utilities split into focused modules.

### PDF Module Structure (`src/utils/pdf/`)

- `formatters.ts` - Phone number and text formatting utilities
- `pdfSetup.ts` - PDF initialization and font configuration
- `catalogGenerator.ts` - Class catalog PDF generation (landscape, Roboto font)
- `gridGenerator.ts` - Student grid PDF generation (2-column, Roboto font)
- `listGenerator.ts` - Student list PDF generation (single-column, Roboto font)
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
- **Telephone Sorting**: Telephones are displayed in array order and can be reordered via drag-and-drop.
- **PDF Generation**: Uses pdfmake library (see `src/utils/pdf/`).

## File Locations

### Core Application
- Main app component: `src/App.tsx`
- Entry point: `src/main.tsx`
- Database schema: `src/services/database.ts`
- Type definitions: `src/types/models.ts`
- Validation service: `src/services/validation.ts` (uses ajv with JSON schemas from `src/schemas/`)

### Utilities (Modular Structure)
- **PDF generation**: `src/utils/pdf/` (modular: catalogGenerator, gridGenerator, listGenerator, formatters, pdfSetup)
- **Other utilities**:
  - Export utilities: `src/utils/exportUtils.ts`
  - Import utilities: `src/utils/importUtils.ts`
  - Name utilities: `src/utils/nameUtils.ts`
  - Logger: `src/utils/logger.ts`
  - Date formatting: Using `date-fns` library

### Hooks
- Async action hook: `src/hooks/useAsyncAction.ts`
- Modal state hook: `src/hooks/useModalState.ts`
- Class kids hook: `src/hooks/useClassKids.ts`

### Components
- Reports menu: `src/components/layout/TopBarReportsMenu.tsx`
- Autocomplete input: `src/components/common/AutocompleteInput.tsx`
- Error fallback: `src/components/common/ErrorFallback.tsx`

### Tests
- Name utils tests: `src/test/nameUtils.test.ts`
- Test setup: `src/test/setup.ts`
