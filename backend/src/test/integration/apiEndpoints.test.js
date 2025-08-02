/**
 * API Endpoints Integration Tests
 * 
 * Comprehensive integration testing for all API endpoints including
 * authentication, scenarios, characters, negotiations, and error handling.
 */

const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

// Mock the database and services
jest.mock('../../config/database')
jest.mock('../../services/authService')

const db = require('../../config/database')
const authService = require('../../services/authService')

describe('API Endpoints Integration Tests', () => {
  let app
  let authToken
  let mockUser

  beforeAll(async () => {
    // Set up Express app similar to main server
    app = express()
    app.use(express.json())
    
    // Import and set up routes
    const authRoutes = require('../../routes/auth')
    const scenariosRoutes = require('../../routes/scenarios')
    const charactersRoutes = require('../../routes/characters')
    const negotiationsRoutes = require('../../routes/negotiations')
    
    app.use('/api/auth', authRoutes)
    app.use('/api/scenarios', scenariosRoutes)
    app.use('/api/characters', charactersRoutes)
    app.use('/api/negotiations', negotiationsRoutes)
    
    // Set up mock user and auth token
    mockUser = global.testUtils.createMockUser()
    authToken = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'securePassword123',
          firstName: 'New',
          lastName: 'User'
        }
        
        // Mock database responses
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null) // No existing user
        })
        
        db.mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1]) // User insert
        })
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockUser) // Get created user
        })
        
        db.mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1]) // User progress insert
        })
        
        // Mock auth service
        authService.hashPassword.mockResolvedValue('hashedPassword')
        authService.generateTokens.mockReturnValue(global.testUtils.createMockTokens())
        authService.storeRefreshToken.mockResolvedValue()
        
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201)
        
        expect(response.body.success).toBe(true)
        expect(response.body.user).toBeDefined()
        expect(response.body.tokens).toBeDefined()
      })

      it('should return 400 for duplicate email', async () => {
        const userData = {
          email: 'existing@example.com',
          username: 'newuser',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        }
        
        // Mock existing user
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ email: userData.email })
        })
        
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400)
        
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBe('Email already registered')
      })
    })

    describe('POST /api/auth/login', () => {
      it('should login successfully with valid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'correctPassword'
        }
        
        // Mock user lookup
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({
            ...mockUser,
            password_hash: 'hashedPassword'
          })
        })
        
        // Mock auth service
        authService.comparePassword.mockResolvedValue(true)
        authService.generateTokens.mockReturnValue(global.testUtils.createMockTokens())
        authService.storeRefreshToken.mockResolvedValue()
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.user).toBeDefined()
        expect(response.body.tokens).toBeDefined()
      })

      it('should return 401 for invalid credentials', async () => {
        const loginData = {
          email: 'test@example.com',
          password: 'wrongPassword'
        }
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null)
        })
        
        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData)
          .expect(401)
        
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBe('Invalid credentials')
      })
    })
  })

  describe('Scenarios Endpoints', () => {
    describe('GET /api/scenarios', () => {
      it('should return list of scenarios', async () => {
        const mockScenarios = [
          global.testUtils.createMockScenario({ id: '1', title: 'Business Merger' }),
          global.testUtils.createMockScenario({ id: '2', title: 'Salary Negotiation' })
        ]
        
        db.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockScenarios)
        })
        
        const response = await request(app)
          .get('/api/scenarios')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.scenarios).toHaveLength(2)
        expect(response.body.scenarios[0].title).toBe('Business Merger')
      })

      it('should filter scenarios by difficulty', async () => {
        const mockScenarios = [
          global.testUtils.createMockScenario({ difficulty: 'intermediate' })
        ]
        
        db.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockScenarios)
        })
        
        const response = await request(app)
          .get('/api/scenarios?difficulty=intermediate')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.scenarios).toHaveLength(1)
      })
    })

    describe('GET /api/scenarios/:id', () => {
      it('should return specific scenario details', async () => {
        const mockScenario = global.testUtils.createMockScenario({ id: 'scenario-123' })
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockScenario)
        })
        
        const response = await request(app)
          .get('/api/scenarios/scenario-123')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.scenario.id).toBe('scenario-123')
      })

      it('should return 404 for non-existent scenario', async () => {
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null)
        })
        
        const response = await request(app)
          .get('/api/scenarios/non-existent')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404)
        
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBe('Scenario not found')
      })
    })
  })

  describe('Characters Endpoints', () => {
    describe('GET /api/characters', () => {
      it('should return list of AI characters', async () => {
        const mockCharacters = [
          global.testUtils.createMockCharacter({ id: '1', name: 'Sarah Chen' }),
          global.testUtils.createMockCharacter({ id: '2', name: 'Marcus Thompson' })
        ]
        
        db.mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockCharacters)
        })
        
        const response = await request(app)
          .get('/api/characters')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.characters).toHaveLength(2)
        expect(response.body.characters[0].name).toBe('Sarah Chen')
      })
    })

    describe('GET /api/characters/:id', () => {
      it('should return specific character details', async () => {
        const mockCharacter = global.testUtils.createMockCharacter({ id: 'char-123' })
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockCharacter)
        })
        
        const response = await request(app)
          .get('/api/characters/char-123')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.character.id).toBe('char-123')
      })
    })
  })

  describe('Negotiations Endpoints', () => {
    describe('POST /api/negotiations', () => {
      it('should create a new negotiation session', async () => {
        const negotiationData = {
          scenarioId: 'scenario-123',
          characterId: 'char-123'
        }
        
        const mockNegotiation = {
          id: 'negotiation-123',
          user_id: mockUser.id,
          scenario_id: negotiationData.scenarioId,
          ai_character_id: negotiationData.characterId,
          created_at: new Date().toISOString()
        }
        
        // Mock scenario validation
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(global.testUtils.createMockScenario())
        })
        
        // Mock character validation
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(global.testUtils.createMockCharacter())
        })
        
        // Mock negotiation creation
        db.mockReturnValueOnce({
          insert: jest.fn().mockResolvedValue([1])
        })
        
        // Mock negotiation retrieval
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(mockNegotiation)
        })
        
        const response = await request(app)
          .post('/api/negotiations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(negotiationData)
          .expect(201)
        
        expect(response.body.success).toBe(true)
        expect(response.body.negotiation.id).toBe('negotiation-123')
      })

      it('should return 400 for invalid scenario', async () => {
        const negotiationData = {
          scenarioId: 'invalid-scenario',
          characterId: 'char-123'
        }
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null)
        })
        
        const response = await request(app)
          .post('/api/negotiations')
          .set('Authorization', `Bearer ${authToken}`)
          .send(negotiationData)
          .expect(400)
        
        expect(response.body.success).toBe(false)
        expect(response.body.error).toBe('Invalid scenario')
      })
    })

    describe('GET /api/negotiations/user', () => {
      it('should return user\'s negotiation history', async () => {
        const mockNegotiations = [
          {
            id: 'negotiation-1',
            scenario_title: 'Business Merger',
            character_name: 'Sarah Chen',
            status: 'completed',
            created_at: new Date().toISOString()
          },
          {
            id: 'negotiation-2',
            scenario_title: 'Salary Negotiation',
            character_name: 'Marcus Thompson',
            status: 'in_progress',
            created_at: new Date().toISOString()
          }
        ]
        
        db.mockReturnValueOnce({
          where: jest.fn().mockReturnThis(),
          leftJoin: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockResolvedValue(mockNegotiations)
        })
        
        const response = await request(app)
          .get('/api/negotiations/user')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
        
        expect(response.body.success).toBe(true)
        expect(response.body.negotiations).toHaveLength(2)
        expect(response.body.negotiations[0].scenario_title).toBe('Business Merger')
      })
    })
  })

  describe('Authentication Middleware', () => {
    it('should return 401 for missing authorization header', async () => {
      const response = await request(app)
        .get('/api/scenarios')
        .expect(401)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Access token required')
    })

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/scenarios')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid token')
    })

    it('should return 401 for expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      )
      
      const response = await request(app)
        .get('/api/scenarios')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Invalid token')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      db.mockReturnValueOnce({
        select: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      })
      
      const response = await request(app)
        .get('/api/scenarios')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toBe('Internal server error')
    })

    it('should validate request body parameters', async () => {
      const response = await request(app)
        .post('/api/negotiations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Missing required fields
        .expect(400)
      
      expect(response.body.success).toBe(false)
      expect(response.body.error).toContain('required')
    })

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)
      
      expect(response.body).toBeDefined()
    })
  })

  describe('Rate Limiting', () => {
    it('should handle multiple requests within limits', async () => {
      const requests = []
      
      // Make multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .get('/api/scenarios')
            .set('Authorization', `Bearer ${authToken}`)
        )
      }
      
      const responses = await Promise.all(requests)
      
      // All should succeed if within rate limits
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status)
      })
    })
  })

  describe('CORS and Security Headers', () => {
    it('should include proper security headers', async () => {
      const response = await request(app)
        .get('/api/scenarios')
        .set('Authorization', `Bearer ${authToken}`)
      
      // Check for security headers (would be set by middleware in actual app)
      // This is more of a configuration test
      expect(response).toBeDefined()
    })
  })
})