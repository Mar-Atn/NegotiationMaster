# 🚀 NegotiationMaster Demo Deployment Guide

## Quick Start (5 Minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and add your ElevenLabs API key
nano .env
# Set: ELEVENLABS_API_KEY=your_actual_api_key_here
```

### 2. Database Setup
```bash
cd backend
npm install
npm run migrate
npm run seed
cd ..
```

### 3. Docker Deployment
```bash
# Build and start all services
docker-compose up --build -d

# Check service health
docker-compose ps
```

### 4. Access Demo
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## Alternative: Local Development

### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Demo Features Ready

✅ **7 AI Characters** with distinct personalities
✅ **7 Progressive Scenarios** from basic to advanced
✅ **Voice Synthesis** with ElevenLabs integration
✅ **Real-time Chat** with WebSocket communication
✅ **Progressive Learning** with Harvard methodology
✅ **Mobile Responsive** design
✅ **Cross-browser** compatibility

## Demo Test Steps

1. **Register/Login** at http://localhost:3000
2. **Select Scenario**: Start with "Used Car Purchase"
3. **Choose Character**: Try Sarah Chen (professional seller)
4. **Voice Chat**: Enable voice mode and have a conversation
5. **Progress**: Complete scenario and check feedback
6. **Advanced**: Try "Business Partnership" scenario

## Troubleshooting

**Voice Not Working?**
- Check ElevenLabs API key in .env
- Verify browser permissions for microphone
- Try Chrome/Firefox for best compatibility

**Database Issues?**
- Run: `npm run migrate` in backend folder
- Run: `npm run seed` to populate characters/scenarios

**Docker Issues?**
- Ensure Docker is running
- Try: `docker-compose down && docker-compose up --build`

## Production Notes

- Set strong JWT_SECRET in production
- Use environment-specific .env files
- Consider Redis for session management
- Set up SSL certificates for HTTPS
- Monitor ElevenLabs API usage

## Tech Stack

- **Backend**: Node.js, Express, SQLite, Socket.io
- **Frontend**: React, Material-UI, WebSocket
- **Voice**: ElevenLabs API integration
- **Deployment**: Docker, Nginx, Docker Compose