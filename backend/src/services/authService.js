const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const db = require('../config/database')
const logger = require('../config/logger')

class AuthService {
  async hashPassword(password) {
    return await bcrypt.hash(password, 12)
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateTokens(userId, email) {
    const payload = { userId, email }
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '15m'
    })

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
    })

    return { accessToken, refreshToken }
  }

  async storeRefreshToken(userId, refreshToken, deviceInfo = null) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    await db('refresh_tokens').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      device_info: deviceInfo
    })
  }

  async verifyRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

      const tokenRecord = await db('refresh_tokens')
        .where({
          user_id: decoded.userId,
          token_hash: tokenHash,
          is_revoked: false
        })
        .where('expires_at', '>', new Date())
        .first()

      if (!tokenRecord) {
        throw new Error('Invalid refresh token')
      }

      return decoded
    } catch (error) {
      logger.warn('Invalid refresh token attempt', { error: error.message })
      throw new Error('Invalid refresh token')
    }
  }

  async revokeRefreshToken(refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    
    await db('refresh_tokens')
      .where('token_hash', tokenHash)
      .update({ is_revoked: true })
  }

  async revokeAllRefreshTokens(userId) {
    await db('refresh_tokens')
      .where('user_id', userId)
      .update({ is_revoked: true })
  }

  async cleanupExpiredTokens() {
    const count = await db('refresh_tokens')
      .where('expires_at', '<', new Date())
      .orWhere('is_revoked', true)
      .del()

    logger.info(`Cleaned up ${count} expired refresh tokens`)
    return count
  }
}

module.exports = new AuthService()