'use strict';

const Joi = require('joi');

/**
 * validate.middleware.js
 *
 * Generic Joi schema validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(authValidators.register), handler)
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // collect ALL errors, not just the first
      stripUnknown: true,  // silently remove fields not in schema
    });

    if (error) {
      const details = error.details.map((d) => ({
        field:   d.path.join('.'),
        message: d.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error:   details,
      });
    }

    // Replace req.body with the validated (and stripped) value
    req.body = value;
    return next();
  };
}

module.exports = validate;
