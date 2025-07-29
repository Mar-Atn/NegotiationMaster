const jwt = require('jsonwebtoken')
const logger = require('../config/logger')

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token attempt', { 
        token: token.substring(0, 10) + '...',
        error: err.message,
        ip: req.ip
      })
      
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      })
    }

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