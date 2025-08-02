# Authentication Troubleshooting Guide

## Issue: "Invalid or expired token" (403 Forbidden)

### Symptoms:
- API calls return HTTP 403 Forbidden
- Console shows: `❌ API Response Error: status: 403`
- User appears logged in but can't access protected routes

### Root Cause:
JWT tokens have expired (both access and refresh tokens)

### Solutions:

#### Solution 1: Force User Re-login (Recommended)
Add token expiration detection to Frontend:

```javascript
// In apiService.js response interceptor - ADD THIS:
if (error.response?.status === 403 && error.response?.data?.code === 'TOKEN_INVALID') {
  console.log('🔄 Token expired, forcing re-login...')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken') 
  localStorage.removeItem('user')
  window.location.href = '/login'
  return Promise.reject(error)
}
```

#### Solution 2: Manual Clear LocalStorage
In browser console:
```javascript
localStorage.clear()
window.location.reload()
```

#### Solution 3: Backend - Extend Token Lifetime (Development Only)
In `authService.js`:
```javascript
// Change from 15 minutes to 24 hours for development
expiresIn: '24h'  // instead of '15m'
```

### Prevention:
1. Implement proper token refresh flow
2. Show clear "session expired" messages
3. Add token expiration countdown in UI
4. Auto-refresh tokens before expiration

### Current Status:
- ✅ Authentication system working correctly
- ✅ Token validation working  
- ✅ Debug logging implemented
- ⚠️ User has expired tokens - needs fresh login