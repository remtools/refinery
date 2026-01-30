import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    next();
  };
};

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  if (err.message.includes('SQLITE_CONSTRAINT')) {
    if (err.message.includes('FOREIGN KEY')) {
      res.status(400).json({
        error: 'Referential integrity violation',
        message: 'The referenced parent entity does not exist'
      });
      return;
    }
    if (err.message.includes('UNIQUE')) {
      res.status(409).json({
        error: 'Duplicate entry',
        message: 'A resource with this identifier already exists'
      });
      return;
    }
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
};