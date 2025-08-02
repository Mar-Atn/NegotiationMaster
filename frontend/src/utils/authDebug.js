// Authentication debugging utilities
export const inspectLocalStorage = () => {
  const authData = {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: localStorage.getItem('user')
  }

  console.log('🔍 LocalStorage Auth Inspection:', {
    hasAccessToken: !!authData.accessToken,
    hasRefreshToken: !!authData.refreshToken,
    hasUser: !!authData.user,
    accessToken: authData.accessToken ? `${authData.accessToken.substring(0, 30)}...` : 'No token',
    refreshToken: authData.refreshToken ? `${authData.refreshToken.substring(0, 30)}...` : 'No refresh token',
    user: authData.user ? JSON.parse(authData.user) : 'No user data',
    allKeys: Object.keys(localStorage)
  })

  return authData
}

export const clearAllAuthData = () => {
  console.log('🗑️ Clearing all auth data from localStorage')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

// Add to window for easy browser console access
if (typeof window !== 'undefined') {
  window.authDebug = {
    inspect: inspectLocalStorage,
    clear: clearAllAuthData
  }
}