import Ajv from 'ajv';
import type { ValidateFunction, ErrorObject } from 'ajv';
import type { Kid, Guardian } from '../types/models';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ISO Date validation regex (YYYY-MM-DD)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class ValidationService {
  private ajv: Ajv;
  private kidValidator!: ValidateFunction<Kid>;
  private guardianValidator!: ValidateFunction<Guardian>;

  constructor() {
    this.ajv = new Ajv({ 
      allErrors: true, 
      verbose: true,
      strict: false
    });

    // Add custom fast validators
    this.ajv.addFormat('uuid', {
      type: 'string',
      validate: (uuid: string) => UUID_REGEX.test(uuid)
    });

    this.ajv.addFormat('date', {
      type: 'string',
      validate: (dateString: string) => {
        if (!ISO_DATE_REGEX.test(dateString)) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
      }
    });

    // Pre-compile schemas for better performance
    this.initializeValidators();
  }

  private initializeValidators() {
    // Pre-compile kid schema
    const kidSchema = {
      type: 'object',
      properties: {
        first_name: { type: 'string', minLength: 1 },
        last_name: { type: 'string', minLength: 1 },
        gender: { type: 'string', enum: ['male', 'female', 'other'] },
        level: { type: 'string', enum: ['pre-kindergartner', 'kindergartner', 'kindergartner-repeating'] },
        guardians: { 
          type: 'array', 
          minItems: 0,
          items: {
            type: 'object',
            required: ['first_name', 'last_name', 'relation_with_kid']
          }
        }
      },
      required: ['first_name', 'last_name', 'gender', 'level', 'guardians']
    };

    // Pre-compile guardian schema
    const guardianSchema = {
      type: 'object',
      properties: {
        first_name: { type: 'string', minLength: 1 },
        last_name: { type: 'string', minLength: 1 },
        relation_with_kid: { 
          type: 'string', 
          enum: ['father', 'mother', 'sibling', 'grandparent', 'extended family', 'friend'] 
        }
      },
            required: ['first_name', 'last_name', 'relation_with_kid']
    };

    this.kidValidator = this.ajv.compile(kidSchema);
    this.guardianValidator = this.ajv.compile(guardianSchema);
  }

  validateKid(kid: Kid): { valid: boolean; errors: ErrorObject[] | null } {
    const valid = this.kidValidator(kid);

    return {
      valid: !!valid,
      errors: this.kidValidator.errors || null
    };
  }

  validateGuardian(guardian: Guardian): { valid: boolean; errors: ErrorObject[] | null } {
    const valid = this.guardianValidator(guardian);

    return {
      valid: !!valid,
      errors: this.guardianValidator.errors || null
    };
  }
}

export const validationService = new ValidationService();
