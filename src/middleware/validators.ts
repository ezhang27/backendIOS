import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler';

/**
 * Process validation results and throw error if validation fails
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }
  next();
};

/**
 * Common validation chains
 */
export const validators = {
  // UUID validation
  uuid: (field: string): ValidationChain => 
    body(field).isUUID().withMessage(`${field} must be a valid UUID`),
  
  // UUID parameter validation
  uuidParam: (paramName: string): ValidationChain => 
    param(paramName).isUUID().withMessage(`${paramName} must be a valid UUID`),
  
  // UUID query validation  
  uuidQuery: (queryName: string): ValidationChain => 
    query(queryName).isUUID().withMessage(`${queryName} must be a valid UUID`),
  
  // Required field validation
  required: (field: string): ValidationChain => 
    body(field).notEmpty().withMessage(`${field} is required`),
  
  // String validation with length
  string: (field: string, { min = 1, max = 255 } = {}): ValidationChain => 
    body(field).isString().withMessage(`${field} must be a string`)
      .isLength({ min, max }).withMessage(`${field} must be between ${min} and ${max} characters`),
  
  // Email validation
  email: (field: string = 'email'): ValidationChain => 
    body(field).isEmail().withMessage('Must provide a valid email address'),
  
  // Phone validation
  phone: (field: string = 'phone'): ValidationChain => 
    body(field).isMobilePhone('any').withMessage('Must provide a valid phone number'),
  
  // Number validation
  number: (field: string, { min, max } = {}): ValidationChain => {
    const validator = body(field).isNumeric().withMessage(`${field} must be a number`);
    
    if (min !== undefined) {
      validator.isFloat({ min }).withMessage(`${field} must be at least ${min}`);
    }
    
    if (max !== undefined) {
      validator.isFloat({ max }).withMessage(`${field} must be at most ${max}`);
    }
    
    return validator;
  },
  
  // Date validation
  date: (field: string): ValidationChain => 
    body(field).isISO8601().withMessage(`${field} must be a valid date`),
  
  // Boolean validation
  boolean: (field: string): ValidationChain => 
    body(field).isBoolean().withMessage(`${field} must be a boolean`),
  
  // Enum validation
  enum: (field: string, values: string[]): ValidationChain => 
    body(field).isIn(values).withMessage(`${field} must be one of: ${values.join(', ')}`)
};

/**
 * Predefined validation chains for common API endpoints
 */
export const validations = {
  // Guest profile validations
  guestProfile: [
    validators.string('firstName', { max: 50 }),
    validators.string('lastName', { max: 50 }),
    validators.email(),
    validators.phone(),
    validate
  ],
  
  // Feedback rating validations
  feedbackRating: [
    validators.uuid('categoryId'),
    validators.number('rating', { min: 1, max: 5 }),
    validators.string('comment', { min: 0, max: 1000 }).optional(),
    validate
  ],
  
  // Dining request validations
  diningRequest: [
    validators.uuid('roomId'),
    validators.uuid('restaurantId'),
    validators.number('numGuests', { min: 1 }),
    validators.string('deliveryInstructions', { max: 500 }).optional(),
    validate
  ],
  
  // Common HTTP header validations
  headers: {
    guestId: (req: Request, res: Response, next: NextFunction) => {
      const guestId = req.headers['x-guest-id'] as string;
      if (!guestId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(guestId)) {
        throw new ValidationError('Invalid header', [{ 
          msg: 'X-Guest-ID header must be a valid UUID', 
          param: 'X-Guest-ID',
          location: 'headers'
        }]);
      }
      next();
    },
    
    hotelId: (req: Request, res: Response, next: NextFunction) => {
      const hotelId = req.headers['x-hotel-id'] as string;
      if (!hotelId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(hotelId)) {
        throw new ValidationError('Invalid header', [{ 
          msg: 'X-Hotel-ID header must be a valid UUID', 
          param: 'X-Hotel-ID',
          location: 'headers'
        }]);
      }
      next();
    }
  }
}; 