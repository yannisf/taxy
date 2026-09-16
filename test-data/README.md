# Test Data Files

This directory contains test data files for the Entaxy class management system. All files have been updated to be compatible with the new database schema (v4+) which includes the `class_id` property.

## Files Overview

### 1. test-kids-data-en-10.json
- **Format**: Array of Kid objects
- **Language**: English (USA)
- **Records**: 10 students
- **Class ID**: `4223e4b3-544e-4762-afad-04ec9b2a131f`
- **Usage**: Direct import via import dialog (will be added to selected class)
- **Students**: Emma, Liam, Olivia, Noah, Sophia, Ethan, Ava, Mason, Isabella, Lucas

### 2. test-kids-data-el-23.json
- **Format**: Array of Kid objects
- **Language**: Greek (Greece)
- **Records**: 23 students
- **Class ID**: `c9f5cc7a-5b2b-48f5-b1b8-1ac1dd4c9412`
- **Usage**: Direct import via import dialog (will be added to selected class)
- **Students**: Various Greek names with realistic Greek addresses and contacts

### 3. test-class-export-en-10.json
- **Format**: ClassExport object with class metadata + kids array
- **Language**: English (USA)
- **School**: Springfield Elementary
- **Class**: Kindergarten A (2024-2025)
- **Records**: 10 students
- **Usage**: Import complete class with metadata
- **Note**: Includes full class information and timestamps

### 4. test-class-export-el-23.json
- **Format**: ClassExport object with class metadata + kids array
- **Language**: Greek (Greece)
- **School**: Δημοτικό Σχολείο Αθήνας
- **Class**: Νηπιαγωγείο Α (2024-2025)
- **Records**: 23 students
- **Usage**: Import complete class with metadata
- **Note**: Includes full class information and timestamps

## Key Features

All test data includes:
- ✅ **Complete Student Information**
  - Personal details (name, DOB, gender, level)
  - Addresses with street, neighborhood, postal code, city, country
  - Notes and private notes
  - Special education flags

- ✅ **Guardian Information**
  - Multiple guardians per student (up to 4)
  - Guardian relationships (mother, father, grandparent, sibling, extended family, friend)
  - Contact information (phone numbers with country codes, email)
  - Professional information
  - Authorization for pickup flags
  - Address information (separate from kid address when applicable)

- ✅ **Realistic Data**
  - Varied guardian arrangements (both parents, single parents, grandparents, etc.)
  - Different authorization levels
  - Mix of special education and regular students
  - Multiple telephone types (mobile, home, work)

- ✅ **Schema Compliance**
  - All records include `class_id` (required for new schema v4+)
  - All records include `extended_day_care` flag
  - Timestamps in ISO 8601 format
  - All IDs are valid UUIDs

## Import Instructions

### Importing Kid Array Files
1. Open Entaxy application
2. Select or create a class in the left panel
3. Go to Data Menu → Import Students
4. Select `test-kids-data-en-10.json` or `test-kids-data-el-23.json`
5. Review the import preview
6. Click Import

The kids will be added to the selected class (class_id will be updated to the target class).

### Importing Class Export Files
1. Open Entaxy application
2. Go to Data Menu → Import Students
3. Select `test-class-export-en-10.json` or `test-class-export-el-23.json`
4. The class metadata will be read and kids imported to the appropriate class
5. Review the import preview
6. Click Import

## Data Quality Notes

- **Greek Data**: Includes realistic Greek addresses, Greek character names, and Greek professions
- **English Data**: Uses USA locations and English naming conventions
- **Contact Information**: All phone numbers and emails are fabricated test data
- **Privacy**: No real personal information is included

## Migration Notes (v3 → v4)

These files have been updated to the v4 schema:
- Added `class_id` to each kid record
- Ensured `extended_day_care` field is present
- Compatible with the new one-to-many relationship (kids → class)

**Old Schema (v3)**: Classes had `kid_ids: string[]` array
**New Schema (v4)**: Kids have `class_id: string` property

## Testing Recommendations

1. **Import to New Database**
   - Create new empty class
   - Import one of the Kid array files
   - Verify all students appear with correct information

2. **Guardian Data Verification**
   - Check that multiple guardians display correctly
   - Verify separate addresses show for non-cohabiting guardians
   - Confirm telephone numbers and email addresses import correctly

3. **Internationalization**
   - Import English file and verify English UI
   - Import Greek file and verify Greek UI with proper character rendering

4. **Export Round-Trip**
   - Import a file
   - Export the class to JSON/encrypted format
   - Verify data integrity after export

## File Structure Reference

### Kid Object (v4 Schema)
```json
{
  "kid_id": "uuid",
  "class_id": "uuid",
  "first_name": "string",
  "last_name": "string",
  "preferred_name": "string | null",
  "date_of_birth": "ISO date",
  "gender": "male | female",
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
      "relation_with_kid": "string",
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

---

**Last Updated**: November 2025
**Schema Version**: v4 (with class_id)
**Status**: Ready for import and testing
