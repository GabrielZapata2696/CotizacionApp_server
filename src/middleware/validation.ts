import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Joi from 'joi';
import { ApiResponse } from '@/types/ApiResponse';
import { logger } from '@/utils/logger';

// Express-validator middleware for handling validation results
export const validationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : error.type,
      message: error.msg,
      value: 'value' in error ? error.value : undefined
    }));

    logger.debug('Express-validator validation error:', formattedErrors);

    const response: ApiResponse = {
      success: false,
      message: 'Datos de entrada inválidos',
      errors: formattedErrors
    };

    res.status(400).json(response);
    return;
  }

  next();
};

// Joi validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.debug('Validation error:', errors);

      const response: ApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      };

      res.status(400).json(response);
      return;
    }

    // Replace req.body with sanitized data
    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({        
        'string.email': 'Correo debe ser una dirección de email válida',        
        'any.required': 'Username es requerido'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password debe tener al menos 6 caracteres',
        'any.required': 'Password es requerido'
      })
  }),

  register: Joi.object({
    documento: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(6)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Documento debe contener solo números',
        'string.min': 'Documento debe tener al menos 6 dígitos',
        'string.max': 'Documento no puede exceder 20 dígitos',
        'any.required': 'Documento es requerido'
      }),
    nombre: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Nombre debe tener al menos 2 caracteres',
        'string.max': 'Nombre no puede exceder 50 caracteres',
        'any.required': 'Nombre es requerido'
      }),
    apellido: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Apellido debe tener al menos 2 caracteres',
        'string.max': 'Apellido no puede exceder 50 caracteres',
        'any.required': 'Apellido es requerido'
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.min': 'Password debe tener al menos 8 caracteres',
        'string.pattern.base': 'Password debe contener al menos una minúscula, una mayúscula y un número',
        'any.required': 'Password es requerido'
      }),
    correo: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Correo debe ser una dirección de email válida',
        'any.required': 'Correo es requerido'
      }),
    telefono: Joi.string()
      .pattern(/^[\+]?[0-9\s\-\(\)]{7,15}$/)
      .allow('')
      .messages({
        'string.pattern.base': 'Teléfono debe ser un número válido'
      }),
    empresa: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Empresa debe ser un número',
        'number.integer': 'Empresa debe ser un entero',
        'number.positive': 'Empresa debe ser un ID válido',
        'any.required': 'Empresa es requerida'
      }),
    pais: Joi.string()
      .length(2)
      .uppercase()
      .required()
      .messages({
        'string.length': 'País debe ser un código de 2 caracteres',
        'any.required': 'País es requerido'
      }),
    rol: Joi.number()
      .integer()
      .valid(1, 2, 3, 4)
      .required()
      .messages({
        'any.only': 'Rol debe ser un valor válido (1-4)',
        'any.required': 'Rol es requerido'
      })
  }),

  createProduct: Joi.object({
    nombre: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Nombre del producto debe tener al menos 2 caracteres',
        'string.max': 'Nombre del producto no puede exceder 100 caracteres',
        'any.required': 'Nombre del producto es requerido'
      }),
    referencia: Joi.string()
      .max(50)
      .allow('')
      .messages({
        'string.max': 'Referencia no puede exceder 50 caracteres'
      }),
    referencia2: Joi.string()
      .max(50)
      .allow('')
      .messages({
        'string.max': 'Referencia 2 no puede exceder 50 caracteres'
      }),
    peso: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Peso debe ser un valor positivo',
        'any.required': 'Peso es requerido'
      }),
    marca: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.integer': 'Marca debe ser un entero',
        'number.positive': 'Marca debe ser un ID válido',
        'any.required': 'Marca es requerida'
      }),
    observacion: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Observación no puede exceder 500 caracteres'
      }),
    metalCompositions: Joi.array()
      .items(
        Joi.object({
          id_metal: Joi.number().integer().positive().required(),
          cantidad: Joi.number().positive().precision(4).required(),
          valor: Joi.number().positive().precision(4).required()
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Debe especificar al menos una composición de metal',
        'any.required': 'Composiciones de metal son requeridas'
      })
  }),

  createQuotation: Joi.object({
    id_producto: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.integer': 'ID del producto debe ser un entero',
        'number.positive': 'ID del producto debe ser válido',
        'any.required': 'ID del producto es requerido'
      }),
    valor_cotizado: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        'number.positive': 'Valor cotizado debe ser positivo',
        'any.required': 'Valor cotizado es requerido'
      }),
    moneda: Joi.string()
      .valid('USD', 'COP', 'EUR')
      .required()
      .messages({
        'any.only': 'Moneda debe ser USD, COP o EUR',
        'any.required': 'Moneda es requerida'
      })
  }),

  updateProfile: Joi.object({
    nombre: Joi.string().min(2).max(50),
    apellido: Joi.string().min(2).max(50),
    correo: Joi.string().email(),
    telefono: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{7,15}$/).allow('')
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).default('id'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  })
};
