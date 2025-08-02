/**
 * Auth Service Unit Tests
 * 
 * Comprehensive testing for authentication service functionality including
 * password hashing, token generation, and refresh token management.
 */

const AuthService = require('../../services/authService')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mockdate = require('mockdate')

// Mock dependencies
jest.mock('../../config/database')
jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

const db = require('../../config/database')

describe('AuthService', () => {
  let authService

  beforeEach(() => {
    authService = new AuthService()
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should hash password with correct salt rounds', async () => {
      const password = 'testPassword123'
      const hashedPassword = 'hashedPassword123'
      
      bcrypt.hash.mockResolvedValue(hashedPassword)
      
      const result = await authService.hashPassword(password)
      
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(hashedPassword)
    })

    it('should throw error if hashing fails', async () => {
      const password = 'testPassword123'
      const error = new Error('Hashing failed')
      
      bcrypt.hash.mockRejectedValue(error)
      
      await expect(authService.hashPassword(password)).rejects.toThrow('Hashing failed')
    })
  })

  describe('comparePassword', () => {
    it('should return true for matching passwords', async () => {
      const password = 'testPassword123'
      const hashedPassword = 'hashedPassword123'
      
      bcrypt.compare.mockResolvedValue(true)
      
      const result = await authService.comparePassword(password, hashedPassword)
      
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword)
      expect(result).toBe(true)
    })

    it('should return false for non-matching passwords', async () => {
      const password = 'testPassword123'
      const hashedPassword = 'differentHashedPassword'
      
      bcrypt.compare.mockResolvedValue(false)
      
      const result = await authService.comparePassword(password, hashedPassword)
      
      expect(result).toBe(false)
    })

    it('should throw error if comparison fails', async () => {
      const password = 'testPassword123'
      const hashedPassword = 'hashedPassword123'
      const error = new Error('Comparison failed')
      
      bcrypt.compare.mockRejectedValue(error)
      
      await expect(authService.comparePassword(password, hashedPassword)).rejects.toThrow('Comparison failed')
    })
  })

  describe('generateTokens', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-jwt-secret'
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
      process.env.JWT_EXPIRE = '15m'
      process.env.JWT_REFRESH_EXPIRE = '7d'
    })

    it('should generate access and refresh tokens', () => {
      const userId = 'user123'
      const email = 'test@example.com'
      const mockAccessToken = 'mockAccessToken'
      const mockRefreshToken = 'mockRefreshToken'
      
      jwt.sign
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken)
      
      const result = authService.generateTokens(userId, email)
      
      expect(jwt.sign).toHaveBeenCalledTimes(2)
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, email },
        'test-jwt-secret',
        { expiresIn: '15m' }
      )
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, email },
        'test-refresh-secret',
        { expiresIn: '7d' }
      )
      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken
      })
    })

    it('should use default expiration times when env vars not set', () => {
      delete process.env.JWT_EXPIRE
      delete process.env.JWT_REFRESH_EXPIRE
      
      const userId = 'user123'
      const email = 'test@example.com'
      
      jwt.sign.mockReturnValue('mockToken')
      
      authService.generateTokens(userId, email)
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, email },
        'test-jwt-secret',
        { expiresIn: '15m' }
      )
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId, email },
        'test-refresh-secret',
        { expiresIn: '7d' }
      )
    })
  })

  describe('storeRefreshToken', () => {
    beforeEach(() => {
      mockdate.set(new Date('2024-01-01T00:00:00Z'))
    })

    afterEach(() => {
      mockdate.reset()
    })

    it('should store refresh token with hashed value', async () => {
      const userId = 'user123'
      const refreshToken = 'refreshToken123'
      const deviceInfo = 'Mozilla/5.0 Chrome'
      const tokenHash = 'hashedTokenValue'
      
      // Mock crypto hash
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(tokenHash)
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      // Mock database insert
      db.mockReturnValue({
        insert: jest.fn().mockResolvedValue()
      })
      
      await authService.storeRefreshToken(userId, refreshToken, deviceInfo)
      
      expect(crypto.createHash).toHaveBeenCalledWith('sha256')
      expect(mockHash.update).toHaveBeenCalledWith(refreshToken)
      expect(mockHash.digest).toHaveBeenCalledWith('hex')
      
      expect(db).toHaveBeenCalledWith('refresh_tokens')
      expect(db().insert).toHaveBeenCalledWith({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: new Date('2024-01-08T00:00:00Z'), // 7 days later
        device_info: deviceInfo
      })
    })

    it('should store refresh token without device info', async () => {
      const userId = 'user123'
      const refreshToken = 'refreshToken123'
      
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedToken')
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      db.mockReturnValue({
        insert: jest.fn().mockResolvedValue()
      })
      
      await authService.storeRefreshToken(userId, refreshToken)
      
      expect(db().insert).toHaveBeenCalledWith({
        user_id: userId,
        token_hash: 'hashedToken',
        expires_at: new Date('2024-01-08T00:00:00Z'),
        device_info: null
      })
    })

    it('should throw error if database insert fails', async () => {
      const userId = 'user123'
      const refreshToken = 'refreshToken123'
      const error = new Error('Database error')
      
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedToken')
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      db.mockReturnValue({
        insert: jest.fn().mockRejectedValue(error)
      })
      
      await expect(authService.storeRefreshToken(userId, refreshToken)).rejects.toThrow('Database error')
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token and return user data', async () => {
      const refreshToken = 'validRefreshToken'
      const decodedPayload = { userId: 'user123', email: 'test@example.com' }
      const tokenHash = 'hashedTokenValue'
      const mockTokenRecord = {
        user_id: 'user123',
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 86400000) // 1 day in future
      }
      
      // Mock JWT verification
      jwt.verify.mockReturnValue(decodedPayload)
      
      // Mock crypto hash
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(tokenHash)
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      // Mock database query
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockTokenRecord)
      })
      
      const result = await authService.verifyRefreshToken(refreshToken)
      
      expect(jwt.verify).toHaveBeenCalledWith(refreshToken, process.env.JWT_REFRESH_SECRET)
      expect(result).toEqual({
        valid: true,
        userId: decodedPayload.userId,
        email: decodedPayload.email
      })
    })

    it('should return invalid for expired token', async () => {
      const refreshToken = 'expiredRefreshToken'
      const decodedPayload = { userId: 'user123', email: 'test@example.com' }
      const tokenHash = 'hashedTokenValue'
      const mockTokenRecord = {
        user_id: 'user123',
        token_hash: tokenHash,
        expires_at: new Date(Date.now() - 86400000) // 1 day in past
      }
      
      jwt.verify.mockReturnValue(decodedPayload)
      
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(tokenHash)
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockTokenRecord)
      })
      
      const result = await authService.verifyRefreshToken(refreshToken)
      
      expect(result).toEqual({ valid: false, error: 'Token expired' })
    })

    it('should return invalid for non-existent token', async () => {
      const refreshToken = 'nonExistentToken'
      const decodedPayload = { userId: 'user123', email: 'test@example.com' }
      
      jwt.verify.mockReturnValue(decodedPayload)
      
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedToken')
      }
      crypto.createHash = jest.fn().mockReturnValue(mockHash)
      
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      })
      
      const result = await authService.verifyRefreshToken(refreshToken)
      
      expect(result).toEqual({ valid: false, error: 'Invalid token' })
    })

    it('should return invalid for JWT verification failure', async () => {
      const refreshToken = 'invalidJwtToken'
      const error = new Error('JWT verification failed')
      
      jwt.verify.mockImplementation(() => {
        throw error
      })
      
      const result = await authService.verifyRefreshToken(refreshToken)
      
      expect(result).toEqual({ valid: false, error: 'Invalid token' })
    })
  })
})