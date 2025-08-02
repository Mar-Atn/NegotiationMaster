const jwt = require('jsonwebtoken')
const logger = require('../config/logger')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  // Enhanced logging for debugging
  logger.info('Auth middleware called', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    tokenPresent: !!token,
    tokenStart: token ? token.substring(0, 10) + '...' : 'none',
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })

  if (!token) {
    logger.warn('No token provided', {
      url: req.url,
      method: req.method,
      authHeader,
      ip: req.ip
    })
    return res.status(401).json({
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Token validation failed', {
        url: req.url,
        token: token.substring(0, 10) + '...',
        error: err.message,
        errorType: err.name,
        ip: req.ip
      })

      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID',
        details: err.message
      })
    }

    logger.info('Token validated successfully', {
      userId: user.userId,
      email: user.email,
      url: req.url,
      ip: req.ip
    })

    req.user = user
    next()
  })
}

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null
    } else {
      req.user = user
    }
    next()
  })
}

module.exports = {
  authenticateToken,
  optionalAuth
}
