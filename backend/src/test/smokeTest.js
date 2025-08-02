// Smoke tests for demo readiness
const request = require('supertest');
const app = require('../server');

describe('NegotiationMaster Smoke Tests', () => {
  test('Health endpoint responds', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
  });

  test('Characters endpoint returns data', async () => {
    const response = await request(app)
      .get('/api/characters')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('Scenarios endpoint returns data', async () => {
    const response = await request(app)
      .get('/api/scenarios')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('Voice config endpoint works', async () => {
    const response = await request(app)
      .get('/api/voice/character-configs')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Object.keys(response.body.data).length).toBeGreaterThan(0);
  });
});

// Run smoke test
if (require.main === module) {
  console.log('Running smoke tests...');
  // Simple test runner for demo
}