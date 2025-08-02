const express = require('express')
const rateLimit = require('express-rate-limit')
const authController = require('../controllers/authController')
const { validate, schemas } = require('../middleware/validation')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // temporarily increased for testing
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})

router.post('/register', authLimiter, validate(schemas.register), authController.register)
router.post('/login', authLimiter, validate(schemas.login), authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.post('/logout-all', authenticateToken, authController.logoutAll)

module.exports = router
