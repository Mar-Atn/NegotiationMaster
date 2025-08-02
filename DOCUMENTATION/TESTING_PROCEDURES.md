# NegotiationMaster Testing Procedures

**Version:** 2.0.0  
**Last Updated:** August 2, 2025  
**Purpose:** Comprehensive testing guide for all working features

---

## 🧪 Test Environment Setup

### Prerequisites
1. **Backend Running**: `cd backend && npm start` (Port 5000)
2. **Frontend Running**: `cd frontend && npm start` (Port 3000)
3. **Database Ready**: Migrations and seeds applied
4. **Environment Variables**: `.env` file configured with ElevenLabs API key

### Test Accounts
```
Regular User:
Email: user@user.com
Password: user

Admin User:
Email: admin@admin.com
Password: admin
```

---

## ✅ Feature Testing Procedures

### 1. Authentication System Testing

#### 1.1 User Registration
```bash
# Test via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Expected: 201 Created with user object and tokens
```

**Frontend Testing:**
1. Navigate to http://localhost:3000/register
2. Fill form with valid data
3. Submit and verify redirect to dashboard
4. Check localStorage for auth tokens

#### 1.2 User Login
```bash
# Test via API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@user.com",
    "password": "user"
  }'

# Expected: 200 OK with tokens
```

**Frontend Testing:**
1. Navigate to http://localhost:3000/login
2. Enter credentials: user@user.com / user
3. Verify redirect to dashboard
4. Confirm auth context updated

#### 1.3 Token Refresh
```bash
# Test refresh token rotation
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'

# Expected: New access and refresh tokens
```

#### 1.4 Protected Route Access
```bash
# Test with valid token
curl -X GET http://localhost:5000/api/negotiations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: 200 OK with user's negotiations

# Test without token
curl -X GET http://localhost:5000/api/negotiations

# Expected: 401 Unauthorized
```

---

### 2. Voice Conversation Testing

#### 2.1 ElevenLabs Integration Check
```bash
# Verify voice service health
curl -X GET http://localhost:5000/api/voice/metrics \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Expected: Metrics showing ElevenLabs connected
```

#### 2.2 Voice Conversation with Sarah Chen
**Frontend Testing Steps:**
1. Login as user@user.com
2. Navigate to Dashboard
3. Click "Car Purchase Negotiation" scenario
4. Click "Start Voice Conversation"
5. **Browser Requirements**: Chrome or Edge (Firefox not supported)
6. Allow microphone permissions when prompted
7. Wait for "Connected" status
8. Speak clearly: "Hello Sarah, I'm interested in the Honda Accord"
9. Verify you hear Sarah's voice response
10. Continue conversation naturally
11. Test interruption by speaking while AI talks
12. End conversation with "Thank you, goodbye"

**Expected Behaviors:**
- Voice responses within 2-3 seconds
- Clear audio quality
- Natural conversation flow
- Transcript appears in real-time
- Performance metrics update live

#### 2.3 WebSocket Connection Test
```javascript
// Browser console test
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected:', socket.id));
socket.emit('join-negotiation', 'test-negotiation-id');
socket.on('voice-stream-acknowledged', (data) => console.log('Stream ready:', data));
```

---

### 3. Database Integrity Verification

#### 3.1 Check Core Data
```bash
# Connect to SQLite database
cd backend
sqlite3 dev.sqlite3

# Verify tables exist
.tables

# Check user data
SELECT * FROM users LIMIT 5;

# Check scenarios
SELECT id, title, difficulty_level FROM scenarios WHERE is_active = 1;

# Check Sarah Chen character
SELECT name, role, description FROM ai_characters WHERE name = 'Sarah Chen';

# Exit SQLite
.quit
```

#### 3.2 Test Data Relationships
```sql
-- Check user has negotiations
SELECT n.* FROM negotiations n 
JOIN users u ON n.user_id = u.id 
WHERE u.email = 'user@user.com';

-- Verify messages saved
SELECT * FROM messages 
WHERE negotiation_id IN (
  SELECT id FROM negotiations WHERE user_id = (
    SELECT id FROM users WHERE email = 'user@user.com'
  )
);
```

---

### 4. Frontend Functionality Testing

#### 4.1 Page Navigation
- [x] `/` - Home page loads
- [x] `/login` - Login form displays
- [x] `/register` - Registration form works
- [x] `/dashboard` - Protected, requires login
- [x] `/negotiation/:id` - Chat interface loads
- [x] `/academic-prototype` - Two-panel interface

#### 4.2 Component Testing
**VoiceConversation Component:**
1. Microphone permission handling
2. Audio visualization during speech
3. Transcript updates in real-time
4. Error handling for disconnections
5. Clean session termination

**LiveFeedback Component:**
1. Real-time skill meters update
2. Three dimensions display correctly
3. Smooth animations
4. Coaching tips appear

**NegotiationChat Component:**
1. Message history displays
2. Input field works
3. Send button enabled/disabled correctly
4. AI responses appear
5. Scroll behavior correct

---

### 5. Performance Testing

#### 5.1 Response Time Benchmarks
```bash
# Test API response times
time curl -X GET http://localhost:5000/api/scenarios

# Expected: < 100ms

# Test voice latency
# Start voice conversation and measure time between:
# - End of user speech
# - Start of AI response
# Target: < 500ms
```

#### 5.2 Concurrent User Test
```javascript
// Test multiple WebSocket connections
for (let i = 0; i < 5; i++) {
  const socket = io('http://localhost:5000');
  socket.on('connect', () => {
    console.log(`Client ${i} connected`);
    socket.emit('join-negotiation', `test-${i}`);
  });
}
```

#### 5.3 Memory Usage Monitoring
```bash
# Monitor backend memory
ps aux | grep node | grep server.js

# Check for memory leaks during extended voice sessions
# Memory should stabilize after initial growth
```

---

### 6. Error Handling Verification

#### 6.1 Network Disconnection
1. Start voice conversation
2. Disconnect network (airplane mode)
3. Verify graceful error message
4. Reconnect network
5. Verify recovery possible

#### 6.2 Invalid API Requests
```bash
# Test validation
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'

# Expected: 400 Bad Request with validation errors
```

#### 6.3 Database Connection Loss
1. Stop database temporarily
2. Try to login
3. Verify error handling
4. Restart database
5. Verify recovery

---

### 7. Security Testing

#### 7.1 JWT Token Validation
```bash
# Test expired token
curl -X GET http://localhost:5000/api/negotiations \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Expected: 401 Token expired

# Test malformed token
curl -X GET http://localhost:5000/api/negotiations \
  -H "Authorization: Bearer malformed.token.here"

# Expected: 401 Invalid token
```

#### 7.2 SQL Injection Prevention
```bash
# Test SQL injection attempt
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@user.com'; DROP TABLE users; --",
    "password": "test"
  }'

# Expected: Login fails, database intact
```

#### 7.3 XSS Prevention
1. Try to send message with `<script>alert('XSS')</script>`
2. Verify script is escaped in display
3. No alert should execute

---

### 8. Rollback Validation

#### 8.1 Code Rollback Test
```bash
# Save current working state
git add .
git commit -m "Working state backup"
git tag working-backup

# Make breaking change
# Edit backend/src/server.js - break something

# Test that it's broken
npm start # Should fail

# Rollback
git checkout working-backup

# Verify restored
npm start # Should work
```

#### 8.2 Database Rollback
```bash
cd backend

# Backup current database
cp dev.sqlite3 dev.sqlite3.backup

# Run migration rollback
npm run migrate:rollback

# Check tables removed
sqlite3 dev.sqlite3 ".tables"

# Restore
npm run migrate:latest
npm run seed:run
```

---

## 📊 Testing Checklist Summary

### Core Functionality
- [ ] User registration works
- [ ] User login succeeds
- [ ] JWT tokens refresh properly
- [ ] Protected routes enforce auth
- [ ] Voice conversation initiates
- [ ] Sarah Chen responds appropriately
- [ ] Audio quality acceptable
- [ ] Transcript captures speech
- [ ] Performance metrics display
- [ ] Database stores conversations
- [ ] WebSocket connections stable
- [ ] Error handling graceful

### Browser Compatibility
- [ ] Chrome: Full support ✅
- [ ] Edge: Full support ✅
- [ ] Safari: Limited (no voice) ⚠️
- [ ] Firefox: Not supported ❌

### Performance Targets
- [ ] API responses < 100ms
- [ ] Voice latency < 500ms
- [ ] Page load < 3 seconds
- [ ] Smooth UI animations
- [ ] No memory leaks

---

## 🚨 Known Issues & Workarounds

### Issue: Firefox Voice Not Working
**Workaround:** Use Chrome or Edge browser

### Issue: Microphone Permission Denied
**Fix:** 
1. Click address bar padlock icon
2. Reset permissions
3. Reload page
4. Allow when prompted

### Issue: Voice Cuts Out
**Fix:**
1. Check network stability
2. Refresh page
3. Restart conversation

### Issue: Login Loops Back
**Fix:**
1. Clear browser localStorage
2. Delete cookies for localhost
3. Try incognito mode

---

## 🔧 Debugging Commands

### Backend Logs
```bash
# View real-time logs
cd backend
tail -f logs/combined.log

# View errors only
tail -f logs/error.log

# Search for specific errors
grep -i "error" logs/combined.log
```

### Frontend Debugging
```javascript
// Browser console commands

// Check auth state
JSON.parse(localStorage.getItem('accessToken'))

// Monitor WebSocket
window.socket = io('http://localhost:5000');
window.socket.on('*', console.log);

// Check API calls
fetch('/api/health').then(r => r.json()).then(console.log)
```

### Database Queries
```sql
-- Recent negotiations
SELECT * FROM negotiations 
ORDER BY created_at DESC 
LIMIT 10;

-- Check voice session data
SELECT * FROM messages 
WHERE negotiation_id = 'YOUR_ID' 
ORDER BY timestamp;

-- User activity
SELECT u.email, COUNT(n.id) as total_negotiations 
FROM users u 
LEFT JOIN negotiations n ON u.id = n.user_id 
GROUP BY u.id;
```

---

## 📝 Test Reporting

When reporting issues, include:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Browser and version**
5. **Console errors (F12)**
6. **Network tab screenshots**
7. **Backend logs excerpt**

---

**Testing Complete!** System ready for development continuation.