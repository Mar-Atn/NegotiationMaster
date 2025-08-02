# NegotiationMaster Setup Instructions

**Version:** 1.1.0  
**Status:** Voice Integration Complete  
**Last Updated:** August 1, 2025

---

## 🚀 Quick Start (Voice-Enabled Platform)

### **Prerequisites**
- Node.js 18+ installed
- Chrome or Edge browser (Firefox has voice limitations)
- Internet connection for ElevenLabs API

### **1. Clone and Install**
```bash
# Clone repository
git clone <repository-url>
cd NegotiationMaster

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### **2. Environment Configuration**

**Backend (.env file in /backend/):**
```env
# Database
DATABASE_URL=sqlite:./dev.sqlite3

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43
ELEVENLABS_AGENT_ID=agent_7601k1g0796kfj2bzkcds0bkmw2m

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env file in /frontend/):**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ELEVENLABS_API_KEY=sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43
```

### **3. Start the Application**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### **4. Test Voice Integration**

1. **Login:** Navigate to http://localhost:3000/login
   - Email: `test@test.com`
   - Password: `test`

2. **Voice Test:** Navigate to http://localhost:3000/voice-test
   - Click "Start Conversation"
   - Allow microphone access
   - Speak naturally with Sarah Chen AI character

---

## 🎯 ElevenLabs Configuration Details

### **Working Agent Configuration**
- **Agent ID:** `agent_7601k1g0796kfj2bzkcds0bkmw2m`
- **API Key:** `sk_70c12500fe1bbc13c9f34cbcf34cef8f7e45d5524b88fd43`
- **Character:** Sarah Chen (Professional negotiation trainer)
- **Voice Model:** ElevenLabs Conversational AI
- **Language:** English (en)
- **Response Model:** GPT-4o-mini

### **Voice Service Features**
- Real-time voice synthesis
- Speech recognition with voice activity detection
- WebSocket-based conversation streaming
- Automatic conversation transcription
- Error handling with fallback modes

---

## 🔧 Development Environment

### **Database Setup**
The SQLite database is pre-configured with:
- User authentication system
- Character definitions (9 AI personalities)
- Negotiation scenarios (11 progressive scenarios)
- Test user account (test@test.com/test)

### **API Endpoints**
- **Authentication:** `POST /api/auth/login`, `POST /api/auth/register`
- **Voice Service:** `POST /api/voice/start-conversation`
- **Characters:** `GET /api/characters`
- **Scenarios:** `GET /api/scenarios`

### **WebSocket Events**
- `voice-session-ready`: Conversation initialized
- `voice-transcript`: User speech transcribed
- `voice-response`: AI character response
- `conversation-ended`: Session terminated

---

## 🌐 Browser Compatibility

### **Recommended Browsers**
- ✅ **Chrome 90+** (Fully supported)
- ✅ **Edge 90+** (Fully supported)
- ⚠️ **Firefox 88+** (Limited voice support)
- ❌ **Safari** (Not tested - may have issues)

### **Required Permissions**
- Microphone access for speech recognition
- Audio playback for AI voice responses
- WebSocket connections for real-time communication

---

## 🧪 Testing Voice Integration

### **Manual Testing Steps**
1. Login with test credentials
2. Navigate to voice test page
3. Start conversation with Sarah Chen
4. Verify audio input/output working
5. Complete short negotiation dialogue
6. Check transcript accuracy

### **Automated Testing**
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test

# Voice integration test
node test_voice_integration.js
```

---

## 🚨 Troubleshooting

### **Common Issues**

**"Microphone not accessible"**
- Ensure browser permissions granted
- Check system microphone settings
- Try refreshing the page

**"Voice service connection failed"**
- Verify ElevenLabs API key is valid
- Check internet connection
- Confirm backend server is running

**"CORS errors in browser console"**
- Verify CORS_ORIGINS in backend .env
- Ensure frontend is running on correct port
- Check backend server logs

**"Authentication failures"**
- Verify test credentials: test@test.com/test
- Check JWT secrets in backend .env
- Clear browser cookies and try again

### **Debug Mode**
Set `DEBUG=true` in backend .env for detailed logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

---

## 📊 Performance Optimization

### **Voice Latency Optimization**
- ElevenLabs Conversational AI: ~500ms response time
- WebSocket streaming: Real-time audio chunks
- Browser audio processing: Minimal buffering

### **System Requirements**
- **CPU:** Modern dual-core processor
- **RAM:** 4GB minimum (8GB recommended)
- **Network:** Broadband internet (1Mbps+ for voice)
- **Storage:** 500MB for application files

---

## 🔄 Next Development Phase

### **Phase 2 Priorities**
1. **Multi-Character Support:** Enable all 9 AI characters with voice
2. **Advanced Analytics:** Detailed conversation performance metrics
3. **Scenario Progression:** Complete negotiation workflow tracking
4. **Mobile Optimization:** Responsive voice interface
5. **Production Deployment:** Cloud hosting configuration

### **Phase 3 Enhancements**
1. **Custom Voice Training:** User-specific AI personalities
2. **Multi-language Support:** International scenarios
3. **Enterprise Features:** Corporate training integration
4. **Advanced AI Models:** GPT-4 integration for complex negotiations

---

**Setup Status:** ✅ **COMPLETE AND OPERATIONAL**  
**Voice Integration:** ✅ **FULLY FUNCTIONAL**  
**Ready for:** User testing and Phase 2 development