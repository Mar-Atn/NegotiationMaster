/**
 * Auth Controller Unit Tests
 * 
 * Comprehensive testing for authentication controller endpoints including
 * user registration, login, token refresh, and security validations.
 */

const request = require('supertest')
const express = require('express')
const AuthController = require('../../controllers/authController')
const authService = require('../../services/authService')

// Mock dependencies
jest.mock('../../config/database')
jest.mock('../../services/authService')

const db = require('../../config/database')

describe('AuthController', () => {
  let app
  let authController

  beforeEach(() => {
    app = express()
    app.use(express.json())
    authController = new AuthController()
    
    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'securePassword123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      const hashedPassword = 'hashedPassword123'
      const userId = 'user-123'
      const mockUser = {
        id: userId,
        email: userData.email,
        username: userData.username,
        first_name: userData.firstName,
        last_name: userData.lastName,
        created_at: new Date().toISOString()
      }
      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken'
      }
      
      // Mock database queries
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      })
      db.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue()
      })
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser)
      })
      db.mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue()
      })
      
      // Mock auth service methods
      authService.hashPassword.mockResolvedValue(hashedPassword)
      authService.generateTokens.mockReturnValue(mockTokens)
      authService.storeRefreshToken.mockResolvedValue()
      
      // Mock crypto.randomUUID
      require('crypto').randomUUID = jest.fn()
        .mockReturnValueOnce(userId)
        .mockReturnValueOnce('progress-123')
      
      // Create route
      app.post('/register', (req, res, next) => {
        authController.register(req, res, next)
      })
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201)
      
      expect(response.body).toEqual({
        success: true,
        message: 'User registered successfully',
        user: {
          id: userId,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          createdAt: mockUser.created_at
        },
        tokens: mockTokens
      })
      
      // Verify service calls
      expect(authService.hashPassword).toHaveBeenCalledWith(userData.password)
      expect(authService.generateTokens).toHaveBeenCalledWith(userId, userData.email)
      expect(authService.storeRefreshToken).toHaveBeenCalledWith(userId, mockTokens.refreshToken, undefined)
    })

    it('should return error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'securePassword123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      const existingUser = {
        id: 'existing-user-id',
        email: userData.email,
        username: 'differentuser'
      }
      
      // Mock existing user found
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(existingUser)
      })
      
      app.post('/register', (req, res, next) => {
        authController.register(req, res, next)
      })
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Email already registered',
        code: 'USER_EXISTS'
      })
    })

    it('should return error if username already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'existinguser',
        password: 'securePassword123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      const existingUser = {
        id: 'existing-user-id',
        email: 'different@example.com',
        username: userData.username
      }
      
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(existingUser)
      })
      
      app.post('/register', (req, res, next) => {
        authController.register(req, res, next)
      })
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Username already taken',
        code: 'USER_EXISTS'
      })
    })

    it('should handle database errors during registration', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'securePassword123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      const dbError = new Error('Database connection failed')
      
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        first: jest.fn().mockRejectedValue(dbError)
      })
      
      app.post('/register', (req, res, next) => {
        authController.register(req, res, next)
      })
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(500)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      })
    })
  })

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'correctPassword123'
      }
      
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        username: 'testuser',
        password_hash: 'hashedPassword',
        first_name: 'Test',
        last_name: 'User'
      }
      
      const mockTokens = {
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken'
      }
      
      // Mock database query
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser)
      })
      
      // Mock auth service methods
      authService.comparePassword.mockResolvedValue(true)
      authService.generateTokens.mockReturnValue(mockTokens)
      authService.storeRefreshToken.mockResolvedValue()
      
      app.post('/login', (req, res, next) => {
        authController.login(req, res, next)
      })
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        message: 'Login successful',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
          firstName: mockUser.first_name,
          lastName: mockUser.last_name
        },
        tokens: mockTokens
      })
      
      expect(authService.comparePassword).toHaveBeenCalledWith(loginData.password, mockUser.password_hash)
      expect(authService.generateTokens).toHaveBeenCalledWith(mockUser.id, mockUser.email)
    })

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }
      
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      })
      
      app.post('/login', (req, res, next) => {
        authController.login(req, res, next)
      })
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    })

    it('should return error for incorrect password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongPassword'
      }
      
      const mockUser = {
        id: 'user-123',
        email: loginData.email,
        password_hash: 'hashedPassword'
      }
      
      db.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockUser)
      })
      
      authService.comparePassword.mockResolvedValue(false)
      
      app.post('/login', (req, res, next) => {
        authController.login(req, res, next)
      })
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    })
  })

  describe('refresh', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const refreshToken = 'validRefreshToken'
      const mockVerificationResult = {
        valid: true,
        userId: 'user-123',
        email: 'test@example.com'
      }
      const newTokens = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken'
      }
      
      authService.verifyRefreshToken.mockResolvedValue(mockVerificationResult)
      authService.generateTokens.mockReturnValue(newTokens)
      authService.revokeRefreshToken.mockResolvedValue()
      authService.storeRefreshToken.mockResolvedValue()
      
      app.post('/refresh', (req, res, next) => {
        authController.refresh(req, res, next)
      })
      
      const response = await request(app)
        .post('/refresh')
        .send({ refreshToken })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        tokens: newTokens
      })
      
      expect(authService.verifyRefreshToken).toHaveBeenCalledWith(refreshToken)
      expect(authService.generateTokens).toHaveBeenCalledWith(mockVerificationResult.userId, mockVerificationResult.email)
      expect(authService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken)
      expect(authService.storeRefreshToken).toHaveBeenCalledWith(mockVerificationResult.userId, newTokens.refreshToken, undefined)
    })

    it('should return error for invalid refresh token', async () => {
      const refreshToken = 'invalidRefreshToken'
      const mockVerificationResult = {
        valid: false,
        error: 'Token expired'
      }
      
      authService.verifyRefreshToken.mockResolvedValue(mockVerificationResult)
      
      app.post('/refresh', (req, res, next) => {
        authController.refresh(req, res, next)
      })
      
      const response = await request(app)
        .post('/refresh')
        .send({ refreshToken })
        .expect(401)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Invalid refresh token',
        code: 'INVALID_TOKEN'
      })
    })

    it('should return error if refresh token is missing', async () => {
      app.post('/refresh', (req, res, next) => {
        authController.refresh(req, res, next)
      })
      
      const response = await request(app)
        .post('/refresh')
        .send({})
        .expect(400)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Refresh token is required',
        code: 'MISSING_TOKEN'
      })
    })
  })

  describe('logout', () => {
    it('should successfully logout and revoke refresh token', async () => {
      const refreshToken = 'validRefreshToken'
      
      authService.revokeRefreshToken.mockResolvedValue()
      
      app.post('/logout', (req, res, next) => {
        authController.logout(req, res, next)
      })
      
      const response = await request(app)
        .post('/logout')
        .send({ refreshToken })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      })
      
      expect(authService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken)
    })

    it('should handle logout without refresh token gracefully', async () => {
      app.post('/logout', (req, res, next) => {
        authController.logout(req, res, next)
      })
      
      const response = await request(app)
        .post('/logout')
        .send({})
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        message: 'Logged out successfully'
      })
    })

    it('should handle errors during token revocation', async () => {
      const refreshToken = 'validRefreshToken'
      const revokeError = new Error('Database error during revocation')
      
      authService.revokeRefreshToken.mockRejectedValue(revokeError)
      
      app.post('/logout', (req, res, next) => {
        authController.logout(req, res, next)
      })
      
      const response = await request(app)
        .post('/logout')
        .send({ refreshToken })
        .expect(500)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle unexpected errors with proper error response', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      }
      
      // Mock an unexpected error
      authService.hashPassword.mockRejectedValue(new Error('Unexpected service error'))
      
      app.post('/register', (req, res, next) => {
        authController.register(req, res, next)
      })
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(500)
      
      expect(response.body).toEqual({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      })
    })
  })
})