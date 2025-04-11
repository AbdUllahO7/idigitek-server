import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendError } from '../utils/responseHandler';

/**
  * Validate request using express-validator rules
  * @param validations Array of validation chains
*/
export const validate = (validations: ValidationChain[]) => {
  console.log('validate function called with validations:', !!validations, Array.isArray(validations), validations?.length);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    for (const validation of validations) {
      if (!validation || typeof validation.run !== 'function') {
        console.error('Invalid validation:', validation);
        return sendError(res, 'Internal server error: Invalid validation', 500);
      }
      const result = await validation.run(req);
      if (result.array().length) break;
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map((error: any) => {
      // Get the field name from the error object
      let field = 'unknown';
      if (error.type === 'field') {
        field = error.path || error.param || error.location;
      } else if (error.type === 'alternative') {
        // For alternative errors, use the first nested error's path
        field = error.nestedErrors?.[0]?.path || 'unknown';
      } else if (error.type === 'unknown_fields') {
        field = Object.keys(error.fields || {})[0] || 'unknown';
      } else if (error.param) {
        field = error.param;
      }
      
      return {
        field,
        message: error.msg,
      };
    });

    // Send validation error response
    return sendError(
      res,
      'Validation failed',
      400,
      formattedErrors
    );
  };
};

// Export the function directly for debugging purposes
console.log('validator.middleware.ts: validate function exported:', typeof validate);