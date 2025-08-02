const Joi = require('joi')
const { validationResult } = require('express-validator')

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
        code: 'VALIDATION_ERROR'
      })
    }
    next()
  }
}

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      code: 'VALIDATION_ERROR',
      details: errors.array()
    })
  }
  next()
}

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(4).required(),
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(1).max(50),
    lastName: Joi.string().min(1).max(50),
    username: Joi.string().alphanum().min(3).max(30)
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(4).required()
  }),

  message: Joi.object({
    content: Joi.string().min(1).max(2000).required()
  }),

  dealTerms: Joi.object({
    terms: Joi.object().required(),
    dealReached: Joi.boolean().required()
  })
}

module.exports = {
  validate,
  handleValidationErrors,
  schemas
}
