/**
 * Test Setup Configuration
 * 
 * This file runs before all tests and sets up the testing environment,
 * including database configuration, mocks, and global test utilities.
 */

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' })

const knex = require('knex')
const mockdate = require('mockdate')

// Global test database instance
let testDb

beforeAll(async () => {
  // Set up in-memory database for testing
  testDb = knex({
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: './src/database/migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  })
  
  // Run migrations
  await testDb.migrate.latest()
  
  // Make database available globally
  global.testDb = testDb
})

afterAll(async () => {
  // Clean up database connection
  if (testDb) {
    await testDb.destroy()
  }
})

beforeEach(async () => {
  // Reset database to clean state before each test
  if (testDb) {
    // Clear all tables except migrations
    const tables = await testDb.raw(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'knex_%' AND name NOT LIKE 'sqlite_%'
    `)
    
    for (const table of tables) {
      await testDb(table.name).del()
    }
  }
})

afterEach(() => {
  // Reset mocked dates
  mockdate.reset()
  
  // Clear all mocks
  jest.clearAllMocks()
})

// Mock ElevenLabs API globally
jest.mock('@elevenlabs/elevenlabs-js', () => ({
  ElevenLabsClient: jest.fn().mockImplementation(() => ({
    textToSpeech: {
      convertWithTimestamps: jest.fn().mockResolvedValue({
        audio: Buffer.from('mock-audio-data'),
        alignment: {
          characters: [],
          character_start_times_seconds: [],
          character_end_times_seconds: []
        }
      }),
      convert: jest.fn().mockResolvedValue(Buffer.from('mock-audio-data')),
      stream: jest.fn().mockResolvedValue({
        on: jest.fn(),
        pipe: jest.fn()
      })
    },
    voices: {
      search: jest.fn().mockResolvedValue({
        voices: [
          {
            voice_id: '21m00Tcm4TlvDq8ikWAM',
            name: 'Rachel',
            category: 'premade'
          },
          {
            voice_id: 'ErXwobaYiN019PkySvjV',
            name: 'Antoni',
            category: 'premade'
          }
        ]
      })
    }
  })),
}))

// Mock Winston logger
jest.mock('../config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }))
}))

// Mock Socket.IO
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    use: jest.fn(),
    engine: {
      generateId: jest.fn(() => 'mock-socket-id')
    }
  }))
}))

// Global test utilities
global.testUtils = {
  // Create a mock user for testing
  createMockUser: (overrides = {}) => ({
    id: 'test-user-123',
    email: 'test@example.com',
    username: 'testuser',
    first_name: 'Test',
    last_name: 'User',
    created_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Create mock JWT tokens
  createMockTokens: () => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  }),
  
  // Create mock voice synthesis result
  createMockVoiceResult: (overrides = {}) => ({
    success: true,
    audioBuffer: Buffer.from('mock-audio-data'),
    metadata: {
      characterName: 'Sarah Chen',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      latency: 250,
      audioSize: 1024
    },
    ...overrides
  }),
  
  // Create mock negotiation scenario
  createMockScenario: (overrides = {}) => ({
    id: 'scenario-123',
    title: 'Mock Negotiation Scenario',
    description: 'A test scenario for negotiation training',
    difficulty: 'intermediate',
    category: 'business',
    ai_character_id: 'character-123',
    created_at: new Date().toISOString(),
    ...overrides
  }),
  
  // Create mock AI character
  createMockCharacter: (overrides = {}) => ({
    id: 'character-123',
    name: 'Sarah Chen',
    personality: 'Professional and assertive',
    background: 'Senior Business Executive',
    voice_settings: {
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      stability: 0.65,
      similarityBoost: 0.85
    },
    created_at: new Date().toISOString(),
    ...overrides
  })
}

// Console override for cleaner test output
const originalConsole = global.console
global.console = {
  ...originalConsole,
  // Suppress log/info during tests unless in debug mode
  log: process.env.DEBUG_TESTS ? originalConsole.log : jest.fn(),
  info: process.env.DEBUG_TESTS ? originalConsole.info : jest.fn(),
  // Keep error and warn for debugging
  error: originalConsole.error,
  warn: originalConsole.warn
}