const db = require('../config/database')
const authService = require('../services/authService')
const logger = require('../config/logger')

class AuthController {
  async register(req, res, next) {
    try {
      const { email, username, password, firstName, lastName } = req.body

      const existingUser = await db('users')
        .where('email', email)
        .orWhere('username', username)
        .first()

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
          code: 'USER_EXISTS'
        })
      }

      const passwordHash = await authService.hashPassword(password)

      const [user] = await db('users')
        .insert({
          email,
          username,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName
        })
        .returning(['id', 'email', 'username', 'first_name', 'last_name', 'created_at'])

      await db('user_progress').insert({
        user_id: user.id
      })

      const { accessToken, refreshToken } = authService.generateTokens(user.id, user.email)
      await authService.storeRefreshToken(user.id, refreshToken, req.get('User-Agent'))

      logger.info('User registered successfully', { userId: user.id, email: user.email })

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            createdAt: user.created_at
          },
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      const user = await db('users')
        .where('email', email)
        .first()

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        })
      }

      const isPasswordValid = await authService.comparePassword(password, user.password_hash)
      
      if (!isPasswordValid) {
        logger.warn('Failed login attempt', { email, ip: req.ip })
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        })
      }

      await db('users')
        .where('id', user.id)
        .update({ last_login: new Date() })

      const { accessToken, refreshToken } = authService.generateTokens(user.id, user.email)
      await authService.storeRefreshToken(user.id, refreshToken, req.get('User-Agent'))

      logger.info('User logged in successfully', { userId: user.id, email: user.email })

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name
          },
          accessToken,
          refreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required',
          code: 'TOKEN_MISSING'
        })
      }

      const decoded = await authService.verifyRefreshToken(refreshToken)
      
      const user = await db('users')
        .where('id', decoded.userId)
        .first()

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        })
      }

      await authService.revokeRefreshToken(refreshToken)

      const { accessToken, refreshToken: newRefreshToken } = authService.generateTokens(user.id, user.email)
      await authService.storeRefreshToken(user.id, newRefreshToken, req.get('User-Agent'))

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body

      if (refreshToken) {
        await authService.revokeRefreshToken(refreshToken)
      }

      logger.info('User logged out', { userId: req.user?.userId })

      res.json({
        success: true,
        message: 'Logged out successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async logoutAll(req, res, next) {
    try {
      await authService.revokeAllRefreshTokens(req.user.userId)

      logger.info('User logged out from all devices', { userId: req.user.userId })

      res.json({
        success: true,
        message: 'Logged out from all devices'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new AuthController()