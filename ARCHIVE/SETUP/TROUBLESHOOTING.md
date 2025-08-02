# Troubleshooting - Connection Issues

## Backend Captain Diagnosis: "Unable to connect" Error

The backend server is running correctly on port 5000 and all API endpoints are functional. The connection issue is likely in the frontend configuration.

### ✅ Backend Status - WORKING
- ✅ Server running on http://localhost:5000
- ✅ Database connected with 3 scenarios and 3 characters
- ✅ All API endpoints responding correctly
- ✅ CORS configured for http://localhost:3000

### 🔍 Debug Endpoints Available
Test these URLs in your browser to verify backend connectivity:

```
http://localhost:5000/health
http://localhost:5000/api/debug/test
http://localhost:5000/api/scenarios
http://localhost:5000/api/characters
```

### 🎯 Most Likely Causes

1. **Frontend API Base URL Misconfiguration**
   - Check if frontend is trying to connect to the wrong port
   - Ensure API base URL is set to `http://localhost:5000`

2. **Frontend Server Not Running on Port 3000**
   - Backend CORS is configured for `http://localhost:3000`
   - If frontend runs on different port, CORS will block requests

3. **Network/Firewall Issues**
   - Firewall blocking port 5000
   - Proxy settings interfering with localhost requests

### 🔧 Quick Fixes

#### For Frontend Team:
1. **Check API Configuration:**
   ```javascript
   // In your frontend config/constants
   const API_BASE_URL = 'http://localhost:5000/api'
   ```

2. **Test Direct API Call:**
   ```javascript
   // Test in browser console
   fetch('http://localhost:5000/api/scenarios')
     .then(r => r.json())
     .then(console.log)
     .catch(console.error)
   ```

3. **Verify Frontend Port:**
   ```bash
   # Frontend should run on port 3000
   npm start  # Should start on localhost:3000
   ```

#### For Backend Captain (if needed):
1. **Update CORS Origins:**
   ```javascript
   // In backend/src/server.js - line 20
   const corsOptions = {
     origin: ['http://localhost:3000', 'http://localhost:3001'], // Add other ports if needed
     credentials: true,
     optionsSuccessStatus: 200
   }
   ```

### 📊 Working API Endpoints

All these endpoints are tested and working:

#### Scenarios (No Auth Required)
- `GET /api/scenarios` - List all scenarios  
- `GET /api/scenarios/:id` - Get scenario details
- `GET /api/scenarios/difficulty/:level` - Filter by difficulty

#### Characters (No Auth Required)  
- `GET /api/characters` - List all AI characters
- `GET /api/characters/:id` - Get character details
- `GET /api/characters/role/:role` - Filter by role

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

#### Negotiations (Auth Required)
- `POST /api/scenarios/:id/start` - Start negotiation (creates session)
- `GET /api/negotiations` - User's negotiations  
- `GET /api/negotiations/:id` - Negotiation details
- `POST /api/negotiations/:id/messages` - Send message

### 🚨 If Problem Persists

1. **Check Browser Network Tab:**
   - Open Developer Tools → Network
   - Try clicking the scenario again
   - Look for failed requests and error messages

2. **Check Console Errors:**
   - Open Developer Tools → Console  
   - Look for JavaScript errors or network failures

3. **Test with curl:**
   ```bash
   # Test if backend is reachable
   curl http://localhost:5000/health
   curl http://localhost:5000/api/scenarios
   ```

### 📞 Backend Captain Available
Backend is fully functional. If frontend team needs:
- Additional API endpoints
- Different response formats  
- Modified CORS configuration
- Additional debugging endpoints

Just let me know! The backend infrastructure is solid and ready for integration.

---
**Backend Captain Status**: ✅ All systems operational, standing by for frontend integration