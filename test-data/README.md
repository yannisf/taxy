# Test Data Files

This directory contains test data for the Entaxy class management system.

## Files

### test-class-export-el-23.json
- **Format**: `ClassExport` object (`{ class, kids }`) — importable via the app's Import Students dialog
- **Language**: Greek
- **School**: Δημοτικό Σχολείο Αθήνας, Νηπιαγωγείο Α (2024-2025)
- **Records**: 23 students
- **Class ID**: `c9f5cc7a-5b2b-48f5-b1b8-1ac1dd4c9412`

Covers a realistic mix of guardian arrangements (both parents, single parent, grandparents, siblings, extended family, friends), multiple telephone types, special education flags, and guardians with and without a separate address from the kid.

## Guardian relations used

`relation_with_kid` values in this file: `father`, `mother`, `friend`, `extended family`, plus the legacy values `sibling` and `grandparent` (still accepted for backward compatibility with existing records — see `src/types/models.ts` and `src/services/validation.ts` — but no longer offered in the Add/Edit Guardian form, which instead offers the more specific `brother`/`sister`/`grandfather`/`grandmother`).

## Importing

1. Open Entaxy and select or create a class in the left panel
2. Data Menu → Import Students
3. Select `test-class-export-el-23.json`
4. Review the import preview, then click Import

## Verifying compatibility

`src/test/testDataFixtures.test.ts` loads this file through the real (unmocked) `validationService`. It checks that the file imports cleanly via `validateImportFile`, and that every guardian relation in it is still an accepted value — the latter reports the offending kid and relation by name, where the import check alone would only say which kid failed. Run it with:

```bash
npm run test:run -- testDataFixtures
```

## File Structure Reference

### Kid Object

```json
{
  "kid_id": "uuid",
  "class_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "preferred_name": "string | null",
  "date_of_birth": "ISO date",
  "gender": "male | female | other",
  "level": "pre-kindergartner | kindergartner | kindergartner-repeating",
  "address": {
    "street_name": "string",
    "street_number": "string",
    "neighborhood": "string",
    "postal_code": "string",
    "city": "string",
    "country": "string"
  },
  "notes": "string",
  "private_notes": "string | null",
  "special_education": "boolean",
  "extended_day_care": "boolean",
  "guardians": [
    {
      "first_name": "string",
      "last_name": "string",
      "relation_with_kid": "father | mother | brother | sister | grandfather | grandmother | uncle | aunt | godfather | godmother | caregiver | extended family | friend | sibling | grandparent",
      "authorized_for_pickup": "boolean",
      "same_address_as_kid": "boolean",
      "email": "string | null",
      "profession": "string",
      "telephones": [
        {
          "country_code": "string",
          "number": "string",
          "telephone_type": "mobile | home | work | other"
        }
      ],
      "address": {
        // Optional, only when same_address_as_kid is false
      }
    }
  ],
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp"
}
```

### ClassExport Object

```json
{
  "class": {
    "class_id": "uuid",
    "school_name": "string",
    "class_name": "string",
    "school_year": "string",
    "created_at": "ISO timestamp",
    "updated_at": "ISO timestamp"
  },
  "kids": [
    // Array of Kid objects
  ]
}
```
