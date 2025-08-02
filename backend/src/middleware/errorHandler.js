const logger = require('../config/logger')

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  logger.error('Error occurred', {
    error: error.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message)
    error = {
      message: message.join(', '),
      code: 'VALIDATION_ERROR'
    }
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    const message = 'Duplicate field value entered'
    error = {
      message,
      code: 'DUPLICATE_FIELD'
    }
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token'
    error = {
      message,
      code: 'INVALID_TOKEN'
    }
    return res.status(401).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired'
    error = {
      message,
      code: 'TOKEN_EXPIRED'
    }
    return res.status(401).json({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler
