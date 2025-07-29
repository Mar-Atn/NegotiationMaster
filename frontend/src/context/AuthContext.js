import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.accessToken,
        error: null
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false
      }
    case 'TOKEN_REFRESH':
      return {
        ...state,
        token: action.payload.accessToken
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const user = localStorage.getItem('user')

      if (token && refreshToken && user) {
        try {
          const userData = JSON.parse(user)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: userData,
              accessToken: token
            }
          })
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          dispatch({ type: 'LOGOUT' })
        }
      } else {
        dispatch({ type: 'LOGOUT' })
      }
    }

    initializeAuth()
  }, [])

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await authService.login(email, password)
      
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      })
      
      return response
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || 'Login failed'
      })
      throw error
    }
  }

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' })
    
    try {
      const response = await authService.register(userData)
      
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      })
      
      return response
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.response?.data?.error || 'Registration failed'
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authService.refreshToken(refreshToken)
      
      localStorage.setItem('accessToken', response.data.accessToken)
      localStorage.setItem('refreshToken', response.data.refreshToken)
      
      dispatch({
        type: 'TOKEN_REFRESH',
        payload: response.data
      })
      
      return response.data.accessToken
    } catch (error) {
      logout()
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}