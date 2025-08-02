const express = require('express')
const router = express.Router()
const db = require('../config/database')

// Debug endpoint to test connectivity and data
router.get('/test', async (req, res) => {
  try {
    // Test database connection
    const scenarios = await db('scenarios').select('id', 'title').limit(3)
    const characters = await db('ai_characters').select('id', 'name').limit(3)

    res.json({
      success: true,
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      data: {
        scenarios_count: scenarios.length,
        characters_count: characters.length,
        scenarios,
        characters
      },
      headers: {
        origin: req.get('Origin'),
        user_agent: req.get('User-Agent')
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Debug test failed',
      message: error.message,
      stack: error.stack
    })
  }
})

// Test CORS specifically
router.get('/cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.get('Origin'),
    method: req.method,
    headers: req.headers
  })
})

// Test scenario endpoint specifically
router.get('/scenarios', async (req, res) => {
  try {
    const scenarios = await db('scenarios')
      .where('is_active', true)
      .select('id', 'title', 'description', 'difficulty_level')
      .orderBy('difficulty_level', 'asc')

    res.json({
      success: true,
      message: 'Debug scenarios endpoint working',
      count: scenarios.length,
      data: scenarios
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Debug scenarios test failed',
      message: error.message
    })
  }
})

module.exports = router
